// PULSO v2 - Get Single Analysis
// Retorna detalles completos de un análisis

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]';
import { getAnalysisById } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'No autenticado' },
        { status: 401 }
      );
    }

    const { id } = params;

    // Obtener análisis
    const analysis = await getAnalysisById(id);

    if (!analysis) {
      return NextResponse.json(
        { success: false, error: 'Análisis no encontrado' },
        { status: 404 }
      );
    }

    // Verificar que el análisis pertenece al usuario
    if (analysis.user_id !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'No tienes permiso para ver este análisis' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        analysis: {
          id: analysis.id,
          created_at: analysis.created_at,
          job_title: analysis.job_title,
          industry: analysis.industry,
          company_size: analysis.company_size,
          current_salary: analysis.current_salary,
          years_experience: analysis.years_experience,
          education_level: analysis.education_level,
          weighted_score: analysis.weighted_score,
          market_salary_p50: analysis.market_salary_p50,
          market_salary_p25: analysis.market_salary_p25,
          market_salary_p75: analysis.market_salary_p75,
          salary_gap: analysis.salary_gap,
          salary_gap_percentage: analysis.salary_gap_percentage,
          percentile: analysis.percentile,
          recommendation: analysis.recommendation,
          factors: {
            technical_skills: analysis.factor_technical_skills,
            soft_skills: analysis.factor_soft_skills,
            leadership: analysis.factor_leadership,
            experience: analysis.factor_experience,
            education: analysis.factor_education,
            market_demand: analysis.factor_market_demand,
            industry_maturity: analysis.factor_industry_maturity,
            geographic_location: analysis.factor_geographic_location,
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get analysis error:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener análisis' },
      { status: 500 }
    );
  }
}
