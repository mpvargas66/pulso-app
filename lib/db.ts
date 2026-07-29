// PULSO v2 - Database Connection & Query Helpers
// Conexión a Supabase PostgreSQL vía SQL directo

import { Pool, QueryResult } from 'pg';

// Inicializar pool de conexión
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

// ============ HELPER: Ejecutar query genérica ============
export async function query<T = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  const client = await pool.connect();
  try {
    return await client.query<T>(text, params);
  } finally {
    client.release();
  }
}

// ============ USERS ============
export async function getUserById(userId: string) {
  const result = await query(
    'SELECT * FROM users WHERE id = $1',
    [userId]
  );
  return result.rows[0] || null;
}

export async function getUserByEmail(email: string) {
  const result = await query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );
  return result.rows[0] || null;
}

export async function createUser(
  email: string,
  passwordHash: string,
  fullName?: string
) {
  const result = await query(
    `INSERT INTO users (email, password_hash, full_name, profile_data)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [email, passwordHash, fullName || null, '{}']
  );
  return result.rows[0];
}

// ============ ANALYSES ============
export async function getAnalysisByUserId(userId: string, limit = 10) {
  const result = await query(
    `SELECT * FROM analyses
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT $2`,
    [userId, limit]
  );
  return result.rows;
}

export async function getAnalysisById(analysisId: string) {
  const result = await query(
    'SELECT * FROM analyses WHERE id = $1',
    [analysisId]
  );
  return result.rows[0] || null;
}

export async function createAnalysis(
  userId: string,
  data: {
    current_salary: number;
    years_experience: number;
    education_level: string;
    job_title: string;
    industry: string;
    company_size: string;
  }
) {
  const result = await query(
    `INSERT INTO analyses (
      user_id, current_salary, years_experience, education_level,
      job_title, industry, company_size, status
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *`,
    [
      userId,
      data.current_salary,
      data.years_experience,
      data.education_level,
      data.job_title,
      data.industry,
      data.company_size,
      'pending',
    ]
  );
  return result.rows[0];
}

export async function updateAnalysis(
  analysisId: string,
  updates: Record<string, any>
) {
  const keys = Object.keys(updates);
  const values = Object.values(updates);

  const setClause = keys
    .map((key, i) => `${key} = $${i + 1}`)
    .join(', ');

  const result = await query(
    `UPDATE analyses
     SET ${setClause}, updated_at = now()
     WHERE id = $${keys.length + 1}
     RETURNING *`,
    [...values, analysisId]
  );
  return result.rows[0];
}

// ============ BENCHMARKS ============
export async function getBenchmarkForJobTitle(
  jobTitle: string,
  industry: string,
  yearsExperience: number,
  companySize: string
) {
  const result = await query(
    `SELECT * FROM salary_benchmarks
     WHERE job_title ILIKE $1
     AND industry ILIKE $2
     AND company_size = $3
     AND years_experience_min <= $4
     AND years_experience_max >= $4
     LIMIT 1`,
    [jobTitle, industry, companySize, yearsExperience]
  );
  return result.rows[0] || null;
}

export async function getAllBenchmarks(limit = 100) {
  const result = await query(
    'SELECT * FROM salary_benchmarks ORDER BY job_title LIMIT $1',
    [limit]
  );
  return result.rows;
}

// ============ FACTOR WEIGHTS ============
export async function getFactorWeights() {
  const result = await query(
    'SELECT * FROM factor_weights WHERE is_active = true ORDER BY factor_name'
  );
  return result.rows;
}

export async function getFactorWeightByName(factorName: string) {
  const result = await query(
    'SELECT * FROM factor_weights WHERE factor_name = $1',
    [factorName]
  );
  return result.rows[0] || null;
}

// ============ AUDIT ============
export async function createAuditLog(
  userId: string | null,
  action: string,
  resourceType: string,
  resourceId: string | null,
  changes: Record<string, any>,
  ipAddress?: string,
  userAgent?: string
) {
  const result = await query(
    `INSERT INTO audit_logs (
      user_id, action, resource_type, resource_id, changes, ip_address, user_agent
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *`,
    [userId, action, resourceType, resourceId, JSON.stringify(changes), ipAddress, userAgent]
  );
  return result.rows[0];
}

// ============ HEALTH CHECK ============
export async function checkDatabaseHealth() {
  try {
    const result = await query('SELECT NOW() as now');
    return { healthy: true, timestamp: result.rows[0].now };
  } catch (error) {
    console.error('Database health check failed:', error);
    return { healthy: false, error: String(error) };
  }
}

// ============ CLEANUP ============
export async function closePool() {
  await pool.end();
}
