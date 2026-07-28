-- PULSO MVP - Seed Data
-- Initial data for development and testing
-- Created: 2024-01-15

-- ============================================================================
-- Seed Data: Factor Weights (v1.0)
-- ============================================================================

DELETE FROM factor_weights WHERE version = 1;

INSERT INTO factor_weights (factor_name, weight, version, description)
VALUES
    ('complejidad_intelectual', 0.25, 1, 'Technical complexity and specialized skills'),
    ('liderazgo', 0.20, 1, 'Leadership and team management capabilities'),
    ('autonomia', 0.15, 1, 'Autonomy and decision-making authority'),
    ('seniority', 0.15, 1, 'Career seniority and experience level'),
    ('mercado', 0.10, 1, 'Market demand and industry attractiveness'),
    ('impacto', 0.10, 1, 'Business impact and scope of influence'),
    ('contexto', 0.04, 1, 'Company context and organizational size'),
    ('educacion', 0.01, 1, 'Formal education and certifications');


-- ============================================================================
-- Seed Data: Salary Benchmarks
-- ============================================================================

DELETE FROM salary_benchmarks;

-- ============================================================================
-- Senior Backend Engineer (Peso: 680)
-- ============================================================================

INSERT INTO salary_benchmarks
    (cargo_nombre, industria, tamaño_empresa, region, peso, p50_usd, p25_usd, p75_usd, p90_usd, sample_size)
VALUES
    ('Senior Backend Engineer', 'FinTech', '50-500', 'Santiago', 680, 5000, 4200, 6000, 7200, 45),
    ('Senior Backend Engineer', 'SaaS', '50-500', 'Santiago', 680, 4900, 4100, 5800, 7000, 52),
    ('Senior Backend Engineer', 'Large Corp', '5k+', 'Santiago', 680, 4500, 3800, 5300, 6400, 38),
    ('Senior Backend Engineer', 'Startup', '1-50', 'Santiago', 680, 4700, 3900, 5600, 6800, 28),
    ('Senior Backend Engineer', 'FinTech', '500-5k', 'Santiago', 680, 4800, 4000, 5700, 6900, 35),
    ('Senior Backend Engineer', 'SaaS', '500-5k', 'Santiago', 680, 4700, 3900, 5600, 6800, 42);


-- ============================================================================
-- Mid Backend Engineer (Peso: 600)
-- ============================================================================

INSERT INTO salary_benchmarks
    (cargo_nombre, industria, tamaño_empresa, region, peso, p50_usd, p25_usd, p75_usd, p90_usd, sample_size)
VALUES
    ('Mid Backend Engineer', 'FinTech', '50-500', 'Santiago', 600, 3500, 2900, 4200, 5000, 38),
    ('Mid Backend Engineer', 'SaaS', '50-500', 'Santiago', 600, 3400, 2800, 4100, 4900, 45),
    ('Mid Backend Engineer', 'Large Corp', '5k+', 'Santiago', 600, 3100, 2600, 3700, 4500, 32),
    ('Mid Backend Engineer', 'Startup', '1-50', 'Santiago', 600, 3200, 2700, 3900, 4700, 22);


-- ============================================================================
-- Staff Engineer (Peso: 750)
-- ============================================================================

INSERT INTO salary_benchmarks
    (cargo_nombre, industria, tamaño_empresa, region, peso, p50_usd, p25_usd, p75_usd, p90_usd, sample_size)
VALUES
    ('Staff Engineer', 'FinTech', '500-5k', 'Santiago', 750, 7200, 6200, 8500, 10200, 28),
    ('Staff Engineer', 'SaaS', '500-5k', 'Santiago', 750, 7000, 6000, 8200, 9900, 32),
    ('Staff Engineer', 'Large Corp', '5k+', 'Santiago', 750, 6800, 5800, 8000, 9600, 35),
    ('Staff Engineer', 'FinTech', '5k+', 'Santiago', 750, 7100, 6100, 8400, 10100, 25);


-- ============================================================================
-- Senior Frontend Engineer (Peso: 670)
-- ============================================================================

INSERT INTO salary_benchmarks
    (cargo_nombre, industria, tamaño_empresa, region, peso, p50_usd, p25_usd, p75_usd, p90_usd, sample_size)
VALUES
    ('Senior Frontend Engineer', 'FinTech', '50-500', 'Santiago', 670, 4800, 4000, 5700, 6800, 42),
    ('Senior Frontend Engineer', 'SaaS', '50-500', 'Santiago', 670, 4700, 3900, 5600, 6700, 48),
    ('Senior Frontend Engineer', 'Large Corp', '5k+', 'Santiago', 670, 4300, 3600, 5100, 6200, 35),
    ('Senior Frontend Engineer', 'Startup', '1-50', 'Santiago', 670, 4500, 3700, 5400, 6500, 25);


-- ============================================================================
-- Product Manager (Peso: 700)
-- ============================================================================

INSERT INTO salary_benchmarks
    (cargo_nombre, industria, tamaño_empresa, region, peso, p50_usd, p25_usd, p75_usd, p90_usd, sample_size)
VALUES
    ('Product Manager', 'FinTech', '50-500', 'Santiago', 700, 5500, 4600, 6600, 7900, 38),
    ('Product Manager', 'SaaS', '50-500', 'Santiago', 700, 5400, 4500, 6500, 7800, 45),
    ('Product Manager', 'Large Corp', '5k+', 'Santiago', 700, 5200, 4300, 6300, 7600, 32),
    ('Product Manager', 'Startup', '1-50', 'Santiago', 700, 4800, 4000, 5800, 7000, 28);


-- ============================================================================
-- Data Scientist (Peso: 700)
-- ============================================================================

INSERT INTO salary_benchmarks
    (cargo_nombre, industria, tamaño_empresa, region, peso, p50_usd, p25_usd, p75_usd, p90_usd, sample_size)
VALUES
    ('Data Scientist', 'FinTech', '50-500', 'Santiago', 700, 5300, 4400, 6400, 7700, 35),
    ('Data Scientist', 'SaaS', '50-500', 'Santiago', 700, 5200, 4300, 6300, 7600, 42),
    ('Data Scientist', 'Large Corp', '5k+', 'Santiago', 700, 5000, 4100, 6100, 7300, 38),
    ('Data Scientist', 'Startup', '1-50', 'Santiago', 700, 4700, 3900, 5700, 6900, 24);


-- ============================================================================
-- DevOps Engineer (Peso: 680)
-- ============================================================================

INSERT INTO salary_benchmarks
    (cargo_nombre, industria, tamaño_empresa, region, peso, p50_usd, p25_usd, p75_usd, p90_usd, sample_size)
VALUES
    ('DevOps Engineer', 'FinTech', '50-500', 'Santiago', 680, 5100, 4200, 6100, 7300, 32),
    ('DevOps Engineer', 'SaaS', '50-500', 'Santiago', 680, 5000, 4100, 6000, 7200, 40),
    ('DevOps Engineer', 'Large Corp', '5k+', 'Santiago', 680, 4700, 3900, 5600, 6700, 38),
    ('DevOps Engineer', 'Startup', '1-50', 'Santiago', 680, 4800, 4000, 5800, 7000, 26);


-- ============================================================================
-- UX Designer (Peso: 620)
-- ============================================================================

INSERT INTO salary_benchmarks
    (cargo_nombre, industria, tamaño_empresa, region, peso, p50_usd, p25_usd, p75_usd, p90_usd, sample_size)
VALUES
    ('UX Designer', 'FinTech', '50-500', 'Santiago', 620, 4200, 3500, 5000, 6000, 35),
    ('UX Designer', 'SaaS', '50-500', 'Santiago', 620, 4100, 3400, 4900, 5900, 42),
    ('UX Designer', 'Large Corp', '5k+', 'Santiago', 620, 3800, 3100, 4500, 5400, 30),
    ('UX Designer', 'Startup', '1-50', 'Santiago', 620, 3600, 3000, 4300, 5200, 22);


-- ============================================================================
-- Product Designer (Peso: 630)
-- ============================================================================

INSERT INTO salary_benchmarks
    (cargo_nombre, industria, tamaño_empresa, region, peso, p50_usd, p25_usd, p75_usd, p90_usd, sample_size)
VALUES
    ('Product Designer', 'FinTech', '50-500', 'Santiago', 630, 4400, 3600, 5300, 6300, 32),
    ('Product Designer', 'SaaS', '50-500', 'Santiago', 630, 4300, 3500, 5200, 6200, 39),
    ('Product Designer', 'Large Corp', '5k+', 'Santiago', 630, 4000, 3300, 4800, 5800, 28),
    ('Product Designer', 'Startup', '1-50', 'Santiago', 630, 3800, 3100, 4600, 5500, 20);


-- ============================================================================
-- Junior Developer (Peso: 480)
-- ============================================================================

INSERT INTO salary_benchmarks
    (cargo_nombre, industria, tamaño_empresa, region, peso, p50_usd, p25_usd, p75_usd, p90_usd, sample_size)
VALUES
    ('Junior Developer', 'FinTech', '50-500', 'Santiago', 480, 2500, 2000, 3000, 3600, 42),
    ('Junior Developer', 'SaaS', '50-500', 'Santiago', 480, 2400, 1900, 2900, 3500, 48),
    ('Junior Developer', 'Large Corp', '5k+', 'Santiago', 480, 2200, 1800, 2700, 3300, 38),
    ('Junior Developer', 'Startup', '1-50', 'Santiago', 480, 2100, 1700, 2600, 3200, 30),
    ('Junior Developer', 'FinTech', '500-5k', 'Santiago', 480, 2300, 1900, 2800, 3400, 25);


-- ============================================================================
-- Summary Statistics
-- ============================================================================

-- View the loaded data
SELECT
    COUNT(*) as total_benchmarks,
    COUNT(DISTINCT cargo_nombre) as unique_positions,
    COUNT(DISTINCT industria) as unique_industries,
    ROUND(AVG(p50_usd)::numeric, 2) as avg_p50_salary,
    MIN(p50_usd) as min_salary,
    MAX(p50_usd) as max_salary
FROM salary_benchmarks;

-- View factor weights
SELECT * FROM factor_weights WHERE version = 1 ORDER BY weight DESC;


-- ============================================================================
-- End of Seed Data
-- ============================================================================