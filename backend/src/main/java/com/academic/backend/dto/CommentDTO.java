package com.academic.backend.dto;

import com.academic.backend.shared.entity.Comment;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommentDTO {

    private UUID id;
    private UUID taskId;
    private UUID authorId;
    private String authorName;
    private String content;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public CommentDTO(Comment comment) {
        this.id = comment.getId();
        this.taskId = comment.getTask().getId();
        this.authorId = comment.getAuthor().getId();
        this.authorName = comment.getAuthor().getName();
        this.content = comment.getContent();
        this.createdAt = comment.getCreatedAt();
        this.updatedAt = comment.getUpdatedAt();
    }
}