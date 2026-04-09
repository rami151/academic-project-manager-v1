package com.academic.backend.dto;

import com.academic.backend.shared.enums.TaskStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateTaskStatusRequest {

    @NotNull(message = "Status is required")
    private TaskStatus status;

    @NotNull(message = "Position is required")
    private Integer position;
}
