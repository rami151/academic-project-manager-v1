package com.academic.backend.service;

import com.academic.backend.dto.NotificationDTO;
import com.academic.backend.repository.NotificationRepository;
import com.academic.backend.repository.ProjectMemberRepository;
import com.academic.backend.repository.ProjectRepository;
import com.academic.backend.repository.TaskRepository;
import com.academic.backend.repository.UserRepository;
import com.academic.backend.shared.entity.Notification;
import com.academic.backend.shared.entity.Project;
import com.academic.backend.shared.entity.Task;
import com.academic.backend.shared.entity.User;
import com.academic.backend.shared.enums.NotificationType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final ProjectMemberRepository projectMemberRepository;

    public NotificationService(NotificationRepository notificationRepository,
                              UserRepository userRepository,
                              ProjectRepository projectRepository,
                              TaskRepository taskRepository,
                              ProjectMemberRepository projectMemberRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.projectRepository = projectRepository;
        this.taskRepository = taskRepository;
        this.projectMemberRepository = projectMemberRepository;
    }

    public void createNotification(UUID recipientId, NotificationType type, String message,
                                   UUID refProjectId, UUID refTaskId) {
        User recipient = userRepository.findById(recipientId)
                .orElseThrow(() -> new RuntimeException("Recipient not found"));

        Notification.NotificationBuilder builder = Notification.builder()
                .recipient(recipient)
                .type(type)
                .message(message)
                .isRead(false);

        if (refProjectId != null) {
            Project project = projectRepository.findById(refProjectId).orElse(null);
            builder.refProject(project);
        }

        if (refTaskId != null) {
            Task task = taskRepository.findById(refTaskId).orElse(null);
            builder.refTask(task);
        }

        notificationRepository.save(builder.build());
    }

    @Transactional(readOnly = true)
    public List<NotificationDTO> getUserNotifications(UUID userId, boolean unreadOnly) {
        List<Notification> notifications;
        if (unreadOnly) {
            notifications = notificationRepository.findByRecipientIdAndIsReadFalseOrderByCreatedAtDesc(userId);
        } else {
            notifications = notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId);
        }
        return notifications.stream()
                .map(NotificationDTO::new)
                .collect(Collectors.toList());
    }

    public void markAsRead(UUID notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setIsRead(true);
        notificationRepository.save(notification);
    }

    public void markAllAsRead(UUID userId) {
        List<Notification> unreadNotifications = 
                notificationRepository.findByRecipientIdAndIsReadFalseOrderByCreatedAtDesc(userId);
        for (Notification notification : unreadNotifications) {
            notification.setIsRead(true);
        }
        notificationRepository.saveAll(unreadNotifications);
    }

    public void notifyProjectMembers(UUID projectId, NotificationType type, String message, UUID excludeUserId) {
        List<UUID> memberIds = projectMemberRepository.findByProjectId(projectId).stream()
                .map(pm -> pm.getUser().getId())
                .filter(id -> !id.equals(excludeUserId))
                .collect(Collectors.toList());

        for (UUID memberId : memberIds) {
            createNotification(memberId, type, message, projectId, null);
        }
    }
}