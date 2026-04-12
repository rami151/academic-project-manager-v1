package com.academic.backend.service;

import com.academic.backend.repository.ProjectMemberRepository;
import com.academic.backend.shared.entity.ProjectMember;
import com.academic.backend.shared.enums.Permission;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class ProjectAuthorizationService {

    private final ProjectMemberRepository projectMemberRepository;

    public ProjectAuthorizationService(ProjectMemberRepository projectMemberRepository) {
        this.projectMemberRepository = projectMemberRepository;
    }

    public boolean isProjectMember(UUID projectId, UUID userId) {
        return projectMemberRepository.existsByProjectIdAndUserId(projectId, userId);
    }

    public boolean hasPermission(UUID projectId, UUID userId, Permission requiredPermission) {
        var membership = projectMemberRepository.findByProjectIdAndUserId(projectId, userId)
                .orElse(null);

        if (membership == null) {
            return false;
        }

        Permission userPermission = membership.getPermission();

        return switch (requiredPermission) {
            case VIEWER -> true;
            case EDITOR -> userPermission == Permission.OWNER || userPermission == Permission.EDITOR;
            case OWNER -> userPermission == Permission.OWNER;
        };
    }

    public void requirePermission(UUID projectId, UUID userId, Permission requiredPermission) {
        if (!hasPermission(projectId, userId, requiredPermission)) {
            throw new RuntimeException("Access denied: required permission " + requiredPermission);
        }
    }

    public ProjectMember getMembershipOrThrow(UUID projectId, UUID userId) {
        return projectMemberRepository.findByProjectIdAndUserId(projectId, userId)
                .orElseThrow(() -> new RuntimeException("User is not a member of this project"));
    }
}
