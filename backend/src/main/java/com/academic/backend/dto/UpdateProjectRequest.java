package com.academic.backend.dto;

import com.academic.backend.shared.enums.ProjectStatus;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProjectRequest {

    @Size(min = 3, max = 200, message = "Name must be between 3 and 200 characters")
    private String name;

    private String description;

    private ProjectStatus status;

    private LocalDateTime deadline;
}
