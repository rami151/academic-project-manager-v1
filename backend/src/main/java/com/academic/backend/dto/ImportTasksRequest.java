package com.academic.backend.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ImportTasksRequest {

    @NotEmpty(message = "Task IDs are required")
    private List<UUID> taskIds;
}