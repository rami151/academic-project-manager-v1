package com.academic.backend.service;

import com.academic.backend.dto.*;
import com.academic.backend.repository.ProjectRepository;
import com.academic.backend.repository.TaskRepository;
import com.academic.backend.repository.UserRepository;
import com.academic.backend.shared.entity.Task;
import com.academic.backend.shared.entity.User;
import com.academic.backend.shared.enums.Permission;
import com.academic.backend.shared.enums.TaskStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final ProjectAuthorizationService authorizationService;
    private final UserRepository userRepository;

    public TaskService(TaskRepository taskRepository,
                      ProjectRepository projectRepository,
                      ProjectAuthorizationService authorizationService,
                      UserRepository userRepository) {
        this.taskRepository = taskRepository;
        this.projectRepository = projectRepository;
        this.authorizationService = authorizationService;
        this.userRepository = userRepository;
    }

    public TaskResponse createTask(UUID projectId, CreateTaskRequest request, UUID currentUserId) {
        authorizationService.requirePermission(projectId, currentUserId, Permission.EDITOR);

        var project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        Integer maxPosition = taskRepository.findMaxPositionByProjectAndStatus(projectId, TaskStatus.TODO);
        int position = (maxPosition == null) ? 0 : maxPosition + 1;

        Task task = new Task();
        task.setProject(project);
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setPriority(request.getPriority());
        task.setDueDate(request.getDueDate());
        task.setEstimatedDays(request.getEstimatedDays());
        task.setStatus(TaskStatus.TODO);
        task.setAiGenerated(false);
        task.setPosition(position);

        if (request.getAssignedToId() != null) {
            var assignee = userRepository.findById(request.getAssignedToId()).orElse(null);
            if (assignee != null && authorizationService.isProjectMember(projectId, assignee.getId())) {
                task.setAssignedTo(assignee);
            }
        }

        Task savedTask = taskRepository.save(task);
        return new TaskResponse(savedTask);
    }

    public List<TaskResponse> getProjectTasks(UUID projectId, UUID currentUserId) {
        authorizationService.requirePermission(projectId, currentUserId, Permission.VIEWER);

        List<Task> tasks = taskRepository.findByProjectIdOrderByPositionAsc(projectId);
        return tasks.stream()
                .map(TaskResponse::new)
                .collect(Collectors.toList());
    }

    public TaskResponse updateTask(UUID taskId, UpdateTaskRequest request, UUID currentUserId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        UUID projectId = task.getProject().getId();
        authorizationService.requirePermission(projectId, currentUserId, Permission.EDITOR);

        if (request.getTitle() != null) {
            task.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            task.setDescription(request.getDescription());
        }
        if (request.getPriority() != null) {
            task.setPriority(request.getPriority());
        }
        if (request.getDueDate() != null) {
            task.setDueDate(request.getDueDate());
        }
        if (request.getEstimatedDays() != null) {
            task.setEstimatedDays(request.getEstimatedDays());
        }
        if (request.getStatus() != null) {
            task.setStatus(request.getStatus());
        }
        if (request.getAssignedToId() != null) {
            var assignee = userRepository.findById(request.getAssignedToId()).orElse(null);
            if (assignee != null && authorizationService.isProjectMember(projectId, assignee.getId())) {
                task.setAssignedTo(assignee);
            }
        }

        Task savedTask = taskRepository.save(task);
        return new TaskResponse(savedTask);
    }

    public TaskResponse updateTaskStatus(UUID taskId, UpdateTaskStatusRequest request, UUID currentUserId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        UUID projectId = task.getProject().getId();
        authorizationService.requirePermission(projectId, currentUserId, Permission.EDITOR);

        task.setStatus(request.getStatus());
        task.setPosition(request.getPosition());

        Task savedTask = taskRepository.save(task);
        return new TaskResponse(savedTask);
    }

    public void deleteTask(UUID taskId, UUID currentUserId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        UUID projectId = task.getProject().getId();
        authorizationService.requirePermission(projectId, currentUserId, Permission.EDITOR);

        taskRepository.deleteById(taskId);
    }

    public TaskResponse getTaskById(UUID taskId, UUID currentUserId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        UUID projectId = task.getProject().getId();
        authorizationService.requirePermission(projectId, currentUserId, Permission.VIEWER);

        return new TaskResponse(task);
    }
}
