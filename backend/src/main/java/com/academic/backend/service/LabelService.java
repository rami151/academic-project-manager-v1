package com.academic.backend.service;

import com.academic.backend.dto.LabelDTO;
import com.academic.backend.repository.LabelRepository;
import com.academic.backend.repository.ProjectRepository;
import com.academic.backend.shared.entity.Label;
import com.academic.backend.shared.entity.Project;
import com.academic.backend.shared.enums.Permission;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class LabelService {

    private final LabelRepository labelRepository;
    private final ProjectRepository projectRepository;
    private final ProjectAuthorizationService authorizationService;

    public List<LabelDTO> getProjectLabels(UUID projectId, UUID currentUserId) {
        authorizationService.requirePermission(projectId, currentUserId, Permission.VIEWER);
        return labelRepository.findByProjectId(projectId).stream()
                .map(LabelDTO::new)
                .collect(Collectors.toList());
    }

    public LabelDTO createLabel(UUID projectId, String name, String color, UUID currentUserId) {
        authorizationService.requirePermission(projectId, currentUserId, Permission.EDITOR);
        
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        Label label = Label.builder()
                .project(project)
                .name(name)
                .color(color)
                .build();

        return new LabelDTO(labelRepository.save(label));
    }

    public void deleteLabel(UUID labelId, UUID currentUserId) {
        Label label = labelRepository.findById(labelId)
                .orElseThrow(() -> new RuntimeException("Label not found"));
        
        authorizationService.requirePermission(label.getProject().getId(), currentUserId, Permission.EDITOR);
        labelRepository.delete(label);
    }
}
