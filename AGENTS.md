# Academic Project Manager

## Tech Stack
- **Spring Boot 4.0.4**, **Java 21**, **PostgreSQL 16** (via Docker Compose)
- **Flyway** migrations (`backend/src/main/resources/db/migration/`)
- **Spring Security** + **JWT** (jjwt 0.12.6)
- **Angular 21** frontend
- JPA `ddl-auto: validate` — never change to `update`

## Dev Commands

```bash
# Database (run first)
docker compose up -d

# Backend
cd backend && ./mvnw clean spring-boot:run
cd backend && ./mvnw test -Dtest=ClassName

# Frontend (API proxy at localhost:4200/api -> localhost:8080)
cd frontend && npm start
cd frontend && npm test
```

## Architecture
- **DB-first**: Schema in Flyway SQL, JPA entities are read-only
- JWT secret hardcoded in `application.yml` — never commit real secrets
- All tables use UUID primary keys via `gen_random_uuid()` / `pgcrypto`
- `updated_at` auto-updated via PostgreSQL triggers

## DB Conventions
- Seed admin: `admin@academic.com` / `admin123` (UUID `00000000-0000-0000-0000-000000000001`)
- Connection: `localhost:5432/academic_db` with `postgres/postgres`
- **pgAdmin**: http://localhost:5050 (`admin@academic.com` / `admin`)

## Hibernate Enum Handling
```java
@Enumerated(EnumType.STRING) @JdbcTypeCode(SqlTypes.NAMED_ENUM) @Column(columnDefinition = "role_enum")
```

## Auth Endpoints
| Method | Endpoint | Auth |
|--------|----------|------|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/me` | JWT Required |

## Code Style
- Add `//` comments to non-trivial methods explaining the **why**, not the obvious
- Example: `// Validate JWT token` not `// This validates the JWT token`
