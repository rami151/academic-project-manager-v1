package com.academic.backend.service;

import com.academic.backend.dto.CommentDTO;
import com.academic.backend.repository.CommentRepository;
import com.academic.backend.repository.NotificationRepository;
import com.academic.backend.repository.ProjectMemberRepository;
import com.academic.backend.repository.TaskRepository;
import com.academic.backend.repository.UserRepository;
import com.academic.backend.shared.entity.Comment;
import com.academic.backend.shared.entity.Notification;
import com.academic.backend.shared.entity.Task;
import com.academic.backend.shared.entity.User;
import com.academic.backend.shared.enums.NotificationType;
import com.academic.backend.shared.enums.Permission;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class CommentService {

    private final CommentRepository commentRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final NotificationRepository notificationRepository;
    private final ProjectAuthorizationService authorizationService;

    public CommentService(CommentRepository commentRepository,
                          TaskRepository taskRepository,
                          UserRepository userRepository,
                          ProjectMemberRepository projectMemberRepository,
                          NotificationRepository notificationRepository,
                          ProjectAuthorizationService authorizationService) {
        this.commentRepository = commentRepository;
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
        this.projectMemberRepository = projectMemberRepository;
        this.notificationRepository = notificationRepository;
        this.authorizationService = authorizationService;
    }

    public CommentDTO createComment(UUID taskId, String content, UUID authorId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        
        UUID projectId = task.getProject().getId();
        if (!authorizationService.isProjectMember(projectId, authorId)) {
            throw new RuntimeException("User is not a member of this project");
        }

        User author = userRepository.findById(authorId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Comment comment = Comment.builder()
                .task(task)
                .author(author)
                .content(content)
                .build();

        Comment saved = commentRepository.save(comment);

        List<UUID> memberIds = projectMemberRepository.findByProjectId(projectId).stream()
                .map(pm -> pm.getUser().getId())
                .filter(id -> !id.equals(authorId))
                .collect(Collectors.toList());

        for (UUID memberId : memberIds) {
            User recipient = userRepository.findById(memberId).orElse(null);
            if (recipient != null) {
                Notification notification = Notification.builder()
                        .recipient(recipient)
                        .type(NotificationType.COMMENTED)
                        .message(author.getName() + " commented on task: " + task.getTitle())
                        .refTask(task)
                        .refProject(task.getProject())
                        .isRead(false)
                        .build();
                notificationRepository.save(notification);
            }
        }

        return new CommentDTO(saved);
    }

    public CommentDTO updateComment(UUID commentId, String content, UUID authorId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        if (!comment.getAuthor().getId().equals(authorId)) {
            throw new RuntimeException("Only the author can update this comment");
        }

        comment.setContent(content);
        Comment saved = commentRepository.save(comment);
        return new CommentDTO(saved);
    }

    public void deleteComment(UUID commentId, UUID userId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        UUID projectId = comment.getTask().getProject().getId();
        
        boolean isOwner = comment.getAuthor().getId().equals(userId);
        boolean hasOwnerPermission = authorizationService.hasPermission(projectId, userId, Permission.OWNER);
        
        if (!isOwner && !hasOwnerPermission) {
            throw new RuntimeException("Only the author or project owner can delete this comment");
        }

        commentRepository.deleteById(commentId);
    }

    @Transactional(readOnly = true)
    public List<CommentDTO> getTaskComments(UUID taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        
        UUID projectId = task.getProject().getId();
        
        List<Comment> comments = commentRepository.findByTaskIdOrderByCreatedAtAsc(taskId);
        return comments.stream()
                .map(CommentDTO::new)
                .collect(Collectors.toList());
    }
}