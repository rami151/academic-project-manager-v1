package com.academic.backend.service;

import com.academic.backend.dto.*;
import com.academic.backend.repository.ProjectMemberRepository;
import com.academic.backend.repository.ProjectRepository;
import com.academic.backend.repository.UserRepository;
import com.academic.backend.shared.entity.Project;
import com.academic.backend.shared.entity.ProjectMember;
import com.academic.backend.shared.entity.User;
import com.academic.backend.shared.enums.Permission;
import com.academic.backend.shared.enums.ProjectStatus;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final ProjectAuthorizationService authorizationService;
    private final UserRepository userRepository;

    public ProjectService(ProjectRepository projectRepository,
                         ProjectMemberRepository projectMemberRepository,
                         ProjectAuthorizationService authorizationService,
                         UserRepository userRepository) {
        this.projectRepository = projectRepository;
        this.projectMemberRepository = projectMemberRepository;
        this.authorizationService = authorizationService;
        this.userRepository = userRepository;
    }

    public ProjectResponse createProject(CreateProjectRequest request, UUID currentUserId) {
        User owner = userRepository.findById(currentUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Project project = new Project();
        project.setName(request.getName());
        project.setDescription(request.getDescription());
        project.setDeadline(request.getDeadline());
        project.setOwner(owner);
        project.setStatus(ProjectStatus.ACTIVE);

        Project savedProject = projectRepository.save(project);

        ProjectMember membership = new ProjectMember();
        membership.setProject(savedProject);
        membership.setUser(owner);
        membership.setPermission(Permission.OWNER);
        membership.setJoinedAt(LocalDateTime.now());

        projectMemberRepository.save(membership);

        return new ProjectResponse(savedProject);
    }

    public List<ProjectResponse> getUserProjects(UUID userId) {
        List<Project> projects = projectRepository.findAllUserProjects(userId);
        return projects.stream()
                .map(ProjectResponse::new)
                .collect(Collectors.toList());
    }

    @Cacheable(value = "projects", key = "#projectId")
    public ProjectResponse getProjectById(UUID projectId, UUID currentUserId) {
        authorizationService.requirePermission(projectId, currentUserId, Permission.VIEWER);

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        return new ProjectResponse(project);
    }

    @CacheEvict(value = "projects", key = "#projectId")
    public ProjectResponse updateProject(UUID projectId, UpdateProjectRequest request, UUID currentUserId) {
        authorizationService.requirePermission(projectId, currentUserId, Permission.OWNER);

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        if (request.getName() != null) {
            project.setName(request.getName());
        }
        if (request.getDescription() != null) {
            project.setDescription(request.getDescription());
        }
        if (request.getStatus() != null) {
            project.setStatus(request.getStatus());
        }
        if (request.getDeadline() != null) {
            project.setDeadline(request.getDeadline());
        }

        Project savedProject = projectRepository.save(project);
        return new ProjectResponse(savedProject);
    }

    public void deleteProject(UUID projectId, UUID currentUserId) {
        authorizationService.requirePermission(projectId, currentUserId, Permission.OWNER);
        projectRepository.deleteById(projectId);
    }

    @CacheEvict(value = "projects", allEntries = true)
    public ProjectMemberResponse addMember(UUID projectId, String memberEmail, Permission permission, UUID currentUserId) {
        authorizationService.requirePermission(projectId, currentUserId, Permission.OWNER);

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        User newMember = userRepository.findByEmail(memberEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (projectMemberRepository.existsByProjectIdAndUserId(projectId, newMember.getId())) {
            throw new RuntimeException("User already a member of this project");
        }

        ProjectMember membership = new ProjectMember();
        membership.setProject(project);
        membership.setUser(newMember);
        membership.setPermission(permission);
        membership.setJoinedAt(LocalDateTime.now());

        ProjectMember savedMembership = projectMemberRepository.save(membership);
        return new ProjectMemberResponse(savedMembership);
    }

    public List<ProjectMemberResponse> getProjectMembers(UUID projectId, UUID currentUserId) {
        authorizationService.requirePermission(projectId, currentUserId, Permission.VIEWER);

        List<ProjectMember> members = projectMemberRepository.findByProjectId(projectId);
        return members.stream()
                .map(ProjectMemberResponse::new)
                .collect(Collectors.toList());
    }
}
