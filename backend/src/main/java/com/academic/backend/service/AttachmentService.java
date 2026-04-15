package com.academic.backend.service;

import com.academic.backend.dto.AttachmentDTO;
import com.academic.backend.repository.AttachmentRepository;
import com.academic.backend.repository.TaskRepository;
import com.academic.backend.repository.UserRepository;
import com.academic.backend.shared.entity.Attachment;
import com.academic.backend.shared.entity.Task;
import com.academic.backend.shared.entity.User;
import com.academic.backend.shared.enums.Permission;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class AttachmentService {

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

    @Value("${app.upload.dir:./uploads}")
    private String uploadDir;

    private final AttachmentRepository attachmentRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final ProjectAuthorizationService authorizationService;

    public AttachmentService(AttachmentRepository attachmentRepository,
                           TaskRepository taskRepository,
                           UserRepository userRepository,
                           ProjectAuthorizationService authorizationService) {
        this.attachmentRepository = attachmentRepository;
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
        this.authorizationService = authorizationService;
    }

    public AttachmentDTO uploadFile(UUID taskId, MultipartFile file, UUID userId) throws IOException {
        if (file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }
        
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new RuntimeException("File size exceeds 10 MB limit");
        }

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        
        UUID projectId = task.getProject().getId();
        authorizationService.requirePermission(projectId, userId, Permission.EDITOR);

        User uploader = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        
        String uniqueFilename = UUID.randomUUID().toString() + extension;
        
        Path taskUploadDir = Paths.get(uploadDir, taskId.toString());
        Files.createDirectories(taskUploadDir);
        
        Path filePath = taskUploadDir.resolve(uniqueFilename);
        Files.write(filePath, file.getBytes());

        String fileUrl = "/uploads/" + taskId + "/" + uniqueFilename;

        Attachment attachment = Attachment.builder()
                .task(task)
                .uploadedBy(uploader)
                .fileName(originalFilename != null ? originalFilename : "file")
                .fileUrl(fileUrl)
                .fileSize(file.getSize())
                .build();

        Attachment saved = attachmentRepository.save(attachment);
        return new AttachmentDTO(saved);
    }

    public void deleteAttachment(UUID attachmentId, UUID userId) throws IOException {
        Attachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new RuntimeException("Attachment not found"));

        UUID projectId = attachment.getTask().getProject().getId();
        authorizationService.requirePermission(projectId, userId, Permission.EDITOR);

        Path filePath = Paths.get(uploadDir, 
                attachment.getTask().getId().toString(),
                attachment.getFileUrl().substring(attachment.getFileUrl().lastIndexOf("/") + 1));
        
        Files.deleteIfExists(filePath);

        attachmentRepository.deleteById(attachmentId);
    }

    @Transactional(readOnly = true)
    public List<AttachmentDTO> getTaskAttachments(UUID taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        
        List<Attachment> attachments = attachmentRepository.findByTaskIdOrderByCreatedAtDesc(taskId);
        return attachments.stream()
                .map(AttachmentDTO::new)
                .collect(Collectors.toList());
    }
}