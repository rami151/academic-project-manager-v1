package com.academic.backend.dto;

import com.academic.backend.shared.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSummaryDTO {
    private UUID id;
    private String name;
    private String email;
    private String avatarUrl;

    public UserSummaryDTO(User user) {
        if (user != null) {
            this.id = user.getId();
            this.name = user.getName();
            this.email = user.getEmail();
            this.avatarUrl = user.getAvatarUrl();
        }
    }
}
