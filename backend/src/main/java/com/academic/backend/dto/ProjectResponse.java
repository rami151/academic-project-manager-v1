package com.academic.backend.dto;

import com.academic.backend.shared.entity.Project;
import com.academic.backend.shared.enums.ProjectStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProjectResponse {

    private UUID id;
    private String name;
    private String description;
    private ProjectStatus status;
    private LocalDateTime deadline;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private UserSummaryDTO owner;
    private int memberCount;

    public ProjectResponse(Project project) {
        this.id = project.getId();
        this.name = project.getName();
        this.description = project.getDescription();
        this.status = project.getStatus();
        this.deadline = project.getDeadline();
        this.createdAt = project.getCreatedAt();
        this.updatedAt = project.getUpdatedAt();
        this.owner = new UserSummaryDTO(project.getOwner());
    }

    public void setMemberCount(int memberCount) {
        this.memberCount = memberCount;
    }
}
