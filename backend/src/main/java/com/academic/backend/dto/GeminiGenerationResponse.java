package com.academic.backend.dto;

import com.academic.backend.shared.entity.GeminiGeneration;
import com.academic.backend.shared.enums.GenerationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GeminiGenerationResponse {

    private UUID id;
    private UUID projectId;
    private UUID createdById;
    private String createdByName;
    private String prompt;
    private String rawResponse;
    private GenerationStatus status;
    private Integer tokensUsed;
    private Integer retryCount;
    private String failureReason;
    private Integer providerStatusCode;
    private LocalDateTime createdAt;
    private List<TaskDTO> parsedTasks;

    public GeminiGenerationResponse(GeminiGeneration generation) {
        this.id = generation.getId();
        this.projectId = generation.getProject().getId();
        this.createdById = generation.getCreatedBy().getId();
        this.createdByName = generation.getCreatedBy().getName();
        this.prompt = generation.getPrompt();
        this.rawResponse = generation.getRawResponse();
        this.status = generation.getStatus();
        this.tokensUsed = generation.getTokensUsed();
        this.retryCount = generation.getRetryCount();
        this.failureReason = generation.getFailureReason();
        this.providerStatusCode = generation.getProviderStatusCode();
        this.createdAt = generation.getCreatedAt();
    }
}