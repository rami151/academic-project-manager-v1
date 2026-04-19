package com.academic.backend.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class DemoDataSeeder implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        log.info("Synchronizing demo data via Native SQL...");

        String passwordHash = passwordEncoder.encode("admin123");

        // 1. USERS
        upsertUser("11111111-1111-1111-1111-111111111111", "Teacher Teacher", "teacher@academic.com", passwordHash, "TEACHER", "https://ui-avatars.com/api/?name=Teacher+Teacher&background=1976D2&color=fff");
        upsertUser("22222222-2222-2222-2222-222222222222", "Rami Khalfaoui", "rami.khalfaoui@student.fsm.tn", passwordHash, "STUDENT", "https://ui-avatars.com/api/?name=Rami+Khalfaoui&background=4CAF50&color=fff");
        upsertUser("33333333-3333-3333-3333-333333333333", "Sara Trabelsi", "sara.trabelsi@student.fsm.tn", passwordHash, "STUDENT", "https://ui-avatars.com/api/?name=Sara+Trabelsi&background=FF9800&color=fff");
        upsertUser("44444444-4444-4444-4444-444444444444", "Youssef Mansour", "youssef.mansour@student.fsm.tn", passwordHash, "STUDENT", "https://ui-avatars.com/api/?name=Youssef+Mansour&background=9C27B0&color=fff");

        // 2. PROJECTS
        upsertProject("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", "11111111-1111-1111-1111-111111111111", "PFA 2024/2025 — Plateforme Collaborative de Gestion de Projets", "Développement d'une application web permettant aux équipes académiques de gérer leurs projets avec génération automatique de tâches via Intelligence Artificielle (Gemini).", "ACTIVE");

        // 3. PROJECT MEMBERS
        upsertMembership("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb", "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", "11111111-1111-1111-1111-111111111111", "OWNER");
        upsertMembership("cccccccc-cccc-cccc-cccc-cccccccccccc", "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", "22222222-2222-2222-2222-222222222222", "EDITOR");
        upsertMembership("dddddddd-dddd-dddd-dddd-dddddddddddd", "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", "33333333-3333-3333-3333-333333333333", "EDITOR");
        upsertMembership("eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee", "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", "44444444-4444-4444-4444-444444444444", "VIEWER");

        // 4. LABELS
        upsertLabel("11111111-1111-1111-aaaa-111111111111", "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", "Backend", "#1976D2");
        upsertLabel("22222222-2222-2222-aaaa-222222222222", "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", "Frontend", "#4CAF50");
        upsertLabel("33333333-3333-3333-aaaa-333333333333", "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", "Database", "#FF9800");

        // 5. GEMINI GENERATION (Required for foreign keys in tasks)
        upsertGeneration("77777777-7777-7777-7777-777777777777", "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", "22222222-2222-2222-2222-222222222222", "Prompt IA Demo");

        // 6. TASKS
        upsertTask("91111111-1111-1111-1111-111111111111", "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", "22222222-2222-2222-2222-222222222222", "Configuration initiale Docker Compose", "PostgreSQL 16 + pgAdmin", "DONE", "HIGH", 1);
        upsertTask("92222222-2222-2222-2222-222222222222", "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", "22222222-2222-2222-2222-222222222222", "Migration Flyway V1", "Schéma complet", "DONE", "HIGH", 2);
        upsertTask("96666666-6666-6666-6666-666666666666", "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", "33333333-3333-3333-3333-333333333333", "Kanban Board", "Angular CDK Drag & Drop", "IN_PROGRESS", "HIGH", 3);

        // 7. TASK LABELS
        linkTaskLabel("91111111-1111-1111-1111-111111111111", "33333333-3333-3333-aaaa-333333333333");
        linkTaskLabel("92222222-2222-2222-2222-222222222222", "33333333-3333-3333-aaaa-333333333333");
        linkTaskLabel("96666666-6666-6666-6666-666666666666", "22222222-2222-2222-aaaa-222222222222");

        log.info("Demo data synchronization completed.");
    }

    private void upsertUser(String id, String name, String email, String pass, String role, String avatar) {
        jdbcTemplate.update("""
            INSERT INTO users (id, name, email, password_hash, role, avatar_url, created_at, is_active)
            VALUES (?::uuid, ?, ?, ?, ?::role_enum, ?, NOW(), true)
            ON CONFLICT (id) DO UPDATE SET
                name = EXCLUDED.name,
                email = EXCLUDED.email,
                password_hash = EXCLUDED.password_hash,
                role = EXCLUDED.role,
                avatar_url = EXCLUDED.avatar_url,
                is_active = true
            """, id, name, email, pass, role, avatar);
    }

    private void upsertProject(String id, String ownerId, String name, String desc, String status) {
        jdbcTemplate.update("""
            INSERT INTO projects (id, owner_id, name, description, status, deadline, created_at, updated_at)
            VALUES (?::uuid, ?::uuid, ?, ?, ?::project_status_enum, NOW() + INTERVAL '6 months', NOW(), NOW())
            ON CONFLICT (id) DO UPDATE SET
                owner_id = EXCLUDED.owner_id,
                name = EXCLUDED.name,
                description = EXCLUDED.description,
                status = EXCLUDED.status,
                updated_at = NOW()
            """, id, ownerId, name, desc, status);
    }

    private void upsertMembership(String id, String projectId, String userId, String perm) {
        jdbcTemplate.update("""
            INSERT INTO project_members (id, project_id, user_id, permission, joined_at)
            VALUES (?::uuid, ?::uuid, ?::uuid, ?::permission_enum, NOW())
            ON CONFLICT (id) DO UPDATE SET
                project_id = EXCLUDED.project_id,
                user_id = EXCLUDED.user_id,
                permission = EXCLUDED.permission
            """, id, projectId, userId, perm);
    }

    private void upsertLabel(String id, String projectId, String name, String color) {
        jdbcTemplate.update("""
            INSERT INTO labels (id, project_id, name, color)
            VALUES (?::uuid, ?::uuid, ?, ?)
            ON CONFLICT (id) DO UPDATE SET
                name = EXCLUDED.name,
                color = EXCLUDED.color
            """, id, projectId, name, color);
    }

    private void upsertGeneration(String id, String projectId, String createdBy, String prompt) {
        jdbcTemplate.update("""
            INSERT INTO gemini_generations (id, project_id, created_by, prompt, status, created_at)
            VALUES (?::uuid, ?::uuid, ?::uuid, ?, 'DONE'::generation_status_enum, NOW())
            ON CONFLICT (id) DO UPDATE SET
                prompt = EXCLUDED.prompt
            """, id, projectId, createdBy, prompt);
    }

    private void upsertTask(String id, String projectId, String assigneeId, String title, String desc, String status, String priority, int pos) {
        jdbcTemplate.update("""
            INSERT INTO tasks (id, project_id, assigned_to, title, description, status, priority, position, ai_generated, created_at, updated_at)
            VALUES (?::uuid, ?::uuid, ?::uuid, ?, ?, ?::task_status_enum, ?::priority_enum, ?, false, NOW(), NOW())
            ON CONFLICT (id) DO UPDATE SET
                assigned_to = EXCLUDED.assigned_to,
                title = EXCLUDED.title,
                description = EXCLUDED.description,
                status = EXCLUDED.status,
                priority = EXCLUDED.priority,
                position = EXCLUDED.position,
                updated_at = NOW()
            """, id, projectId, assigneeId, title, desc, status, priority, pos);
    }

    private void linkTaskLabel(String taskId, String labelId) {
        jdbcTemplate.update("""
            INSERT INTO task_labels (task_id, label_id)
            VALUES (?::uuid, ?::uuid)
            ON CONFLICT DO NOTHING
            """, taskId, labelId);
    }
}
