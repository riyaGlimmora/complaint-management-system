-- 001_init_schema.sql
-- Initial schema for the Complaint Management System
-- Run via: npm run migrate

CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- for gen_random_uuid()

-- ========== ROLES ==========
CREATE TABLE roles (
    id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(30) UNIQUE NOT NULL CHECK (name IN ('admin', 'manager', 'staff', 'customer'))
);

-- ========== TEAMS ==========
CREATE TABLE teams (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name       VARCHAR(100) UNIQUE NOT NULL,
    lead_id    UUID, -- FK to users, added after users table exists
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ========== USERS ==========
CREATE TABLE users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name          VARCHAR(150) NOT NULL,
    email         VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role_id       UUID NOT NULL REFERENCES roles(id),
    team_id       UUID REFERENCES teams(id), -- nullable; only staff/manager belong to a team
    is_active     BOOLEAN NOT NULL DEFAULT true,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE teams
    ADD CONSTRAINT fk_teams_lead FOREIGN KEY (lead_id) REFERENCES users(id);

CREATE INDEX idx_users_role_id ON users(role_id);
CREATE INDEX idx_users_team_id ON users(team_id);
CREATE INDEX idx_users_email ON users(email);

-- ========== PRODUCTS ==========
CREATE TABLE products (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(150) NOT NULL,
    category    VARCHAR(100),
    description TEXT,
    team_id     UUID REFERENCES teams(id), -- which team handles complaints for this product
    is_active   BOOLEAN NOT NULL DEFAULT true,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_products_team_id ON products(team_id);

-- Sequence backing human-readable ticket numbers (avoids race conditions that a
-- COUNT(*)-based approach would have under concurrent ticket creation).
CREATE SEQUENCE ticket_number_seq START 1;

-- ========== TICKETS ==========
CREATE TABLE tickets (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_number     VARCHAR(20) UNIQUE NOT NULL,
    title             VARCHAR(200) NOT NULL,
    description       TEXT NOT NULL,
    product_id        UUID NOT NULL REFERENCES products(id),
    customer_id       UUID NOT NULL REFERENCES users(id),
    assigned_team_id  UUID REFERENCES teams(id),
    assigned_staff_id UUID REFERENCES users(id),
    status            VARCHAR(20) NOT NULL DEFAULT 'open'
                        CHECK (status IN ('open', 'in_progress', 'resolved', 'closed', 'reopened')),
    priority          VARCHAR(10) NOT NULL DEFAULT 'medium'
                        CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    resolved_at       TIMESTAMPTZ,
    closed_at         TIMESTAMPTZ
);

CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_assigned_staff_id ON tickets(assigned_staff_id);
CREATE INDEX idx_tickets_assigned_team_id ON tickets(assigned_team_id);
CREATE INDEX idx_tickets_product_id ON tickets(product_id);
CREATE INDEX idx_tickets_customer_id ON tickets(customer_id);
CREATE INDEX idx_tickets_created_at ON tickets(created_at);

-- ========== TICKET HISTORY (append-only audit log) ==========
CREATE TABLE ticket_history (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id   UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    actor_id    UUID REFERENCES users(id),
    action_type VARCHAR(30) NOT NULL, -- e.g. 'status_change', 'assignment', 'comment', 'created'
    old_value   VARCHAR(100),
    new_value   VARCHAR(100),
    note        TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ticket_history_ticket_id ON ticket_history(ticket_id);

-- ========== TICKET COMMENTS ==========
CREATE TABLE ticket_comments (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id    UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    user_id      UUID NOT NULL REFERENCES users(id),
    comment_text TEXT NOT NULL,
    is_internal  BOOLEAN NOT NULL DEFAULT false, -- true = staff-only note, hidden from customer
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ticket_comments_ticket_id ON ticket_comments(ticket_id);

-- ========== ATTACHMENTS ==========
CREATE TABLE attachments (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id   UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    comment_id  UUID REFERENCES ticket_comments(id),
    file_url    VARCHAR(500) NOT NULL,
    uploaded_by UUID REFERENCES users(id),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_attachments_ticket_id ON attachments(ticket_id);

-- ========== SEED ROLES (fixed lookup data) ==========
INSERT INTO roles (name) VALUES ('admin'), ('manager'), ('staff'), ('customer');
