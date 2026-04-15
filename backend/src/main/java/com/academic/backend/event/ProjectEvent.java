package com.academic.backend.event;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

import java.util.Map;
import java.util.UUID;

@Getter
public class ProjectEvent extends ApplicationEvent {

    private final UUID projectId;
    private final UUID actorId;
    private final String actionType;
    private final UUID targetId;
    private final String targetType;
    private final Map<String, Object> metadata;

    public ProjectEvent(Object source, UUID projectId, UUID actorId, String actionType,
                        UUID targetId, String targetType, Map<String, Object> metadata) {
        super(source);
        this.projectId = projectId;
        this.actorId = actorId;
        this.actionType = actionType;
        this.targetId = targetId;
        this.targetType = targetType;
        this.metadata = metadata;
    }
}