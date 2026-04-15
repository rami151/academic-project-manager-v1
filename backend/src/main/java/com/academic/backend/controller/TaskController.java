package com.academic.backend.controller;

import com.academic.backend.dto.*;
import com.academic.backend.security.CustomUserDetails;
import com.academic.backend.service.TaskService;
import com.academic.backend.shared.enums.TaskStatus;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "http://localhost:4200")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @GetMapping("/projects/{projectId}")
    public ResponseEntity<Map<TaskStatus, List<TaskResponse>>> getProjectTasks(
            @PathVariable UUID projectId,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = ((CustomUserDetails) userDetails).getId();
        Map<TaskStatus, List<TaskResponse>> tasks = taskService.getProjectTasksGrouped(projectId, userId);
        return ResponseEntity.ok(tasks);
    }

    @PostMapping
    public ResponseEntity<TaskResponse> createTask(
            @Valid @RequestBody CreateTaskRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = ((CustomUserDetails) userDetails).getId();
        TaskResponse task = taskService.createTask(request.getProjectId(), request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(task);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaskResponse> getTaskById(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = ((CustomUserDetails) userDetails).getId();
        TaskResponse task = taskService.getTaskById(id, userId);
        return ResponseEntity.ok(task);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaskResponse> updateTask(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateTaskRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = ((CustomUserDetails) userDetails).getId();
        TaskResponse updated = taskService.updateTask(id, request, userId);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = ((CustomUserDetails) userDetails).getId();
        taskService.deleteTask(id, userId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<TaskResponse> moveTask(
            @PathVariable UUID id,
            @RequestBody Map<String, Object> request,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = ((CustomUserDetails) userDetails).getId();
        
        TaskStatus status = TaskStatus.valueOf((String) request.get("status"));
        Integer position = (Integer) request.get("position");
        
        TaskResponse updated = taskService.moveTask(id, status, position, userId);
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/{id}/assign")
    public ResponseEntity<TaskResponse> assignTask(
            @PathVariable UUID id,
            @RequestBody Map<String, UUID> request,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = ((CustomUserDetails) userDetails).getId();
        UUID assigneeId = request.get("assigneeId");
        
        TaskResponse updated = taskService.assignTask(id, assigneeId, userId);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/{id}/labels")
    public ResponseEntity<TaskResponse> addLabel(
            @PathVariable UUID id,
            @RequestBody Map<String, UUID> request,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID labelId = request.get("labelId");
        
        TaskResponse updated = taskService.addLabel(id, labelId);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/overdue")
    public ResponseEntity<List<TaskResponse>> getOverdueTasks(
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = ((CustomUserDetails) userDetails).getId();
        
        List<TaskResponse> tasks = taskService.getAllOverdueTasks(userId);
        return ResponseEntity.ok(tasks);
    }
}