# Academic Project Manager

A comprehensive full-stack application designed to manage academic projects, featuring AI-powered task generation, secure authentication, and a modern responsive interface.

## 🚀 Tech Stack

### Backend
- **Java 21**
- **Spring Boot 4.0.4**
- **PostgreSQL 16** (Containerized)
- **Flyway** for Database Migrations
- **Spring Security + JWT** 
- **Groq API** for AI-powered features

### Frontend
- **Angular 21**
- **Angular Material**
- **TailwindCSS**

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your machine:
- [Java 21](https://jdk.java.net/21/)
- [Node.js & npm](https://nodejs.org/) (Compatible with Angular 21)
- [Docker & Docker Compose](https://www.docker.com/products/docker-desktop/)

## 🛠️ Local Development Setup

Follow these steps to get the application running on your local machine.

### 1. Database & Infrastructure

The project uses Docker Compose to run PostgreSQL and pgAdmin. Make sure Docker is running before executing this command.

```bash
# Start the database and pgAdmin containers in the background
docker compose up -d
```

**Database Connection Details:**
- **Host:** `localhost:5432`
- **Database:** `academic_db`
- **Username:** `postgres`
- **Password:** `postgres`

**pgAdmin (Database GUI):**
- **URL:** [http://localhost:5050]
- **Login Email:** `admin@academic.com`
- **Login Password:** `admin`


### 2. Backend Setup

The backend is a Spring Boot application. It uses the Maven Wrapper, so you don't need to install Maven globally.

```bash
cd backend

# Run the Spring Boot application
./mvnw clean spring-boot:run
```
The backend server will start at `http://localhost:8080`.

*(Note: If you are utilizing the Groq API features, ensure your API keys are properly configured in your backend `.env` file or application properties).*

### 3. Frontend Setup

The frontend is an Angular application. 

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm start
```
The frontend will be accessible at `http://localhost:4200`. 


## 🏗️ Architecture & Database Conventions

- **DB-First Approach**: The database schema is strictly managed by Flyway migrations located in `backend/src/main/resources/db/migration/`. JPA entities are representations of the schema (`ddl-auto: validate` is strictly enforced).
- **UUIDs**: All tables use UUID primary keys, generated natively by PostgreSQL via `gen_random_uuid()` using the `pgcrypto` extension.
- **Timestamps**: The `updated_at` timestamps are automatically maintained by PostgreSQL database triggers.

