package com.academic.backend.repository;

import com.academic.backend.shared.entity.Task;
import com.academic.backend.shared.enums.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TaskRepository extends JpaRepository<Task, UUID> {

    List<Task> findByProjectIdOrderByPositionAsc(UUID projectId);

    List<Task> findByProjectIdAndStatus(UUID projectId, TaskStatus status);

    List<Task> findByAssignedToId(UUID userId);

    @Query("SELECT MAX(t.position) FROM Task t WHERE t.project.id = :projectId AND t.status = :status")
    Integer findMaxPositionByProjectAndStatus(@Param("projectId") UUID projectId, @Param("status") TaskStatus status);
}
