package com.academic.backend.dto;

import com.academic.backend.shared.enums.Priority;
import com.academic.backend.shared.enums.TaskStatus;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateTaskRequest {

    @Size(min = 3, max = 200, message = "Title must be between 3 and 200 characters")
    private String title;

    private String description;

    private TaskStatus status;

    private Priority priority;

    private LocalDateTime dueDate;

    private Integer estimatedDays;

    private UUID assignedToId;
}
