-- CareerTrack Relational Schema (PostgreSQL 3NF)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop tables if needed in reverse dependency order
DROP TABLE IF EXISTS notes CASCADE;
DROP TABLE IF EXISTS interviews CASCADE;
DROP TABLE IF EXISTS applications CASCADE;
DROP TABLE IF EXISTS resumes CASCADE;
DROP TABLE IF EXISTS companies CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    target_role VARCHAR(255),
    location VARCHAR(255),
    bio TEXT,
    portfolio_url VARCHAR(500),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Companies Table
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) UNIQUE NOT NULL,
    website VARCHAR(500),
    logo_url VARCHAR(500),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Resumes Vault Table
CREATE TABLE resumes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size_bytes INTEGER NOT NULL,
    mime_type VARCHAR(100) NOT NULL DEFAULT 'application/pdf',
    tag VARCHAR(100) DEFAULT 'General',
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Applications Table
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE RESTRICT,
    resume_id UUID REFERENCES resumes(id) ON DELETE SET NULL,
    job_title VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Applied' CHECK (
        status IN (
            'Wishlist', 'Applied', 'Screening', 'Shortlisted',
            'Interviewing', 'Offer', 'Accepted', 'Rejected',
            'Withdrawn', 'Archived'
        )
    ),
    job_type VARCHAR(50) NOT NULL DEFAULT 'Full-time' CHECK (
        job_type IN ('Full-time', 'Internship', 'Contract', 'Part-time', 'Freelance')
    ),
    work_mode VARCHAR(50) NOT NULL DEFAULT 'Remote' CHECK (
        work_mode IN ('Remote', 'Hybrid', 'On-site')
    ),
    location VARCHAR(255),
    salary_min INTEGER,
    salary_max INTEGER,
    salary_currency VARCHAR(10) DEFAULT 'USD',
    application_url VARCHAR(500),
    description TEXT,
    applied_date DATE DEFAULT CURRENT_DATE,
    deadline_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Interviews Table
CREATE TABLE interviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    round_title VARCHAR(255) NOT NULL,
    round_type VARCHAR(50) NOT NULL DEFAULT 'Technical' CHECK (
        round_type IN ('OA', 'Screening', 'Technical', 'Behavioral', 'HR', 'Final')
    ),
    scheduled_at TIMESTAMPTZ NOT NULL,
    meeting_link VARCHAR(500),
    interviewer_name VARCHAR(255),
    outcome VARCHAR(50) NOT NULL DEFAULT 'Pending' CHECK (
        outcome IN ('Pending', 'Passed', 'Failed')
    ),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Notes Table
CREATE TABLE notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for high-performance lookup & analytics
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_companies_name ON companies(name);
CREATE INDEX idx_resumes_user_id ON resumes(user_id);
CREATE INDEX idx_applications_user_id ON applications(user_id);
CREATE INDEX idx_applications_company_id ON applications(company_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_applied_date ON applications(applied_date);
CREATE INDEX idx_applications_deadline ON applications(deadline_date);
CREATE INDEX idx_interviews_app_id ON interviews(application_id);
CREATE INDEX idx_interviews_scheduled ON interviews(scheduled_at);
CREATE INDEX idx_notes_app_id ON notes(application_id);
