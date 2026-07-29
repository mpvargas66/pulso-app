// PULSO v2 - TypeScript Types
// Tipos centralizados para todo el proyecto

// ============ USUARIO ============
export interface User {
  id: string;
  email: string;
  full_name: string | null;
  profile_data: Record<string, any>;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CreateUserInput {
  email: string;
  password: string;
  full_name?: string;
}

// ============ ANÁLISIS ============
export interface Analysis {
  id: string;
  user_id: string;
  title: string | null;

  // Input datos
  current_salary: number;
  years_experience: number;
  education_level: string;
  job_title: string;
  industry: string;
  company_size: string;

  // Factores (8 del modelo Codify)
  factor_technical_skills: number;
  factor_soft_skills: number;
  factor_leadership: number;
  factor_experience: number;
  factor_education: number;
  factor_market_demand: number;
  factor_industry_maturity: number;
  factor_geographic_location: number;

  // Resultados
  weighted_score: number;
  market_salary_p50: number;
  market_salary_p25: number;
  market_salary_p75: number;
  salary_gap: number;
  salary_gap_percentage: number;
  percentile: number;
  recommendation: string | null;

  // Skills extraído por Claude API
  technical_skills: string[];
  soft_skills: string[];

  // Metadata
  status: 'pending' | 'completed' | 'error';
  created_at: string;
  updated_at: string;
}

export interface CreateAnalysisInput {
  current_salary: number;
  years_experience: number;
  education_level: string;
  job_title: string;
  industry: string;
  company_size: string;
  profile_description?: string;
}

export interface AnalysisResult {
  analysis_id: string;
  weighted_score: number;
  market_salary_p50: number;
  market_salary_p25: number;
  market_salary_p75: number;
  salary_gap: number;
  salary_gap_percentage: number;
  percentile: number;
  recommendation: string;
  technical_skills: string[];
  soft_skills: string[];
}

// ============ BENCHMARKS ============
export interface SalaryBenchmark {
  id: string;
  job_title: string;
  industry: string;
  company_size: string;
  years_experience_min: number;
  years_experience_max: number;
  salary_p25: number;
  salary_p50: number;
  salary_p75: number;
  salary_mean: number;
  data_points_count: number;
  region: string;
  created_at: string;
  updated_at: string;
}

// ============ FACTOR WEIGHTS ============
export interface FactorWeight {
  id: string;
  factor_name: string;
  weight: number;
  description: string;
  min_value: number;
  max_value: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ============ AUDIT LOG ============
export interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  resource_type: string;
  resource_id: string | null;
  changes: Record<string, any>;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

// ============ API RESPONSES ============
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

// ============ FACTOR SCORES ============
export interface FactorScores {
  technical_skills: number;
  soft_skills: number;
  leadership: number;
  experience: number;
  education: number;
  market_demand: number;
  industry_maturity: number;
  geographic_location: number;
}

export interface WeightedFactors {
  scores: FactorScores;
  weights: Record<string, number>;
  weighted_sum: number;
  max_weighted_sum: number;
  final_score: number;
}
