package com.academic.backend.controller;

import com.academic.backend.dto.NotificationDTO;
import com.academic.backend.security.CustomUserDetails;
import com.academic.backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "http://localhost:4200")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<NotificationDTO>> getUserNotifications(
            @RequestParam(defaultValue = "false") boolean unreadOnly,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = ((CustomUserDetails) userDetails).getId();
        List<NotificationDTO> notifications = notificationService.getUserNotifications(userId, unreadOnly);
        return ResponseEntity.ok(notifications);
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = ((CustomUserDetails) userDetails).getId();
        notificationService.markAsRead(id);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/mark-all-read")
    public ResponseEntity<Void> markAllAsRead(
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = ((CustomUserDetails) userDetails).getId();
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok().build();
    }
}