-- PULSO v2 Database Schema
-- Creado para Supabase PostgreSQL
-- Ejecutar TODO este SQL en Supabase Query Editor

-- 1. Tabla: users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  profile_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  deleted_at TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);

-- 2. Tabla: analyses
CREATE TABLE analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255),

  -- Input datos
  current_salary DECIMAL(12,2),
  years_experience INTEGER,
  education_level VARCHAR(100),
  job_title VARCHAR(255),
  industry VARCHAR(100),
  company_size VARCHAR(50),

  -- Factores (8 factores de Codify adaptados)
  factor_technical_skills DECIMAL(5,2),
  factor_soft_skills DECIMAL(5,2),
  factor_leadership DECIMAL(5,2),
  factor_experience DECIMAL(5,2),
  factor_education DECIMAL(5,2),
  factor_market_demand DECIMAL(5,2),
  factor_industry_maturity DECIMAL(5,2),
  factor_geographic_location DECIMAL(5,2),

  -- Resultados
  weighted_score DECIMAL(10,4),
  market_salary_p50 DECIMAL(12,2),
  market_salary_p25 DECIMAL(12,2),
  market_salary_p75 DECIMAL(12,2),
  salary_gap DECIMAL(12,2),
  salary_gap_percentage DECIMAL(6,2),
  percentile DECIMAL(5,2),
  recommendation TEXT,

  -- Skills extraído por Claude API
  technical_skills JSONB DEFAULT '[]'::jsonb,
  soft_skills JSONB DEFAULT '[]'::jsonb,

  -- Metadata
  status VARCHAR(50) DEFAULT 'completed',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_analyses_user_id ON analyses(user_id);
CREATE INDEX idx_analyses_created_at ON analyses(created_at);
CREATE INDEX idx_analyses_status ON analyses(status);

-- 3. Tabla: salary_benchmarks
CREATE TABLE salary_benchmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_title VARCHAR(255),
  industry VARCHAR(100),
  company_size VARCHAR(50),
  years_experience_min INTEGER,
  years_experience_max INTEGER,

  salary_p25 DECIMAL(12,2),
  salary_p50 DECIMAL(12,2),
  salary_p75 DECIMAL(12,2),
  salary_mean DECIMAL(12,2),

  data_points_count INTEGER DEFAULT 0,
  region VARCHAR(100),

  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_benchmarks_job_title ON salary_benchmarks(job_title);
CREATE INDEX idx_benchmarks_industry ON salary_benchmarks(industry);
CREATE INDEX idx_benchmarks_experience ON salary_benchmarks(years_experience_min, years_experience_max);

-- 4. Tabla: factor_weights (configuración del motor de pesaje)
CREATE TABLE factor_weights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  factor_name VARCHAR(100) UNIQUE NOT NULL,
  weight DECIMAL(5,4) NOT NULL,
  description TEXT,
  min_value DECIMAL(5,2) DEFAULT 0,
  max_value DECIMAL(5,2) DEFAULT 10,
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_factor_weights_active ON factor_weights(is_active);

-- 5. Tabla: audit_logs (para GDPR, tracking, debugging)
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100),
  resource_type VARCHAR(100),
  resource_id UUID,
  changes JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- SEED DATA (Datos de prueba)

-- Usuarios de prueba
INSERT INTO users (email, password_hash, full_name, profile_data) VALUES
('test1@pulso.cl', '$2a$10$0Bb2p8C3Y5qHU8v0w0w0wON/Q1Q1Q1Q1Q1Q1Q1Q1Q1Q1Q1Q1Q1Q1', 'Marco Vargas', '{"role":"engineer","industry":"tech"}'),
('test2@pulso.cl', '$2a$10$0Bb2p8C3Y5qHU8v0w0w0wON/Q1Q1Q1Q1Q1Q1Q1Q1Q1Q1Q1Q1Q1Q1', 'Jane Doe', '{"role":"manager","industry":"finance"}')
ON CONFLICT DO NOTHING;

-- Factor weights (configuración del motor)
INSERT INTO factor_weights (factor_name, weight, description, min_value, max_value) VALUES
('technical_skills', 0.20, 'Habilidades técnicas especializadas', 0, 10),
('soft_skills', 0.15, 'Comunicación, trabajo en equipo', 0, 10),
('leadership', 0.15, 'Experiencia liderando equipos', 0, 10),
('experience', 0.15, 'Años de experiencia relevante', 0, 10),
('education', 0.10, 'Nivel educativo y certificaciones', 0, 10),
('market_demand', 0.10, 'Demanda actual en el mercado', 0, 10),
('industry_maturity', 0.08, 'Madurez y estabilidad de industria', 0, 10),
('geographic_location', 0.07, 'Ubicación geográfica', 0, 10)
ON CONFLICT (factor_name) DO NOTHING;

-- Benchmarks salariales de prueba (datos ficticios pero realistas para Chile)
INSERT INTO salary_benchmarks (job_title, industry, company_size, years_experience_min, years_experience_max, salary_p25, salary_p50, salary_p75, salary_mean, data_points_count, region) VALUES
('Software Engineer', 'Technology', 'Large', 1, 3, 2500000, 3200000, 4000000, 3300000, 150, 'Santiago'),
('Software Engineer', 'Technology', 'Large', 4, 7, 3800000, 4800000, 6000000, 4900000, 120, 'Santiago'),
('Senior Software Engineer', 'Technology', 'Large', 8, 15, 5500000, 7000000, 8500000, 7100000, 90, 'Santiago'),
('Product Manager', 'Technology', 'Large', 2, 5, 3200000, 4200000, 5200000, 4300000, 75, 'Santiago'),
('Product Manager', 'Technology', 'Large', 6, 10, 4800000, 6200000, 7800000, 6300000, 60, 'Santiago'),
('Data Scientist', 'Technology', 'Large', 1, 4, 2800000, 3800000, 4800000, 3900000, 85, 'Santiago'),
('Data Scientist', 'Technology', 'Large', 5, 10, 4200000, 5500000, 7000000, 5600000, 70, 'Santiago'),
('Business Analyst', 'Finance', 'Large', 1, 3, 2200000, 2800000, 3500000, 2900000, 100, 'Santiago'),
('Business Analyst', 'Finance', 'Large', 4, 8, 3200000, 4200000, 5200000, 4300000, 85, 'Santiago'),
('Financial Analyst', 'Finance', 'Large', 1, 3, 2400000, 3000000, 3800000, 3100000, 110, 'Santiago'),
('Financial Analyst', 'Finance', 'Large', 4, 8, 3500000, 4500000, 5500000, 4600000, 90, 'Santiago'),
('Manager', 'Finance', 'Large', 5, 10, 4500000, 5800000, 7200000, 5900000, 70, 'Santiago'),
('Manager', 'Finance', 'Large', 11, 20, 6500000, 8200000, 10000000, 8300000, 50, 'Santiago'),
('HR Manager', 'HR', 'Large', 3, 7, 3000000, 3800000, 4800000, 3900000, 60, 'Santiago'),
('HR Manager', 'HR', 'Large', 8, 15, 4500000, 5800000, 7200000, 5900000, 45, 'Santiago'),
('Marketing Manager', 'Marketing', 'Large', 2, 6, 2800000, 3600000, 4600000, 3700000, 65, 'Santiago'),
('Marketing Manager', 'Marketing', 'Large', 7, 15, 4200000, 5500000, 6800000, 5600000, 50, 'Santiago'),
('Sales Director', 'Sales', 'Large', 5, 10, 4000000, 5200000, 6800000, 5300000, 55, 'Santiago'),
('Sales Director', 'Sales', 'Large', 11, 20, 6000000, 7800000, 9800000, 7900000, 40, 'Santiago'),
('Operations Manager', 'Operations', 'Large', 3, 8, 3200000, 4200000, 5200000, 4300000, 70, 'Santiago'),
('Operations Manager', 'Operations', 'Large', 9, 18, 4800000, 6200000, 7800000, 6300000, 55, 'Santiago'),
('Consulting Analyst', 'Consulting', 'Large', 0, 3, 2600000, 3200000, 4000000, 3300000, 80, 'Santiago'),
('Senior Consultant', 'Consulting', 'Large', 4, 8, 3800000, 4800000, 6000000, 4900000, 65, 'Santiago'),
('Consultant Manager', 'Consulting', 'Large', 9, 15, 5200000, 6800000, 8400000, 6900000, 50, 'Santiago'),
('UX Designer', 'Technology', 'Large', 1, 4, 2200000, 2800000, 3600000, 2900000, 70, 'Santiago'),
('UX Designer', 'Technology', 'Large', 5, 10, 3200000, 4200000, 5400000, 4300000, 55, 'Santiago'),
('Frontend Engineer', 'Technology', 'Large', 1, 3, 2300000, 3000000, 3800000, 3100000, 140, 'Santiago'),
('Frontend Engineer', 'Technology', 'Large', 4, 7, 3500000, 4500000, 5700000, 4600000, 110, 'Santiago'),
('Backend Engineer', 'Technology', 'Large', 1, 3, 2500000, 3300000, 4200000, 3400000, 135, 'Santiago'),
('Backend Engineer', 'Technology', 'Large', 4, 7, 3800000, 4900000, 6200000, 5000000, 105, 'Santiago'),
('DevOps Engineer', 'Technology', 'Large', 2, 5, 3200000, 4100000, 5200000, 4200000, 85, 'Santiago'),
('DevOps Engineer', 'Technology', 'Large', 6, 12, 4500000, 5800000, 7200000, 5900000, 70, 'Santiago'),
('QA Engineer', 'Technology', 'Large', 1, 3, 1800000, 2400000, 3100000, 2500000, 100, 'Santiago'),
('QA Engineer', 'Technology', 'Large', 4, 8, 2800000, 3600000, 4600000, 3700000, 80, 'Santiago'),
('Security Engineer', 'Technology', 'Large', 2, 6, 3500000, 4500000, 5700000, 4600000, 60, 'Santiago'),
('Security Engineer', 'Technology', 'Large', 7, 15, 5000000, 6500000, 8200000, 6600000, 45, 'Santiago'),
('Solutions Architect', 'Technology', 'Large', 5, 10, 4500000, 5800000, 7200000, 5900000, 65, 'Santiago'),
('Solutions Architect', 'Technology', 'Large', 11, 20, 6500000, 8200000, 10200000, 8300000, 50, 'Santiago'),
('Tech Lead', 'Technology', 'Large', 5, 10, 4800000, 6200000, 7800000, 6300000, 75, 'Santiago'),
('Engineering Manager', 'Technology', 'Large', 6, 12, 5200000, 6800000, 8400000, 6900000, 70, 'Santiago'),
('Engineering Director', 'Technology', 'Large', 12, 25, 7500000, 9500000, 12000000, 9600000, 40, 'Santiago'),
('VP Engineering', 'Technology', 'Large', 15, 30, 10000000, 13000000, 16000000, 13100000, 25, 'Santiago'),
('Product Director', 'Technology', 'Large', 10, 18, 6500000, 8200000, 10200000, 8300000, 35, 'Santiago'),
('Analytics Engineer', 'Technology', 'Large', 2, 5, 2800000, 3600000, 4600000, 3700000, 60, 'Santiago'),
('Machine Learning Engineer', 'Technology', 'Large', 2, 6, 3500000, 4500000, 5700000, 4600000, 70, 'Santiago'),
('Machine Learning Engineer', 'Technology', 'Large', 7, 15, 5200000, 6800000, 8400000, 6900000, 55, 'Santiago'),
('Cloud Architect', 'Technology', 'Large', 6, 12, 4800000, 6200000, 7800000, 6300000, 55, 'Santiago'),
('Database Administrator', 'Technology', 'Large', 2, 6, 2800000, 3600000, 4600000, 3700000, 50, 'Santiago'),
('Network Engineer', 'Technology', 'Large', 2, 6, 2600000, 3400000, 4400000, 3500000, 45, 'Santiago'),
('IT Support Manager', 'Technology', 'Large', 3, 8, 2400000, 3200000, 4200000, 3300000, 65, 'Santiago'),
('Help Desk', 'Technology', 'Large', 0, 2, 1200000, 1600000, 2100000, 1700000, 100, 'Santiago'),
('System Administrator', 'Technology', 'Large', 2, 5, 2200000, 2900000, 3700000, 3000000, 75, 'Santiago');
