package com.academic.backend.repository;

import com.academic.backend.shared.entity.GeminiGeneration;
import com.academic.backend.shared.enums.GenerationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface GeminiGenerationRepository extends JpaRepository<GeminiGeneration, UUID> {

    List<GeminiGeneration> findByProjectIdOrderByCreatedAtDesc(UUID projectId);

    List<GeminiGeneration> findByCreatedByIdAndStatus(UUID userId, GenerationStatus status);
}