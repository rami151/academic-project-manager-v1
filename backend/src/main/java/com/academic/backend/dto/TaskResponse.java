package com.academic.backend.dto;

import com.academic.backend.shared.entity.Task;
import com.academic.backend.shared.enums.Priority;
import com.academic.backend.shared.enums.TaskStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TaskResponse {

    private UUID id;
    private UUID projectId;
    private String title;
    private String description;
    private TaskStatus status;
    private Priority priority;
    private LocalDate dueDate;
    private Integer estimatedDays;
    private Boolean aiGenerated;
    private Integer position;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String assignedToName;
    private String assignedToEmail;
    private List<String> labelNames = new ArrayList<>();

    public TaskResponse(Task task) {
        this.id = task.getId();
        this.projectId = task.getProject().getId();
        this.title = task.getTitle();
        this.description = task.getDescription();
        this.status = task.getStatus();
        this.priority = task.getPriority();
        this.dueDate = task.getDueDate();
        this.estimatedDays = task.getEstimatedDays();
        this.aiGenerated = task.getAiGenerated();
        this.position = task.getPosition();
        this.createdAt = task.getCreatedAt();
        this.updatedAt = task.getUpdatedAt();
        if (task.getAssignedTo() != null) {
            this.assignedToName = task.getAssignedTo().getName();
            this.assignedToEmail = task.getAssignedTo().getEmail();
        }
    }
}
