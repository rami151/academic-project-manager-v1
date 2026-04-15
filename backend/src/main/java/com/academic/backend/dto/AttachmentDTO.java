package com.academic.backend.dto;

import com.academic.backend.shared.entity.Attachment;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AttachmentDTO {

    private UUID id;
    private UUID taskId;
    private UUID uploadedById;
    private String uploadedByName;
    private String fileName;
    private String fileUrl;
    private Long fileSize;
    private LocalDateTime createdAt;

    public AttachmentDTO(Attachment attachment) {
        this.id = attachment.getId();
        this.taskId = attachment.getTask().getId();
        this.uploadedById = attachment.getUploadedBy().getId();
        this.uploadedByName = attachment.getUploadedBy().getName();
        this.fileName = attachment.getFileName();
        this.fileUrl = attachment.getFileUrl();
        this.fileSize = attachment.getFileSize();
        this.createdAt = attachment.getCreatedAt();
    }
}