package com.academic.backend.controller;

import com.academic.backend.dto.CommentDTO;
import com.academic.backend.security.CustomUserDetails;
import com.academic.backend.service.CommentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:4200")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @PostMapping("/tasks/{taskId}/comments")
    public ResponseEntity<CommentDTO> createComment(
            @PathVariable UUID taskId,
            @Valid @RequestBody Map<String, String> request,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = ((CustomUserDetails) userDetails).getId();
        String content = request.get("content");
        CommentDTO comment = commentService.createComment(taskId, content, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(comment);
    }

    @PutMapping("/comments/{id}")
    public ResponseEntity<CommentDTO> updateComment(
            @PathVariable UUID id,
            @Valid @RequestBody Map<String, String> request,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = ((CustomUserDetails) userDetails).getId();
        String content = request.get("content");
        CommentDTO comment = commentService.updateComment(id, content, userId);
        return ResponseEntity.ok(comment);
    }

    @DeleteMapping("/comments/{id}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = ((CustomUserDetails) userDetails).getId();
        commentService.deleteComment(id, userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/tasks/{taskId}/comments")
    public ResponseEntity<List<CommentDTO>> getTaskComments(
            @PathVariable UUID taskId,
            @AuthenticationPrincipal UserDetails userDetails) {
        List<CommentDTO> comments = commentService.getTaskComments(taskId);
        return ResponseEntity.ok(comments);
    }
}