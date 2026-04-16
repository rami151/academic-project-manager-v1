package com.academic.backend.repository;

import com.academic.backend.shared.entity.Task;
import com.academic.backend.shared.enums.TaskStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface TaskRepository extends JpaRepository<Task, UUID> {

    @EntityGraph(attributePaths = {"assignedTo", "labels"})
    List<Task> findByProjectIdOrderByPositionAsc(UUID projectId);

    @EntityGraph(attributePaths = {"assignedTo"})
    List<Task> findByProjectIdAndStatus(UUID projectId, TaskStatus status);

    List<Task> findByAssignedToId(UUID userId);

    @Query("SELECT MAX(t.position) FROM Task t WHERE t.project.id = :projectId AND t.status = :status")
    Integer findMaxPositionByProjectAndStatus(@Param("projectId") UUID projectId, @Param("status") TaskStatus status);

    @Query("SELECT t FROM Task t WHERE t.project.id = :projectId AND t.dueDate < :today AND t.status <> 'DONE'")
    List<Task> findOverdueTasks(@Param("projectId") UUID projectId, @Param("today") LocalDateTime today);

    @Query("SELECT t FROM Task t WHERE t.project.id = :projectId")
    Page<Task> findByProjectId(@Param("projectId") UUID projectId, Pageable pageable);
}