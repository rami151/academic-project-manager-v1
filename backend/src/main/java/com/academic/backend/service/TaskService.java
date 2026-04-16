package com.academic.backend.service;

import com.academic.backend.dto.*;
import com.academic.backend.repository.LabelRepository;
import com.academic.backend.repository.ProjectRepository;
import com.academic.backend.repository.TaskRepository;
import com.academic.backend.repository.UserRepository;
import com.academic.backend.shared.entity.Label;
import com.academic.backend.shared.entity.Project;
import com.academic.backend.shared.entity.Task;
import com.academic.backend.shared.entity.User;
import com.academic.backend.shared.enums.Permission;
import com.academic.backend.shared.enums.TaskStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final ProjectAuthorizationService authorizationService;
    private final UserRepository userRepository;
    private final LabelRepository labelRepository;

    public TaskService(TaskRepository taskRepository,
                      ProjectRepository projectRepository,
                      ProjectAuthorizationService authorizationService,
                      UserRepository userRepository,
                      LabelRepository labelRepository) {
        this.taskRepository = taskRepository;
        this.projectRepository = projectRepository;
        this.authorizationService = authorizationService;
        this.userRepository = userRepository;
        this.labelRepository = labelRepository;
    }

    public TaskResponse createTask(UUID projectId, CreateTaskRequest request, UUID currentUserId) {
        authorizationService.requirePermission(projectId, currentUserId, Permission.EDITOR);

        var project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        TaskStatus status = request.getStatus() != null ? request.getStatus() : TaskStatus.TODO;
        Integer maxPosition = taskRepository.findMaxPositionByProjectAndStatus(projectId, status);
        int position = (maxPosition == null) ? 0 : maxPosition + 1;

        Task task = new Task();
        task.setProject(project);
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setPriority(request.getPriority());
        task.setDueDate(request.getDueDate());
        task.setEstimatedDays(request.getEstimatedDays());
        task.setStatus(status);
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

    public TaskResponse moveTask(UUID taskId, TaskStatus newStatus, int newPosition, UUID currentUserId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        UUID projectId = task.getProject().getId();
        authorizationService.requirePermission(projectId, currentUserId, Permission.EDITOR);

        TaskStatus oldStatus = task.getStatus();
        int oldPosition = task.getPosition();

        if (oldStatus == newStatus) {
            if (oldPosition < newPosition) {
                List<Task> tasksInColumn = taskRepository.findByProjectIdAndStatus(projectId, newStatus);
                for (Task t : tasksInColumn) {
                    if (t.getId().equals(taskId)) continue;
                    if (t.getPosition() > oldPosition && t.getPosition() <= newPosition) {
                        t.setPosition(t.getPosition() - 1);
                    }
                }
                taskRepository.saveAll(tasksInColumn);
            } else if (oldPosition > newPosition) {
                List<Task> tasksInColumn = taskRepository.findByProjectIdAndStatus(projectId, newStatus);
                for (Task t : tasksInColumn) {
                    if (t.getId().equals(taskId)) continue;
                    if (t.getPosition() >= newPosition && t.getPosition() < oldPosition) {
                        t.setPosition(t.getPosition() + 1);
                    }
                }
                taskRepository.saveAll(tasksInColumn);
            }
        } else {
            List<Task> oldColumnTasks = taskRepository.findByProjectIdAndStatus(projectId, oldStatus);
            for (Task t : oldColumnTasks) {
                if (t.getPosition() > oldPosition) {
                    t.setPosition(t.getPosition() - 1);
                }
            }
            taskRepository.saveAll(oldColumnTasks);

            List<Task> newColumnTasks = taskRepository.findByProjectIdAndStatus(projectId, newStatus);
            for (Task t : newColumnTasks) {
                if (t.getPosition() >= newPosition) {
                    t.setPosition(t.getPosition() + 1);
                }
            }
            taskRepository.saveAll(newColumnTasks);
        }

        task.setStatus(newStatus);
        task.setPosition(newPosition);

        Task savedTask = taskRepository.save(task);
        return new TaskResponse(savedTask);
    }

    public Map<TaskStatus, List<TaskResponse>> getProjectTasksGrouped(UUID projectId, UUID currentUserId) {
        authorizationService.requirePermission(projectId, currentUserId, Permission.VIEWER);

        List<Task> tasks = taskRepository.findByProjectIdOrderByPositionAsc(projectId);

        Map<TaskStatus, List<TaskResponse>> grouped = new LinkedHashMap<>();
        for (TaskStatus status : TaskStatus.values()) {
            grouped.put(status, new ArrayList<>());
        }

        for (Task task : tasks) {
            grouped.get(task.getStatus()).add(new TaskResponse(task));
        }

        return grouped;
    }

    public TaskResponse assignTask(UUID taskId, UUID assigneeId, UUID currentUserId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        UUID projectId = task.getProject().getId();
        authorizationService.requirePermission(projectId, currentUserId, Permission.EDITOR);

        if (!authorizationService.isProjectMember(projectId, assigneeId)) {
            throw new RuntimeException("Assignee is not a member of this project");
        }

        User assignee = userRepository.findById(assigneeId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        task.setAssignedTo(assignee);

        Task savedTask = taskRepository.save(task);
        return new TaskResponse(savedTask);
    }

    public TaskResponse addLabel(UUID taskId, UUID labelId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        Label label = labelRepository.findById(labelId)
                .orElseThrow(() -> new RuntimeException("Label not found"));

        if (!task.getProject().getId().equals(label.getProject().getId())) {
            throw new RuntimeException("Label does not belong to this project");
        }

        task.getLabels().add(label);

        Task savedTask = taskRepository.save(task);
        return new TaskResponse(savedTask);
    }

    public List<TaskResponse> getOverdueTasks(UUID projectId) {
        LocalDateTime today = LocalDateTime.now();
        List<Task> tasks = taskRepository.findOverdueTasks(projectId, today);

        return tasks.stream()
                .map(TaskResponse::new)
                .collect(Collectors.toList());
    }

    public List<TaskResponse> getAllOverdueTasks(UUID userId) {
        List<Task> allTasks = taskRepository.findAll();
        
        List<TaskResponse> overdueTasks = allTasks.stream()
                .filter(t -> t.isOverdue())
                .filter(t -> authorizationService.isProjectMember(t.getProject().getId(), userId))
                .map(TaskResponse::new)
                .collect(Collectors.toList());
        
        return overdueTasks;
    }
}
