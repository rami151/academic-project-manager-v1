package com.academic.backend.controller;

import com.academic.backend.dto.AttachmentDTO;
import com.academic.backend.security.CustomUserDetails;
import com.academic.backend.service.AttachmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:4200")
@RequiredArgsConstructor
public class AttachmentController {

    private final AttachmentService attachmentService;

    @PostMapping("/tasks/{taskId}/attachments")
    public ResponseEntity<AttachmentDTO> uploadFile(
            @PathVariable UUID taskId,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserDetails userDetails) throws IOException {
        UUID userId = ((CustomUserDetails) userDetails).getId();
        AttachmentDTO attachment = attachmentService.uploadFile(taskId, file, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(attachment);
    }

    @DeleteMapping("/attachments/{id}")
    public ResponseEntity<Void> deleteAttachment(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) throws IOException {
        UUID userId = ((CustomUserDetails) userDetails).getId();
        attachmentService.deleteAttachment(id, userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/tasks/{taskId}/attachments")
    public ResponseEntity<List<AttachmentDTO>> getTaskAttachments(
            @PathVariable UUID taskId) {
        List<AttachmentDTO> attachments = attachmentService.getTaskAttachments(taskId);
        return ResponseEntity.ok(attachments);
    }

    @GetMapping("/attachments/{id}/download")
    public ResponseEntity<Resource> downloadFile(
            @PathVariable UUID id,
            @RequestParam String fileUrl) throws IOException {
        Path filePath = Paths.get(".").resolve(fileUrl).normalize();
        Resource resource = new UrlResource(filePath.toUri());
        
        if (!resource.exists()) {
            return ResponseEntity.notFound().build();
        }

        String fileName = fileUrl.substring(fileUrl.lastIndexOf("/") + 1);
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                .body(resource);
    }
}