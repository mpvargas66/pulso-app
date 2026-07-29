// PULSO v2 - Main Analysis Endpoint
// Calcula pesaje de 8 factores + brecha salarial

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]';
import {
  createAnalysis,
  updateAnalysis,
  getBenchmarkForJobTitle,
  getFactorWeights,
} from '@/lib/db';
import {
  calculateWeightedScore,
  calculateSalaryGap,
  calculatePercentile,
  generateRecommendation,
  validateSalary,
  validateYearsExperience,
  parseEducationLevel,
  parseCompanySize,
} from '@/lib/utils';
import { FactorScores } from '@/types';

export async function POST(req: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'No autenticado' },
        { status: 401 }
      );
    }

    // Parsear input
    const {
      current_salary,
      years_experience,
      education_level,
      job_title,
      industry,
      company_size,
      profile_description,
    } = await req.json();

    // Validar input
    if (
      !current_salary ||
      years_experience === undefined ||
      !job_title ||
      !industry
    ) {
      return NextResponse.json(
        { success: false, error: 'Datos requeridos faltantes' },
        { status: 400 }
      );
    }

    if (!validateSalary(current_salary)) {
      return NextResponse.json(
        { success: false, error: 'Salario inválido' },
        { status: 400 }
      );
    }

    if (!validateYearsExperience(years_experience)) {
      return NextResponse.json(
        { success: false, error: 'Años de experiencia inválidos' },
        { status: 400 }
      );
    }

    // Crear análisis en DB (estado: pending)
    const analysis = await createAnalysis(session.user.id, {
      current_salary,
      years_experience,
      education_level: parseEducationLevel(education_level),
      job_title,
      industry,
      company_size: parseCompanySize(company_size),
    });

    // Obtener factor weights de DB
    const factorWeightRows = await getFactorWeights();
    const weights: Record<string, number> = {};
    for (const row of factorWeightRows) {
      weights[row.factor_name] = row.weight;
    }

    // Calcular scores de cada factor (0-10 scale)
    const factorScores = calculateFactorScores({
      years_experience,
      education_level: parseEducationLevel(education_level),
      company_size: parseCompanySize(company_size),
      profile_description,
    });

    // Calcular weighted score
    const weightedResult = calculateWeightedScore(factorScores, weights);

    // Obtener benchmark del mercado
    const benchmark = await getBenchmarkForJobTitle(
      job_title,
      industry,
      years_experience,
      parseCompanySize(company_size)
    );

    if (!benchmark) {
      // Si no hay benchmark, usar valores por defecto
      return NextResponse.json(
        {
          success: false,
          error: `No hay datos de benchmark para ${job_title} en ${industry}`,
        },
        { status: 404 }
      );
    }

    // Calcular brecha salarial
    const { gap, gapPercentage } = calculateSalaryGap(
      current_salary,
      benchmark.salary_p50
    );

    // Calcular percentil
    const percentile = calculatePercentile(
      current_salary,
      benchmark.salary_p25,
      benchmark.salary_p50,
      benchmark.salary_p75
    );

    // Generar recomendación
    const recommendation = generateRecommendation(
      gapPercentage,
      percentile,
      years_experience
    );

    // Actualizar análisis en DB con resultados
    const updatedAnalysis = await updateAnalysis(analysis.id, {
      ...factorScores,
      weighted_score: weightedResult.final_score,
      market_salary_p50: benchmark.salary_p50,
      market_salary_p25: benchmark.salary_p25,
      market_salary_p75: benchmark.salary_p75,
      salary_gap: gap,
      salary_gap_percentage: gapPercentage,
      percentile,
      recommendation,
      status: 'completed',
    });

    return NextResponse.json(
      {
        success: true,
        analysis_id: updatedAnalysis.id,
        result: {
          weighted_score: updatedAnalysis.weighted_score,
          market_salary_p50: updatedAnalysis.market_salary_p50,
          market_salary_p25: updatedAnalysis.market_salary_p25,
          market_salary_p75: updatedAnalysis.market_salary_p75,
          current_salary: updatedAnalysis.current_salary,
          salary_gap: updatedAnalysis.salary_gap,
          salary_gap_percentage: updatedAnalysis.salary_gap_percentage,
          percentile: updatedAnalysis.percentile,
          recommendation: updatedAnalysis.recommendation,
          factors: factorScores,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { success: false, error: 'Error al procesar análisis' },
      { status: 500 }
    );
  }
}

/**
 * Calcula los 8 factores del modelo Codify
 * Escala: 0-10
 */
function calculateFactorScores(input: {
  years_experience: number;
  education_level: string;
  company_size: string;
  profile_description?: string;
}): FactorScores {
  const {
    years_experience,
    education_level,
    company_size,
    profile_description = '',
  } = input;

  // Factor 1: Technical Skills (0-10)
  // Basado en años de experiencia y descripción del perfil
  let technicalSkills = Math.min(10, 2 + years_experience * 0.5);
  if (profile_description.toLowerCase().includes('senior')) technicalSkills += 1;
  if (profile_description.toLowerCase().includes('lead')) technicalSkills += 1;

  // Factor 2: Soft Skills (0-10)
  // Estimado por años de experiencia (más años = más soft skills)
  const softSkills = Math.min(
    10,
    3 + Math.min(7, years_experience * 0.3)
  );

  // Factor 3: Leadership (0-10)
  // Basado en años de experiencia y palabras clave
  let leadership = Math.min(
    10,
    Math.max(2, years_experience >= 5 ? 5 : 2)
  );
  if (profile_description.toLowerCase().includes('director')) leadership = 8;
  if (profile_description.toLowerCase().includes('manager')) leadership = 6;

  // Factor 4: Experience (0-10)
  // Mapeo directo de años (max 20 años = 10)
  const experience = Math.min(10, (years_experience / 20) * 10);

  // Factor 5: Education (0-10)
  let education = 5; // Default
  if (education_level.includes('Doctorado')) education = 10;
  if (education_level.includes('Magíster')) education = 8;
  if (education_level.includes('Profesional')) education = 6;
  if (education_level.includes('Técnico')) education = 4;
  if (education_level.includes('Media')) education = 2;

  // Factor 6: Market Demand (0-10)
  // Tech roles tienen mayor demanda
  let marketDemand = 5; // Default
  if (profile_description.toLowerCase().includes('engineer')) marketDemand = 8;
  if (profile_description.toLowerCase().includes('data')) marketDemand = 8;
  if (profile_description.toLowerCase().includes('developer')) marketDemand = 8;

  // Factor 7: Industry Maturity (0-10)
  // Algunas industrias están más maduras
  let industryMaturity = 6; // Default
  if (
    profile_description.toLowerCase().includes('tech') ||
    profile_description.toLowerCase().includes('software')
  ) {
    industryMaturity = 8;
  }

  // Factor 8: Geographic Location (0-10)
  // Santiago tiene mayor demanda
  const geographicLocation = 7; // Default: Santiago

  return {
    technical_skills: Math.round(technicalSkills * 10) / 10,
    soft_skills: Math.round(softSkills * 10) / 10,
    leadership: Math.round(leadership * 10) / 10,
    experience: Math.round(experience * 10) / 10,
    education: Math.round(education * 10) / 10,
    market_demand: Math.round(marketDemand * 10) / 10,
    industry_maturity: Math.round(industryMaturity * 10) / 10,
    geographic_location: Math.round(geographicLocation * 10) / 10,
  };
}
