// PULSO v2 - Utility Functions
// Helpers para cálculos, validación, formatting

import { FactorScores, WeightedFactors } from '@/types';

// ============ VALIDACIÓN ============
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateSalary(salary: number): boolean {
  return salary > 0 && salary < 1_000_000_000;
}

export function validateYearsExperience(years: number): boolean {
  return years >= 0 && years <= 100;
}

// ============ CÁLCULOS DE PESAJE ============
/**
 * Calcula el weighted score basado en 8 factores y sus pesos
 * Retorna score normalizado (0-100)
 */
export function calculateWeightedScore(
  factors: FactorScores,
  weights: Record<string, number>
): WeightedFactors {
  const factorEntries = Object.entries(factors);

  let weightedSum = 0;
  let totalWeight = 0;

  for (const [factorName, score] of factorEntries) {
    const weight = weights[factorName] || 0;
    weightedSum += score * weight;
    totalWeight += weight;
  }

  // Normalizar a 0-100
  const maxPossibleScore = 10; // asumimos factores de 0-10
  const maxWeightedSum = maxPossibleScore * totalWeight;
  const finalScore = (weightedSum / maxWeightedSum) * 100;

  return {
    scores: factors,
    weights,
    weighted_sum: weightedSum,
    max_weighted_sum: maxWeightedSum,
    final_score: Math.min(100, Math.max(0, finalScore)),
  };
}

/**
 * Calcula percentil basado en score y benchmark
 * Asume distribución normal
 */
export function calculatePercentile(
  personalScore: number,
  p25: number,
  p50: number,
  p75: number
): number {
  if (personalScore <= p25) return 25;
  if (personalScore <= p50) return 50;
  if (personalScore <= p75) return 75;
  return 90; // Asumimos p90 es el máximo
}

/**
 * Calcula brecha salarial entre actual y mercado
 */
export function calculateSalaryGap(
  currentSalary: number,
  marketSalaryP50: number
): { gap: number; gapPercentage: number } {
  const gap = marketSalaryP50 - currentSalary;
  const gapPercentage = (gap / currentSalary) * 100;

  return {
    gap: Math.round(gap),
    gapPercentage: Math.round(gapPercentage * 100) / 100,
  };
}

/**
 * Genera recomendación basada en salario y percentil
 */
export function generateRecommendation(
  salaryGapPercentage: number,
  percentile: number,
  yearsExperience: number
): string {
  if (salaryGapPercentage > 20) {
    return `Estás ganando significativamente menos del mercado (${salaryGapPercentage.toFixed(1)}% bajo). Considera buscar oportunidades con mejor compensación o negociar un aumento.`;
  }

  if (salaryGapPercentage > 10) {
    return `Tu salario está un poco bajo respecto al mercado (${salaryGapPercentage.toFixed(1)}% bajo). Podrías negociar un aumento o explorar opciones externas.`;
  }

  if (salaryGapPercentage > -5 && salaryGapPercentage <= 10) {
    return `Tu salario está alineado con el mercado. Sigue desarrollando tus habilidades y experiencia.`;
  }

  if (salaryGapPercentage <= -5) {
    return `Excelente: ganas más que el promedio del mercado (${Math.abs(salaryGapPercentage).toFixed(1)}% sobre). Mantén tu rendimiento y sigue agregando valor.`;
  }

  return 'Tu salario está dentro de rangos normales del mercado.';
}

// ============ FORMATTING ============
export function formatCurrency(amount: number, currency = 'CLP'): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPercentage(value: number, decimals = 1): string {
  return `${(value).toFixed(decimals)}%`;
}

// ============ PARSING ============
export function parseEducationLevel(input: string): string {
  const normalized = input.toLowerCase();

  if (normalized.includes('doctorado') || normalized.includes('phd')) return 'Doctorado';
  if (normalized.includes('magister') || normalized.includes('master')) return 'Magíster';
  if (normalized.includes('profesional') || normalized.includes('licenciatura')) return 'Profesional';
  if (normalized.includes('técnico') || normalized.includes('diploma')) return 'Técnico';
  if (normalized.includes('medio') || normalized.includes('secundaria')) return 'Educación Media';

  return 'No Especificado';
}

export function parseCompanySize(input: string): string {
  const normalized = input.toLowerCase();

  if (normalized.includes('startup') || normalized.includes('pequeña')) return 'Small';
  if (normalized.includes('mediana')) return 'Medium';
  if (normalized.includes('grande') || normalized.includes('enterprise')) return 'Large';

  return 'Large'; // Default
}

// ============ SECURITY ============
/**
 * Sanitiza strings para evitar XSS
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Valida y sanitiza objeto JSON
 */
export function validateAndSanitizeJSON(input: any): Record<string, any> {
  if (typeof input !== 'object' || input === null) {
    return {};
  }

  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(input)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (typeof value === 'number' || typeof value === 'boolean') {
      sanitized[key] = value;
    }
  }

  return sanitized;
}
