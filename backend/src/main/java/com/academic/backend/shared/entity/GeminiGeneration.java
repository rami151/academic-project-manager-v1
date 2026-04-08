package com.academic.backend.shared.entity;

import com.academic.backend.shared.enums.GenerationStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "gemini_generations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GeminiGeneration {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String prompt;

    @Column(name = "raw_response", columnDefinition = "TEXT")
    private String rawResponse;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private GenerationStatus status = GenerationStatus.PENDING;

    @Column(name = "tokens_used")
    @Builder.Default
    private Integer tokensUsed = 0;

    @Column(name = "retry_count")
    @Builder.Default
    private Integer retryCount = 0;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
