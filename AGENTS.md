# Academic Project Manager

## Tech Stack
- **Spring Boot 4.0.4**, **Java 21**
- **PostgreSQL** via Docker Compose
- **Flyway** for migrations (`backend/src/main/resources/db/migration/`)
- **Spring Security** + **JWT** (jjwt 0.12.6)
- **Lombok** for entity boilerplate
- **WebSocket** for real-time features
- JPA `ddl-auto: validate` — never change to `update`

## Dev Setup

```bash
# Start DB
docker compose up -d

# Run app (uses mvnw)
cd backend && ./mvnw clean spring-boot:run

# Run tests
cd backend && ./mvnw test

# Run single test
cd backend && ./mvnw test -Dtest=BackendApplicationTests
```

**Prerequisites**: Docker must be running for the Postgres container. The app connects to `localhost:5432/academic_db` with `postgres/postgres`.

## Package Structure
- `controller/` - REST controllers (AuthController)
- `service/` - Business logic (AuthService, UserDetailsServiceImpl)
- `repository/` - JPA repositories (UserRepository)
- `security/` - JWT, filters, UserDetails
- `config/` - Security configuration
- `dto/` - Request/Response DTOs
- `exception/` - Global exception handling
- `shared/entity/` - JPA entities
- `shared/enums/` - PostgreSQL enum types

## Architecture
- DB schema is DB-first via Flyway SQL (`V1__init_schema.sql`). JPA entities are read-only for schema enforcement.
- JWT secret is hardcoded in `application.yml` — do not commit real secrets.

## DB Conventions
- All tables use UUID primary keys via `gen_random_uuid()` / `pgcrypto`
- `updated_at` auto-updated via PostgreSQL triggers
- Seed admin user: `admin@academic.com` / `admin123` (UUID `00000000-0000-0000-0000-000000000001`)

## Hibernate Enum Handling
- All enum fields must use `@JdbcTypeCode(SqlTypes.NAMED_ENUM)` for PostgreSQL native enums
- Example: `@Enumerated(EnumType.STRING) @JdbcTypeCode(SqlTypes.NAMED_ENUM) @Column(columnDefinition = "role_enum")`

## Auth Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login (returns JWT)
- `GET /api/auth/me` - Get current user (requires JWT in Authorization header)
- Public endpoints: `/api/auth/login`, `/api/auth/register`
- Protected endpoints: `/api/auth/me`, `/api/**`

## Code Style
- Add `//` comments to all non-trivial methods and logic blocks
- Comments should be professional, short, and explain the **why** or **what** — not the obvious
- Example: `// Validate JWT token` not `// This validates the JWT token`
