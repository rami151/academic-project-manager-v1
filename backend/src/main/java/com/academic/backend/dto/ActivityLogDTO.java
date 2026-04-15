package com.academic.backend.dto;

import com.academic.backend.shared.entity.ActivityLog;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ActivityLogDTO {

    private UUID id;
    private UUID projectId;
    private UUID actorId;
    private String actorName;
    private String actionType;
    private UUID targetId;
    private String targetType;
    private JsonNode metadata;
    private LocalDateTime createdAt;

    public ActivityLogDTO(ActivityLog log) {
        this.id = log.getId();
        this.projectId = log.getProject().getId();
        this.actorId = log.getActor().getId();
        this.actorName = log.getActor().getName();
        this.actionType = log.getActionType();
        this.targetId = log.getTargetId();
        this.targetType = log.getTargetType();
        this.metadata = log.getMetadata();
        this.createdAt = log.getCreatedAt();
    }
}