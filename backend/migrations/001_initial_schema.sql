-- PULSO MVP - Database Schema
-- Initial migration for PostgreSQL
-- Created: 2024-01-15

-- ============================================================================
-- Extension: UUID Support
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ============================================================================
-- Table: users
-- Purpose: Store user accounts and authentication
-- ============================================================================

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    plan VARCHAR(50) NOT NULL DEFAULT 'free',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for users table
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_email_active ON users(email, is_active);
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_users_plan ON users(plan);


-- ============================================================================
-- Table: profiles
-- Purpose: Store user professional profiles for salary analysis
-- ============================================================================

CREATE TABLE IF NOT EXISTS profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    titulo_cargo VARCHAR(255) NOT NULL,
    años_experiencia INTEGER NOT NULL,
    años_en_cargo_actual INTEGER NOT NULL DEFAULT 0,
    liderazgo INTEGER NOT NULL DEFAULT 0,
    competencias_json JSONB,
    educacion VARCHAR(100) NOT NULL,
    industria VARCHAR(100) NOT NULL,
    tamaño_empresa VARCHAR(50) NOT NULL,
    region VARCHAR(100) NOT NULL,
    peso_calculado NUMERIC(10, 2),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_profiles_user_id
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for profiles table
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_created_at ON profiles(created_at);
CREATE INDEX idx_profiles_industria_tamaño ON profiles(industria, tamaño_empresa);
CREATE INDEX idx_profiles_peso ON profiles(peso_calculado);
CREATE INDEX idx_profiles_educacion ON profiles(educacion);


-- ============================================================================
-- Table: analyses
-- Purpose: Store salary analysis results
-- ============================================================================

CREATE TABLE IF NOT EXISTS analyses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    profile_id INTEGER NOT NULL,
    salario_actual_usd NUMERIC(12, 2) NOT NULL,
    peso_persona NUMERIC(10, 2) NOT NULL,
    p50_usd NUMERIC(12, 2) NOT NULL,
    brecha_pct NUMERIC(10, 2) NOT NULL,
    recomendaciones TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_analyses_user_id
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

    CONSTRAINT fk_analyses_profile_id
        FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
);

-- Indexes for analyses table
CREATE INDEX idx_analyses_user_id ON analyses(user_id);
CREATE INDEX idx_analyses_profile_id ON analyses(profile_id);
CREATE INDEX idx_analyses_created_at ON analyses(created_at);
CREATE INDEX idx_analyses_peso ON analyses(peso_persona);
CREATE INDEX idx_analyses_brecha ON analyses(brecha_pct);


-- ============================================================================
-- Table: salary_benchmarks
-- Purpose: Store market salary data for comparison
-- ============================================================================

CREATE TABLE IF NOT EXISTS salary_benchmarks (
    id SERIAL PRIMARY KEY,
    cargo_nombre VARCHAR(255) NOT NULL,
    industria VARCHAR(100) NOT NULL,
    tamaño_empresa VARCHAR(50) NOT NULL,
    region VARCHAR(100) NOT NULL,
    peso NUMERIC(10, 2) NOT NULL,
    p50_usd NUMERIC(12, 2) NOT NULL,
    p25_usd NUMERIC(12, 2),
    p75_usd NUMERIC(12, 2),
    p90_usd NUMERIC(12, 2),
    sample_size INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for salary_benchmarks table
CREATE INDEX idx_benchmarks_cargo_nombre ON salary_benchmarks(cargo_nombre);
CREATE INDEX idx_benchmarks_industria_tamaño_region
    ON salary_benchmarks(industria, tamaño_empresa, region);
CREATE INDEX idx_benchmarks_peso ON salary_benchmarks(peso);
CREATE INDEX idx_benchmarks_p50_usd ON salary_benchmarks(p50_usd);
CREATE INDEX idx_benchmarks_created_at ON salary_benchmarks(created_at);


-- ============================================================================
-- Table: factor_weights
-- Purpose: Store algorithm factor weights with version control
-- ============================================================================

CREATE TABLE IF NOT EXISTS factor_weights (
    id SERIAL PRIMARY KEY,
    factor_name VARCHAR(255) NOT NULL UNIQUE,
    weight NUMERIC(5, 4) NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for factor_weights table
CREATE INDEX idx_factor_weights_factor_name ON factor_weights(factor_name);
CREATE INDEX idx_factor_weights_version ON factor_weights(version);
CREATE INDEX idx_factor_weights_created_at ON factor_weights(created_at);


-- ============================================================================
-- Initial Data: Factor Weights
-- ============================================================================

INSERT INTO factor_weights (factor_name, weight, version, description)
VALUES
    ('complejidad_intelectual', 0.15, 1, 'Intellectual complexity and technical depth'),
    ('liderazgo', 0.12, 1, 'Leadership and team management'),
    ('autonomia', 0.10, 1, 'Autonomy and decision-making power'),
    ('seniority', 0.20, 1, 'Career seniority level'),
    ('mercado', 0.12, 1, 'Market demand and industry'),
    ('impacto', 0.10, 1, 'Business impact and scope'),
    ('contexto', 0.10, 1, 'Company context and size'),
    ('educacion', 0.11, 1, 'Educational background')
ON CONFLICT (factor_name) DO NOTHING;


-- ============================================================================
-- Sample Benchmarks Data (Optional - for testing)
-- ============================================================================

-- Note: Uncomment to load sample data during development

INSERT INTO salary_benchmarks
    (cargo_nombre, industria, tamaño_empresa, region, peso, p50_usd, p25_usd, p75_usd, p90_usd, sample_size)
VALUES
    ('Senior Backend Engineer', 'SaaS', '50-500', 'Santiago', 680, 85000, 70000, 100000, 120000, 45),
    ('Senior Backend Engineer', 'FinTech', '50-500', 'Santiago', 700, 95000, 80000, 110000, 130000, 32),
    ('Senior Backend Engineer', 'Large Corp', '5k+', 'Santiago', 700, 75000, 65000, 90000, 110000, 28),
    ('Backend Engineer', 'SaaS', '50-500', 'Santiago', 550, 65000, 55000, 75000, 90000, 38),
    ('Backend Engineer', 'Startup', '1-50', 'Santiago', 500, 60000, 50000, 70000, 85000, 25),
    ('Full Stack Engineer', 'SaaS', '50-500', 'Santiago', 600, 70000, 60000, 85000, 100000, 40),
    ('Product Manager', 'SaaS', '50-500', 'Santiago', 620, 80000, 70000, 95000, 115000, 35),
    ('Data Engineer', 'FinTech', '50-500', 'Santiago', 640, 90000, 75000, 105000, 125000, 30),
    ('Frontend Engineer', 'SaaS', '50-500', 'Santiago', 580, 72000, 62000, 85000, 100000, 42),
    ('DevOps Engineer', 'SaaS', '50-500', 'Santiago', 660, 88000, 75000, 105000, 125000, 28)
ON CONFLICT DO NOTHING;


-- ============================================================================
-- Views (Optional - for analytics)
-- ============================================================================

-- View: User Analysis Summary
CREATE OR REPLACE VIEW v_user_analysis_summary AS
SELECT
    u.id,
    u.email,
    u.full_name,
    u.plan,
    COUNT(DISTINCT a.id) AS total_analyses,
    MAX(a.created_at) AS last_analysis_date,
    ROUND(AVG(a.brecha_pct)::numeric, 2) AS avg_salary_gap,
    ROUND(AVG(a.peso_persona)::numeric, 0) AS avg_profile_weight
FROM users u
LEFT JOIN analyses a ON u.id = a.user_id
WHERE u.is_active = true
GROUP BY u.id, u.email, u.full_name, u.plan;


-- ============================================================================
-- End of Schema Migration
-- ============================================================================