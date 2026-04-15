package com.academic.backend.dto;

import com.academic.backend.shared.entity.Notification;
import com.academic.backend.shared.enums.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDTO {

    private UUID id;
    private UUID recipientId;
    private String recipientName;
    private NotificationType type;
    private String message;
    private UUID refProjectId;
    private UUID refTaskId;
    private Boolean isRead;
    private LocalDateTime createdAt;

    public NotificationDTO(Notification notification) {
        this.id = notification.getId();
        this.recipientId = notification.getRecipient().getId();
        this.recipientName = notification.getRecipient().getName();
        this.type = notification.getType();
        this.message = notification.getMessage();
        this.isRead = notification.getIsRead();
        this.createdAt = notification.getCreatedAt();
        if (notification.getRefProject() != null) {
            this.refProjectId = notification.getRefProject().getId();
        }
        if (notification.getRefTask() != null) {
            this.refTaskId = notification.getRefTask().getId();
        }
    }
}