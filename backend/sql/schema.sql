-- Enable UUID generation if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    stripe_customer_id VARCHAR(255) UNIQUE,
    subscription_id VARCHAR(255) UNIQUE,
    subscription_status VARCHAR(50),
    plan_type VARCHAR(50) DEFAULT 'free',
    current_period_end TIMESTAMP WITH TIME ZONE
);

-- Templates Table
CREATE TABLE templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_premium BOOLEAN DEFAULT FALSE,
    thumbnail_url VARCHAR(255),
    html_structure_path VARCHAR(255) NOT NULL,
    css_structure_path VARCHAR(255) NOT NULL,
    customizable_fields JSONB
    -- No created_at/updated_at as per spec for templates
);

-- CVs Table
CREATE TABLE cvs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) DEFAULT 'My CV',
    cv_data JSONB NOT NULL,
    template_id UUID REFERENCES templates(id) ON DELETE SET NULL, -- Or ON DELETE RESTRICT based on desired behavior
    template_customization JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Optional: Indexes for foreign keys or frequently queried columns
CREATE INDEX IF NOT EXISTS idx_cvs_user_id ON cvs(user_id);
CREATE INDEX IF NOT EXISTS idx_cvs_template_id ON cvs(template_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
