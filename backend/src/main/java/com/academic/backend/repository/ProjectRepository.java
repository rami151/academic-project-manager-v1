package com.academic.backend.repository;

import com.academic.backend.shared.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProjectRepository extends JpaRepository<Project, UUID> {

    List<Project> findByOwnerId(UUID ownerId);

    @Query("SELECT p FROM Project p JOIN ProjectMember pm ON p.id = pm.project.id WHERE pm.user.id = :userId")
    List<Project> findProjectsByMemberId(@Param("userId") UUID userId);

    @Query("SELECT p FROM Project p LEFT JOIN ProjectMember pm ON p.id = pm.project.id WHERE p.owner.id = :userId OR pm.user.id = :userId")
    List<Project> findAllUserProjects(@Param("userId") UUID userId);
}
