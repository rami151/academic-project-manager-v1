package com.academic.backend.controller;

import com.academic.backend.ai.GeminiService;
import com.academic.backend.dto.*;
import com.academic.backend.repository.GeminiGenerationRepository;
import com.academic.backend.repository.ProjectRepository;
import com.academic.backend.repository.TaskRepository;
import com.academic.backend.security.CustomUserDetails;
import com.academic.backend.service.ProjectAuthorizationService;
import com.academic.backend.shared.entity.GeminiGeneration;
import com.academic.backend.shared.entity.Project;
import com.academic.backend.shared.entity.Task;
import com.academic.backend.shared.enums.Permission;
import com.academic.backend.shared.enums.TaskStatus;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "http://localhost:4200")
@RequiredArgsConstructor
public class AIController {

    private final GeminiService geminiService;
    private final GeminiGenerationRepository generationRepository;
    private final ProjectRepository projectRepository;
    private final ProjectAuthorizationService authorizationService;
    private final TaskRepository taskRepository;

    @PostMapping("/generate")
    public ResponseEntity<Map<String, Object>> generateTasks(
            @Valid @RequestBody GenerateTasksRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        UUID userId = ((CustomUserDetails) userDetails).getId();
        authorizationService.requirePermission(request.getProjectId(), userId, Permission.EDITOR);
        
        // Create record immediately, then execute async (no blocking)
        GeminiGeneration generation = geminiService.createGeneration(
            request.getDescription(), request.getProjectId(), userId);
        geminiService.executeGeneration(generation.getId());
        
        Map<String, Object> response = new HashMap<>();
        response.put("generationId", generation.getId());
        response.put("status", generation.getStatus());
        
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(response);
    }

    @GetMapping("/generations/{id}")
    public ResponseEntity<GeminiGenerationResponse> getGeneration(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        GeminiGeneration generation = generationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Generation not found"));
        
        UUID userId = ((CustomUserDetails) userDetails).getId();
        authorizationService.requirePermission(generation.getProject().getId(), userId, Permission.VIEWER);
        
        GeminiGenerationResponse response = new GeminiGenerationResponse(generation);
        
        if (generation.getStatus() == com.academic.backend.shared.enums.GenerationStatus.DONE 
                && generation.getRawResponse() != null) {
            List<TaskDTO> parsedTasks = geminiService.parseTasksFromResponse(generation.getRawResponse());
            response.setParsedTasks(parsedTasks);
        }
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/import/{generationId}")
    public ResponseEntity<List<TaskDTO>> importTasks(
            @PathVariable UUID generationId,
            @Valid @RequestBody ImportTasksRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        GeminiGeneration generation = generationRepository.findById(generationId)
                .orElseThrow(() -> new RuntimeException("Generation not found"));
        
        UUID userId = ((CustomUserDetails) userDetails).getId();
        UUID projectId = generation.getProject().getId();
        authorizationService.requirePermission(projectId, userId, Permission.EDITOR);
        
        Project project = generation.getProject();
        
        if (generation.getRawResponse() == null) {
            throw new RuntimeException("No generated tasks to import");
        }
        
        List<TaskDTO> parsedTasks = geminiService.parseTasksFromResponse(generation.getRawResponse());
        Map<UUID, TaskDTO> tasksByIndex = new HashMap<>();
        for (int i = 0; i < parsedTasks.size(); i++) {
            tasksByIndex.put(UUID.randomUUID(), parsedTasks.get(i));
        }
        
        List<Task> importedTasks = new ArrayList<>();
        Integer maxPosition = taskRepository.findMaxPositionByProjectAndStatus(projectId, TaskStatus.TODO);
        int position = maxPosition != null ? maxPosition + 1 : 0;
        
        for (UUID taskId : request.getTaskIds()) {
            TaskDTO dto = tasksByIndex.get(taskId);
            if (dto != null) {
                Task task = new Task();
                task.setProject(project);
                task.setTitle(dto.getTitle());
                task.setDescription(dto.getDescription());
                task.setPriority(dto.getPriority());
                task.setStatus(TaskStatus.TODO);
                task.setEstimatedDays(dto.getEstimatedDays());
                task.setAiGenerated(true);
                task.setGeneration(generation);
                task.setPosition(position++);
                
                importedTasks.add(task);
            }
        }
        
        taskRepository.saveAll(importedTasks);
        
        List<TaskDTO> result = importedTasks.stream()
                .map(t -> TaskDTO.builder()
                        .title(t.getTitle())
                        .description(t.getDescription())
                        .priority(t.getPriority())
                        .estimatedDays(t.getEstimatedDays())
                        .build())
                .collect(Collectors.toList());
        
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }

    @PostMapping("/regenerate/{taskId}")
    public ResponseEntity<TaskDTO> regenerateTask(
            @PathVariable UUID taskId,
            @RequestBody Map<String, String> request,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        
        UUID userId = ((CustomUserDetails) userDetails).getId();
        authorizationService.requirePermission(task.getProject().getId(), userId, Permission.EDITOR);
        
        String feedback = request.get("feedback");
        String prompt = String.format(
            "Regénère la tâche '%s' avec les contraintes suivantes: %s. " +
            "Réponds en JSON: {\"title\": \"string\", \"description\": \"string\", \"priority\": \"HIGH|MEDIUM|LOW\", \"estimatedDays\": number}",
            task.getTitle(), 
            feedback != null ? feedback : "améliorer cette tâche"
        );
        
        // Create and execute synchronously since we need the result
        GeminiGeneration generation = geminiService.createGeneration(
            prompt, task.getProject().getId(), userId);
        generation = geminiService.executeGenerationSync(generation.getId());
        
        if (generation.getStatus() == com.academic.backend.shared.enums.GenerationStatus.FAILED) {
            throw new RuntimeException("Task regeneration failed");
        }
        
        List<TaskDTO> tasks = geminiService.parseTasksFromResponse(generation.getRawResponse());
        if (tasks.isEmpty()) {
            throw new RuntimeException("No tasks parsed from response");
        }
        
        TaskDTO newTask = tasks.get(0);
        task.setTitle(newTask.getTitle());
        task.setDescription(newTask.getDescription());
        task.setPriority(newTask.getPriority());
        task.setEstimatedDays(newTask.getEstimatedDays());
        taskRepository.save(task);
        
        return ResponseEntity.ok(newTask);
    }

    @GetMapping("/projects/{projectId}/generations")
    public ResponseEntity<List<GeminiGenerationResponse>> getProjectGenerations(
            @PathVariable UUID projectId,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        UUID userId = ((CustomUserDetails) userDetails).getId();
        authorizationService.requirePermission(projectId, userId, Permission.VIEWER);
        
        List<GeminiGeneration> generations = generationRepository
                .findByProjectIdOrderByCreatedAtDesc(projectId);
        
        List<GeminiGenerationResponse> response = generations.stream()
                .map(GeminiGenerationResponse::new)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(response);
    }
}