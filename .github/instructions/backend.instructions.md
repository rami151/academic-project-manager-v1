---
name: backend-patterns
description: "Use when: Implementing backend features, creating entities, services, controllers, migrations, or working with Spring Boot security. Provides DB-first discipline, entity/service/controller patterns, Enum handling, authorization guidance, and migration workflow."
applyTo: "backend/**"
---

# Backend Architecture & Patterns Guide

## Overview
This project follows a **DB-first** architecture:
- Schema is the source of truth (PostgreSQL + Flyway migrations)
- JPA entities are read-only mappings (`ddl-auto: validate` — **never change to update**)
- All schema changes go through Flyway SQL migrations (`V{N}__*.sql`)

## Entity Pattern

### Enum Fields (CRITICAL)
All enum fields must use **three annotations** for PostgreSQL native enum compatibility:

```java
@Enumerated(EnumType.STRING)
@JdbcTypeCode(SqlTypes.NAMED_ENUM)
@Column(name = "role", columnDefinition = "role_enum", nullable = false)
private Role role;
```

**Why**: PostgreSQL uses native enum types defined in `V1__init_schema.sql` (e.g., `CREATE TYPE role_enum AS ENUM (...)`)

### Timestamps
```java
@CreationTimestamp
@Column(name = "created_at", nullable = false, updatable = false)
private LocalDateTime createdAt;  // Never changes after insert

@UpdateTimestamp
@Column(name = "updated_at", nullable = false)
private LocalDateTime updatedAt;  // Auto-updated on every change
```

### Primary Keys
```java
@Id
@GeneratedValue(strategy = GenerationType.UUID)
private UUID id;  // Uses PostgreSQL gen_random_uuid()
```

### Complete Entity Example
See [User.java](../../backend/src/main/java/com/academic/backend/shared/entity/User.java) or [Task.java](../../backend/src/main/java/com/academic/backend/shared/entity/Task.java) as exemplars.

## Service Pattern

### Authorization Checks (Required)
**Every service method that accesses protected data must check permissions:**

```java
public ProjectResponse getProject(UUID projectId, UUID currentUserId) {
    // Always check authorization first
    authorizationService.requirePermission(projectId, currentUserId, Permission.VIEWER);
    
    Project project = projectRepository.findById(projectId)
        .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
    
    return new ProjectResponse(project);
}
```

**Failure to add permission checks = security vulnerability**

See [ProjectService.java](../../backend/src/main/java/com/academic/backend/service/ProjectService.java) for full authorization patterns.

### DTO Conversion
Always convert entities to DTOs before returning:

```java
public List<ProjectResponse> listProjects(UUID userId) {
    authorizationService.requirePermission(...);
    return projectRepository.findByOwnerId(userId)
        .stream()
        .map(ProjectResponse::new)  // DTO constructor takes entity
        .toList();
}
```

DTOs live in `backend/src/main/java/com/academic/backend/dto/` with constructor: `public DTO(Entity entity) { ... }`

### Transaction Scope
Mark mutation methods with `@Transactional`:

```java
@Transactional
public void deleteProject(UUID projectId, UUID currentUserId) {
    authorizationService.requirePermission(projectId, currentUserId, Permission.ADMIN);
    projectRepository.deleteById(projectId);
}
```

## Controller Pattern

### JWT Extraction
Extract JWT and current user ID from request context:

```java
@GetMapping("/api/projects/{projectId}")
public ResponseEntity<ProjectResponse> getProject(
        @PathVariable UUID projectId,
        HttpServletRequest request) {
    
    UUID currentUserId = (UUID) request.getAttribute("userId");  // Set by JwtAuthenticationFilter
    ProjectResponse response = projectService.getProject(projectId, currentUserId);
    return ResponseEntity.ok(response);
}
```

Request attribute `"userId"` is set by [JwtAuthenticationFilter](../../backend/src/main/java/com/academic/backend/security/JwtAuthenticationFilter.java).

### Error Handling
Use [GlobalExceptionHandler](../../backend/src/main/java/com/academic/backend/exception/GlobalExceptionHandler.java):

```java
@GetMapping("/api/projects/{projectId}")
public ResponseEntity<ProjectResponse> getProject(...) {
    // Throw exceptions; @ControllerAdvice catches and formats as JSON
    // ResourceNotFoundException → 404
    // UnauthorizedException → 403
    // ValidationException → 400
    return ResponseEntity.ok(projectService.getProject(projectId, userId));
}
```

Example:
```java
if (project.getOwnerId().equals(currentUserId)) {
    throw new UnauthorizedException("Only project owner can delete");
}
```

## Migration Workflow

### Adding a New Table
**Never use `ddl-auto: update`—always create Flyway migrations.**

1. **Create migration file**: `backend/src/main/resources/db/migration/V{N}__{description}.sql`
   - Increment version number (V2, V3, etc.)
   - Example: `V2__add_notifications_table.sql`

2. **Write SQL** with proper constraints:
   ```sql
   CREATE TABLE notifications (
       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
       type notification_type_enum NOT NULL,
       message TEXT NOT NULL,
       is_read BOOLEAN DEFAULT FALSE,
       created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
       updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
   );
   CREATE INDEX idx_notifications_user_id ON notifications(user_id);
   ```

3. **Add trigger for updated_at** (Hibernate handles via `@UpdateTimestamp`, but DB needs trigger):
   ```sql
   CREATE OR REPLACE FUNCTION update_updated_at()
   RETURNS TRIGGER AS $$
   BEGIN
       NEW.updated_at = CURRENT_TIMESTAMP;
       RETURN NEW;
   END;
   $$ LANGUAGE plpgsql;

   CREATE TRIGGER trigger_notifications_updated_at
   BEFORE UPDATE ON notifications
   FOR EACH ROW
   EXECUTE FUNCTION update_updated_at();
   ```

4. **Create entity** with `@JdbcTypeCode` on enums, `@CreationTimestamp`, `@UpdateTimestamp`

5. **Test migration**: 
   ```bash
   docker compose up -d  # Restart DB
   cd backend && ./mvnw clean spring-boot:run  # Flyway auto-applies V2
   ```

### Modifying Existing Table
Never alter existing tables; create V{N}__{description}.sql:

```sql
-- V3__add_status_to_projects.sql
ALTER TABLE projects ADD COLUMN status project_status_enum DEFAULT 'ACTIVE';
```

Run same test: `docker compose up -d && ./mvnw clean spring-boot:run`

## Security Gotchas

### ⚠️ JWT Secret Hardcoding
Currently in [application.yml](../../backend/src/main/resources/application.yml):
```yaml
app:
  jwt:
    secret: academic-project-manager-secret-key-...
```

**Fix for production**:
```yaml
app:
  jwt:
    secret: ${JWT_SECRET:fallback-for-dev}
```

Set `JWT_SECRET` environment variable in CI/CD and production.

### ⚠️ Authorization Gaps
**Common mistake**: Forgetting `authorizationService.requirePermission()` checks.

Audit all service methods that:
- Access user-specific data
- Modify shared resources (projects, tasks)
- Change permissions or ownership

### ⚠️ Transaction Context
Don't access lazy-loaded relationships outside `@Transactional`:

```java
@Transactional  // REQUIRED to load projectMembers
public List<ProjectResponse> getProjects(UUID userId) {
    return projects.stream()
        .map(p -> new ProjectResponse(p))  // Accesses p.projectMembers
        .toList();
}
```

## Code Style

### Comments
Add `//` comments explaining the **why**, not the obvious:

```java
// Validate JWT but allow expired tokens for grace period (5 min)
LocalDateTime expiryThreshold = tokenIssuedAt.plusMinutes(5);

// Don't: // This validates the JWT token
```

### Naming
- Entities: Singular (`User`, `Project`, `Task`)
- DTOs: Suffix `Response` or `Request` (`ProjectResponse`, `CreateTaskRequest`)
- Repositories: Suffix `Repository` (`ProjectRepository`)
- Services: Suffix `Service` (`ProjectService`, `ProjectAuthorizationService`)

### Testing
See [testing.instructions.md](./testing.instructions.md) for unit/integration test patterns.
