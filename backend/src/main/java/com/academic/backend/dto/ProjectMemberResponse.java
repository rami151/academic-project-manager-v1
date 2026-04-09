package com.academic.backend.dto;

import com.academic.backend.shared.entity.ProjectMember;
import com.academic.backend.shared.enums.Permission;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProjectMemberResponse {

    private UUID id;
    private UUID userId;
    private String userName;
    private String userEmail;
    private Permission permission;
    private LocalDateTime joinedAt;

    public ProjectMemberResponse(ProjectMember member) {
        this.id = member.getId();
        this.userId = member.getUser().getId();
        this.userName = member.getUser().getName();
        this.userEmail = member.getUser().getEmail();
        this.permission = member.getPermission();
        this.joinedAt = member.getJoinedAt();
    }
}
