
-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ENUMS (Custom Types)


CREATE TYPE role_enum AS ENUM ('STUDENT', 'TEACHER', 'ADMIN');

CREATE TYPE permission_enum AS ENUM ('OWNER', 'EDITOR', 'VIEWER');

CREATE TYPE task_status_enum AS ENUM ('TODO', 'IN_PROGRESS', 'DONE');

CREATE TYPE priority_enum AS ENUM ('HIGH', 'MEDIUM', 'LOW');

CREATE TYPE project_status_enum AS ENUM ('ACTIVE', 'ARCHIVED');

CREATE TYPE generation_status_enum AS ENUM ('PENDING', 'DONE', 'FAILED');

CREATE TYPE notif_type_enum AS ENUM (
    'TASK_ASSIGNED',
    'COMMENTED',
    'AI_READY',
    'STATUS_CHANGED'
);

-- Table: users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role role_enum NOT NULL DEFAULT 'STUDENT',
    avatar_url VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Index on email for fast login queries
CREATE INDEX idx_users_email ON users(email);

-- Table: projects
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    status project_status_enum NOT NULL DEFAULT 'ACTIVE',
    deadline TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_projects_owner 
        FOREIGN KEY (owner_id) 
        REFERENCES users(id) 
        ON DELETE RESTRICT
);

-- Index for filtering projects by owner
CREATE INDEX idx_projects_owner ON projects(owner_id);

-- Index for filtering by status
CREATE INDEX idx_projects_status ON projects(status);

-- Table: project_members
CREATE TABLE project_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL,
    user_id UUID NOT NULL,
    permission permission_enum NOT NULL DEFAULT 'VIEWER',
    joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_members_project 
        FOREIGN KEY (project_id) 
        REFERENCES projects(id) 
        ON DELETE CASCADE,
    
    CONSTRAINT fk_members_user 
        FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE,
    
    -- Ensure a user can only be a member once per project
    CONSTRAINT uq_project_user UNIQUE (project_id, user_id)
);

-- Index for querying a user's projects
CREATE INDEX idx_members_user ON project_members(user_id);

-- Index for querying a project's members
CREATE INDEX idx_members_project ON project_members(project_id);

-- Table: gemini_generations
CREATE TABLE gemini_generations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL,
    created_by UUID NOT NULL,
    prompt TEXT NOT NULL,
    raw_response TEXT,
    status generation_status_enum NOT NULL DEFAULT 'PENDING',
    tokens_used INTEGER DEFAULT 0,
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_generations_project 
        FOREIGN KEY (project_id) 
        REFERENCES projects(id) 
        ON DELETE CASCADE,
    
    CONSTRAINT fk_generations_user 
        FOREIGN KEY (created_by) 
        REFERENCES users(id) 
        ON DELETE CASCADE
);

-- Index for querying generations by project
CREATE INDEX idx_generations_project ON gemini_generations(project_id);

-- Index for querying generations by status
CREATE INDEX idx_generations_status ON gemini_generations(status);

-- Table: tasks
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL,
    assigned_to UUID,
    generation_id UUID,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    status task_status_enum NOT NULL DEFAULT 'TODO',
    priority priority_enum NOT NULL DEFAULT 'MEDIUM',
    due_date TIMESTAMP,
    estimated_days INTEGER,
    ai_generated BOOLEAN NOT NULL DEFAULT FALSE,
    position INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_tasks_project 
        FOREIGN KEY (project_id) 
        REFERENCES projects(id) 
        ON DELETE CASCADE,
    
    CONSTRAINT fk_tasks_assigned 
        FOREIGN KEY (assigned_to) 
        REFERENCES users(id) 
        ON DELETE SET NULL,
    
    CONSTRAINT fk_tasks_generation 
        FOREIGN KEY (generation_id) 
        REFERENCES gemini_generations(id) 
        ON DELETE SET NULL
);

-- Index for querying tasks by project
CREATE INDEX idx_tasks_project ON tasks(project_id);

-- Index for querying tasks by status (for Kanban columns)
CREATE INDEX idx_tasks_status ON tasks(status);

-- Index for querying tasks assigned to a user
CREATE INDEX idx_tasks_assigned ON tasks(assigned_to);

-- Index for ordering tasks by position
CREATE INDEX idx_tasks_position ON tasks(project_id, status, position);

-- Table: labels
CREATE TABLE labels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL,
    name VARCHAR(50) NOT NULL,
    color VARCHAR(7) NOT NULL, -- Hex color code #RRGGBB
    
    CONSTRAINT fk_labels_project 
        FOREIGN KEY (project_id) 
        REFERENCES projects(id) 
        ON DELETE CASCADE,
    
    -- Ensure label names are unique within a project
    CONSTRAINT uq_project_label UNIQUE (project_id, name)
);

-- Index for querying labels by project
CREATE INDEX idx_labels_project ON labels(project_id);

-- Table: task_labels (Many-to-Many)
CREATE TABLE task_labels (
    task_id UUID NOT NULL,
    label_id UUID NOT NULL,
    
    PRIMARY KEY (task_id, label_id),
    
    CONSTRAINT fk_task_labels_task 
        FOREIGN KEY (task_id) 
        REFERENCES tasks(id) 
        ON DELETE CASCADE,
    
    CONSTRAINT fk_task_labels_label 
        FOREIGN KEY (label_id) 
        REFERENCES labels(id) 
        ON DELETE CASCADE
);

-- Table: comments
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL,
    author_id UUID NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_comments_task 
        FOREIGN KEY (task_id) 
        REFERENCES tasks(id) 
        ON DELETE CASCADE,
    
    CONSTRAINT fk_comments_author 
        FOREIGN KEY (author_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE
);

-- Index for querying comments by task
CREATE INDEX idx_comments_task ON comments(task_id);

-- Table: attachments
CREATE TABLE attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL,
    uploaded_by UUID NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_size BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_attachments_task 
        FOREIGN KEY (task_id) 
        REFERENCES tasks(id) 
        ON DELETE CASCADE,
    
    CONSTRAINT fk_attachments_uploader 
        FOREIGN KEY (uploaded_by) 
        REFERENCES users(id) 
        ON DELETE CASCADE
);

-- Index for querying attachments by task
CREATE INDEX idx_attachments_task ON attachments(task_id);

-- Table: notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id UUID NOT NULL,
    type notif_type_enum NOT NULL,
    message TEXT NOT NULL,
    ref_project_id UUID,
    ref_task_id UUID,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_notifications_recipient 
        FOREIGN KEY (recipient_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE,
    
    CONSTRAINT fk_notifications_project 
        FOREIGN KEY (ref_project_id) 
        REFERENCES projects(id) 
        ON DELETE CASCADE,
    
    CONSTRAINT fk_notifications_task 
        FOREIGN KEY (ref_task_id) 
        REFERENCES tasks(id) 
        ON DELETE CASCADE
);

-- Index for querying unread notifications
CREATE INDEX idx_notifications_recipient_unread 
    ON notifications(recipient_id, is_read);

-- Table: activity_logs
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL,
    actor_id UUID NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    target_id UUID,
    target_type VARCHAR(50),
    metadata JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_logs_project 
        FOREIGN KEY (project_id) 
        REFERENCES projects(id) 
        ON DELETE CASCADE,
    
    CONSTRAINT fk_logs_actor 
        FOREIGN KEY (actor_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE
);

-- Index for querying logs by project
CREATE INDEX idx_logs_project ON activity_logs(project_id);

-- Index for querying logs by date
CREATE INDEX idx_logs_date ON activity_logs(created_at DESC);

-- JSONB GIN index for efficient metadata queries
CREATE INDEX idx_logs_metadata ON activity_logs USING GIN (metadata);

-- =====================================================
-- TRIGGERS (auto-update timestamps)
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to projects table
CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to tasks table
CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to comments table
CREATE TRIGGER update_comments_updated_at
    BEFORE UPDATE ON comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- SEED DATA (Optional - for development)

-- Insert a default admin user (password: "admin123" hashed with BCrypt)
-- BCrypt hash for "admin123": $2a$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
-- You'll generate the real hash in Spring Boot later
INSERT INTO users (id, name, email, password_hash, role, is_active)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Admin User',
    'admin@academic.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', -- "admin123"
    'ADMIN',
    TRUE
);
