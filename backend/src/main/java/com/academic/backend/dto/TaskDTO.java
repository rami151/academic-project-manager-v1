package com.academic.backend.dto;

import com.academic.backend.shared.enums.Priority;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskDTO {

    private String title;

    private String description;

    private Priority priority;

    private Integer estimatedDays;
}