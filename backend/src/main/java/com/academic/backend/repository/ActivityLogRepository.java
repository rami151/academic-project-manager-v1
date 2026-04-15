package com.academic.backend.repository;

import com.academic.backend.shared.entity.ActivityLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, UUID> {
    
    @Query("SELECT a FROM ActivityLog a WHERE a.project.id = :projectId ORDER BY a.createdAt DESC")
    List<ActivityLog> findByProjectIdOrderByCreatedAtDesc(@Param("projectId") UUID projectId);

    @Query("SELECT a FROM ActivityLog a WHERE a.project.id = :projectId ORDER BY a.createdAt DESC")
    Page<ActivityLog> findByProjectId(@Param("projectId") UUID projectId, Pageable pageable);
}