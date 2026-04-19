# Academic Project Manager

## Tech Stack
- **Spring Boot 4.0.4**, **Java 21**, **PostgreSQL 16** (Docker Compose)
- **Flyway** migrations (`backend/src/main/resources/db/migration/`)
- **Spring Security** + **JWT** (jjwt 0.12.6)
- **Angular 21** frontend + Angular Material + TailwindCSS
- JPA `ddl-auto: validate` — never change to `update`

## Dev Commands
```bash
# Database (run first)
docker compose up -d

# Backend
cd backend && ./mvnw clean spring-boot:run
# Run single test: ./mvnw test -Dtest=ClassName

# Frontend
cd frontend && npm start
# Tests use Vitest: npm test
```

## Architecture
- **DB-first**: Schema in Flyway SQL, JPA entities are read-only
- All tables use UUID primary keys via `gen_random_uuid()` / `pgcrypto`
- `updated_at` auto-updated via PostgreSQL triggers
- Frontend proxies `/api` → `localhost:8080` (backend)

## DB Conventions
- Seed admin: `admin@academic.com` / `admin123` (UUID `00000000-0000-0000-0000-000000000001`)
- Connection: `localhost:5432/academic_db` with `postgres/postgres`
- pgAdmin: http://localhost:5050 (`admin@academic.com` / `admin`)

## Auth
| Method | Endpoint | Auth |
|--------|----------|------|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/me` | JWT |

## Config (application.yml)
- JWT secret hardcoded — never commit real secrets
- JWT expiration: 86400000ms (24h)
- CORS allowed origins: `http://localhost:4200`

## Hibernate Enum Handling
```java
@Enumerated(EnumType.STRING) @JdbcTypeCode(SqlTypes.NAMED_ENUM) @Column(columnDefinition = "role_enum")
```

## Code Style
- Add `//` comments explaining **why**, not the obvious
- Example: `// Validate JWT token` not `// This validates the JWT token`