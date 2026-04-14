# Academic Project Manager — Workspace Instructions

This is a **Spring Boot + Angular** full-stack project with a DB-first architecture. These instructions help you navigate patterns, conventions, and workflows efficiently.

## Quick Navigation

| Need | File |
|------|------|
| **Tech stack, commands, database info** | [AGENTS.md](./AGENTS.md) |
| **Backend: Entities, services, controllers, migrations, security** | [.github/instructions/backend.instructions.md](.github/instructions/backend.instructions.md) |
| **Frontend: Components, services, forms, interceptors, auth** | [.github/instructions/frontend.instructions.md](.github/instructions/frontend.instructions.md) |
| **Testing: JUnit5/Mockito (backend), Vitest (frontend)** | [.github/instructions/testing.instructions.md](.github/instructions/testing.instructions.md) |
| **How-to: Add entity, build screen, run migrations** | [.github/prompts/common-workflows.prompt.md](.github/prompts/common-workflows.prompt.md) |

## Getting Started

### 1. Start the Development Environment
```bash
# Terminal 1: Start PostgreSQL + pgAdmin
docker compose up -d

# Terminal 2: Run backend (Spring Boot)
cd backend && ./mvnw clean spring-boot:run
# Backend: http://localhost:8080
# pgAdmin: http://localhost:5050

# Terminal 3: Run frontend (Angular)
cd frontend && npm start
# Frontend: http://localhost:4200

# Test credentials
# ✉️ admin@academic.com / password: admin123
```

### 2. Key Concepts to Know

#### DB-First Architecture
- Schema is defined in **Flyway SQL** (`backend/src/main/resources/db/migration/`)
- JPA entities are read-only mappings (enforced via `ddl-auto: validate`)
- **Never** change `ddl-auto` to `update`
- All schema changes go through migrations: `V{N}__{description}.sql`

#### Enum Handling (Must Use This Pattern)
```java
@Enumerated(EnumType.STRING)
@JdbcTypeCode(SqlTypes.NAMED_ENUM)
@Column(columnDefinition = "role_enum")
private Role role;
```
PostgreSQL uses native enum types; this triple annotation ensures proper mapping.

#### Timestamps
```java
@CreationTimestamp private LocalDateTime createdAt;  // Set once, never changes
@UpdateTimestamp private LocalDateTime updatedAt;     // Auto-updated on every change
```

#### Authorization (Required on Every Protected Method)
```java
public ProjectResponse getProject(UUID projectId, UUID userId) {
    authorizationService.requirePermission(projectId, userId, Permission.VIEWER);
    // ... fetch and return
}
```
Missing these checks = **security vulnerability**.

### 3. Security Reminders

⚠️ **JWT Secret** (`application.yml`) is hardcoded for dev. Must use environment variables in production:
```yaml
app:
  jwt:
    secret: ${JWT_SECRET:fallback}
```

⚠️ **Frontend localStorage** (for JWT token) is exposed to XSS. Consider `httpOnly` cookies for production.

⚠️ **Authorization gaps** — audit controllers/services for missing `requirePermission()` calls.

## Development Workflow

### Adding a New Entity (Backend)
1. **Create migration** in `backend/src/main/resources/db/migration/V{N}__{description}.sql`
2. **Create entity** with `@JdbcTypeCode` on enums, timestamps
3. **Create DTO** for responses
4. **Create repository**, service (with auth checks), controller
5. **Test**: Run `docker compose up -d && ./mvnw clean spring-boot:run`

See [.github/prompts/common-workflows.prompt.md](.github/prompts/common-workflows.prompt.md) for step-by-step.

### Building a Frontend Screen
1. **Create service** with typed request/response interfaces
2. **Create component** (standalone) with reactive forms
3. **Create template** with Material UI
4. **Add route** to `frontend/src/app/app.routes.ts`
5. **Test**: `npm start` and navigate

### Writing Tests
- **Backend**: JUnit5 + Mockito (mock repositories and auth service)
- **Frontend**: Vitest + TestBed (mock HTTP client and services)

See [.github/instructions/testing.instructions.md](.github/instructions/testing.instructions.md) for patterns and examples.

## Code Style

- **Comments**: Explain the **why**, not the obvious. Example: `// Validate JWT with 5-min grace period`
- **Naming**: Entities (singular), DTOs (Response/Request), Services (suffix Service)
- **Authorization**: Always `authorizationService.requirePermission()` before returning data
- **Transactions**: Mark mutations with `@Transactional`
- **Error handling**: Throw exceptions; [GlobalExceptionHandler](./backend/src/main/java/com/academic/backend/exception/GlobalExceptionHandler.java) catches and formats

## Useful Commands

```bash
# Backend
cd backend && ./mvnw clean spring-boot:run              # Run
cd backend && ./mvnw test                               # All tests
cd backend && ./mvnw test -Dtest=ClassName              # Single test
cd backend && ./mvnw clean compile                      # Compile only

# Frontend
cd frontend && npm start                                # Dev server
cd frontend && npm test                                 # Vitest
cd frontend && npm run build                            # Production build

# Database
docker compose up -d                                    # Start DB + pgAdmin
docker compose down                                     # Stop DB
docker compose logs postgres                            # View DB logs
docker exec -it academic-db psql -U postgres -d academic_db  # Connect to DB
```

## Exemplar Files (Follow These Patterns)

| Layer | Exemplar File |
|-------|---|
| Entity | [User.java](./backend/src/main/java/com/academic/backend/shared/entity/User.java), [Task.java](./backend/src/main/java/com/academic/backend/shared/entity/Task.java) |
| Service | [ProjectService.java](./backend/src/main/java/com/academic/backend/service/ProjectService.java), [AuthService.java](./backend/src/main/java/com/academic/backend/service/AuthService.java) |
| Controller | [ProjectController.java](./backend/src/main/java/com/academic/backend/controller/ProjectController.java) |
| Migration | [V1__init_schema.sql](./backend/src/main/resources/db/migration/V1__init_schema.sql) |
| Angular Component | [LoginComponent](./frontend/src/app/auth/login/login.component.ts) |
| Angular Service | [AuthService](./frontend/src/app/core/services/auth.service.ts) |

## When Things Break

### Backend Won't Start
```bash
# Check if DB is running
docker compose ps
# If not: docker compose up -d

# Check logs
./mvnw clean spring-boot:run -X | grep -i error

# Validate migration ran
docker exec academic-db psql -U postgres -d academic_db -c "\dt"
```

### Frontend Errors
```bash
# Clear cache and reinstall
cd frontend && rm -rf node_modules package-lock.json && npm install

# Check if backend is running
curl http://localhost:8080/api/auth/me

# Open DevTools (F12) → Console and Network tabs
```

### JWT Token Issues
- Token not in `localStorage`? Check [AuthService.login()](./frontend/src/app/core/services/auth.service.ts)
- `401 Unauthorized`? Token may be expired or not in `Authorization: Bearer {token}` header
- Check [authInterceptor](./frontend/src/app/core/interceptors/auth.interceptor.ts)

## More Help

- **Detailed backend patterns**: [.github/instructions/backend.instructions.md](.github/instructions/backend.instructions.md)
- **Detailed frontend patterns**: [.github/instructions/frontend.instructions.md](.github/instructions/frontend.instructions.md)
- **How to do common tasks**: [.github/prompts/common-workflows.prompt.md](.github/prompts/common-workflows.prompt.md)
- **Test examples**: [.github/instructions/testing.instructions.md](.github/instructions/testing.instructions.md)
