package com.academic.backend.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.academic.backend.shared.entity.Project;

@Repository
public interface ProjectRepository extends JpaRepository<Project, UUID> {

    @EntityGraph(attributePaths = {"owner", "members", "members.user"})
    @Query("SELECT p FROM Project p WHERE p.id = :id")
    Optional<Project> findByIdWithMembers(@Param("id") UUID id);

    @EntityGraph(attributePaths = {"owner"})
    Optional<Project> findById(UUID id);

    List<Project> findByOwnerId(UUID ownerId);

    @Query("SELECT p FROM Project p JOIN ProjectMember pm ON p.id = pm.project.id WHERE pm.user.id = :userId")
    List<Project> findProjectsByMemberId(@Param("userId") UUID userId);

    @Query("SELECT DISTINCT p FROM Project p LEFT JOIN FETCH p.members pm LEFT JOIN FETCH pm.user WHERE p.owner.id = :userId OR pm.user.id = :userId")
    List<Project> findAllUserProjects(@Param("userId") UUID userId);

    @Query(value = """
        SELECT p.* FROM projects p
        LEFT JOIN project_members pm ON p.id = pm.project_id
        WHERE p.owner_id = :userId OR pm.user_id = :userId
        """, countQuery = """
        SELECT COUNT(DISTINCT p.id) FROM projects p
        LEFT JOIN project_members pm ON p.id = pm.project_id
        WHERE p.owner_id = :userId OR pm.user_id = :userId
        """, nativeQuery = true)
    Page<Project> findAllUserProjectsPaged(@Param("userId") UUID userId, Pageable pageable);
}