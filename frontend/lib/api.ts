import axios, { AxiosInstance, AxiosError } from 'axios';

// Types
export interface ProfileFormData {
  currentPosition: string;
  yearsOfExperience: string;
  yearsInCurrentRole: string;
  peopleLeading: string;
  technicalSkills: string[];
  education: string;
  industry: string;
  companySize: string;
  region: string;
  currentSalary: string;
}

export interface AnalysisRequest {
  current_position: string;
  years_of_experience: number;
  years_in_current_role: number;
  people_leading: number;
  technical_skills: string[];
  education: string;
  industry: string;
  company_size: string;
  region: string;
  current_salary: number;
}

export interface AnalysisResponse {
  peso: number;
  p50_usd: number;
  brecha_pct: number;
  recomendaciones: string;
  [key: string]: any;
}

export interface ApiError {
  status: number;
  message: string;
  data?: any;
}

// Axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor - agregar token de autenticación
apiClient.interceptors.request.use(
  (config) => {
    // TODO: Agregar token de autenticación desde sesión
    // const token = session?.user?.id || localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - manejar errores globales
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

/**
 * Realiza un análisis de salario basado en datos de perfil
 * @param formData - Datos del formulario de perfil
 * @param authToken - Token de autenticación (opcional)
 * @returns Resultado del análisis
 * @throws ApiError - Si hay error en la API
 */
export async function postAnalysis(
  formData: ProfileFormData,
  authToken?: string
): Promise<AnalysisResponse> {
  try {
    const analysisRequest: AnalysisRequest = {
      current_position: formData.currentPosition,
      years_of_experience: parseInt(formData.yearsOfExperience),
      years_in_current_role: parseInt(formData.yearsInCurrentRole),
      people_leading: parseInt(formData.peopleLeading) || 0,
      technical_skills: formData.technicalSkills,
      education: formData.education,
      industry: formData.industry,
      company_size: formData.companySize,
      region: formData.region,
      current_salary: parseInt(formData.currentSalary),
    };

    const headers: Record<string, string> = {};
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }

    const response = await apiClient.post<AnalysisResponse>(
      '/api/analyses',
      analysisRequest,
      { headers }
    );

    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * Maneja errores de la API y los convierte a formato consistente
 * @param error - Error de axios o desconocido
 * @returns ApiError formateado
 */
function handleApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status || 500;
    const message = error.response?.data?.detail || error.message || 'Error desconocido en la API';

    return {
      status,
      message,
      data: error.response?.data,
    };
  }

  return {
    status: 500,
    message: error instanceof Error ? error.message : 'Error desconocido',
  };
}

/**
 * Obtiene instancia de axios para llamadas personalizadas
 */
export function getApiClient(): AxiosInstance {
  return apiClient;
}

/**
 * Configura el header de autenticación globalmente
 * @param token - Token JWT o similar
 */
export function setAuthToken(token: string): void {
  apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

/**
 * Limpia el header de autenticación
 */
export function clearAuthToken(): void {
  delete apiClient.defaults.headers.common['Authorization'];
}
