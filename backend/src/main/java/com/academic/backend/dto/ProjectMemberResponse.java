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
    private UserSummaryDTO user;
    private Permission permission;
    private LocalDateTime joinedAt;

    public ProjectMemberResponse(ProjectMember member) {
        this.id = member.getId();
        this.user = new UserSummaryDTO(member.getUser());
        this.permission = member.getPermission();
        this.joinedAt = member.getJoinedAt();
    }
}
