package com.academic.backend.service;

import com.academic.backend.dto.ActivityLogDTO;
import com.academic.backend.event.ProjectEvent;
import com.academic.backend.repository.ActivityLogRepository;
import com.academic.backend.repository.ProjectRepository;
import com.academic.backend.repository.UserRepository;
import com.academic.backend.shared.entity.ActivityLog;
import com.academic.backend.shared.entity.Project;
import com.academic.backend.shared.entity.User;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.context.event.EventListener;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class ActivityLogService {

    private final ActivityLogRepository activityLogRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    public ActivityLogService(ActivityLogRepository activityLogRepository,
                              ProjectRepository projectRepository,
                              UserRepository userRepository,
                              ObjectMapper objectMapper) {
        this.activityLogRepository = activityLogRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.objectMapper = objectMapper;
    }

    public void log(UUID projectId, UUID actorId, String actionType, 
                    UUID targetId, String targetType, Map<String, Object> metadata) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        
        User actor = userRepository.findById(actorId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        JsonNode metadataJson = null;
        if (metadata != null) {
            try {
                metadataJson = objectMapper.valueToTree(metadata);
            } catch (Exception e) {
                metadataJson = null;
            }
        }

        ActivityLog log = ActivityLog.builder()
                .project(project)
                .actor(actor)
                .actionType(actionType)
                .targetId(targetId)
                .targetType(targetType)
                .metadata(metadataJson)
                .build();

        activityLogRepository.save(log);
    }

    @Async
    @EventListener
    public void handleProjectEvent(ProjectEvent event) {
        log(event.getProjectId(), event.getActorId(), event.getActionType(),
            event.getTargetId(), event.getTargetType(), event.getMetadata());
    }

    @Transactional(readOnly = true)
    public List<ActivityLogDTO> getProjectActivity(UUID projectId, int limit) {
        List<ActivityLog> logs = activityLogRepository.findByProjectIdOrderByCreatedAtDesc(projectId);
        return logs.stream()
                .limit(limit)
                .map(ActivityLogDTO::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<ActivityLogDTO> getProjectActivityPaged(UUID projectId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ActivityLog> logs = activityLogRepository.findByProjectId(projectId, pageable);
        return logs.map(ActivityLogDTO::new);
    }
}