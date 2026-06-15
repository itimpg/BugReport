-- ============================================================
-- Bug Report System - PostgreSQL Schema (Supabase)
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE bug_status AS ENUM ('Open', 'InProgress', 'Resolved', 'Closed');
CREATE TYPE user_role AS ENUM ('Admin', 'User');

-- ============================================================
-- TABLES
-- ============================================================

-- Users
CREATE TABLE users (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email       VARCHAR(255) NOT NULL UNIQUE,
    display_name VARCHAR(255) NOT NULL,
    role        user_role NOT NULL DEFAULT 'User',
    is_disabled BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Categories
CREATE TABLE categories (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Bug Reports
CREATE TABLE bug_reports (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title         VARCHAR(500) NOT NULL,
    description   TEXT NOT NULL,
    status        bug_status NOT NULL DEFAULT 'Open',
    incident_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    image_url     VARCHAR(2000),
    reported_by   UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    is_deleted    BOOLEAN NOT NULL DEFAULT FALSE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Bug Report Categories (junction table for M:N)
CREATE TABLE bug_report_categories (
    bug_report_id UUID NOT NULL REFERENCES bug_reports(id) ON DELETE CASCADE,
    category_id   UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    PRIMARY KEY (bug_report_id, category_id)
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_bug_reports_reported_by   ON bug_reports(reported_by);
CREATE INDEX idx_bug_reports_status        ON bug_reports(status);
CREATE INDEX idx_bug_reports_incident_date ON bug_reports(incident_date DESC);
CREATE INDEX idx_bug_reports_is_deleted    ON bug_reports(is_deleted);
CREATE INDEX idx_bug_reports_title         ON bug_reports USING gin(to_tsvector('english', title));
CREATE INDEX idx_bug_report_categories_cat ON bug_report_categories(category_id);
CREATE INDEX idx_users_email               ON users(email);

-- ============================================================
-- AUTO-UPDATE updated_at via trigger
-- ============================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_bug_reports_updated_at
    BEFORE UPDATE ON bug_reports
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- SEED DATA
-- ============================================================

INSERT INTO categories (name, description) VALUES
    ('UI',        'User interface related bugs'),
    ('API',       'Backend API issues'),
    ('Database',  'Database and data integrity issues'),
    ('Auth',      'Authentication and authorization issues'),
    ('Performance','Performance and speed related bugs'),
    ('Security',  'Security vulnerabilities'),
    ('Mobile',    'Mobile device specific issues'),
    ('Other',     'Other uncategorized bugs');
