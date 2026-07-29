// PULSO v2 - Get Analysis History
// Retorna historial de análisis del usuario

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]';
import { getAnalysisByUserId } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'No autenticado' },
        { status: 401 }
      );
    }

    // Obtener parámetro limit (default: 10)
    const url = new URL(req.url);
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '10'), 100);

    // Obtener análisis del usuario
    const analyses = await getAnalysisByUserId(session.user.id, limit);

    return NextResponse.json(
      {
        success: true,
        count: analyses.length,
        analyses: analyses.map((a: any) => ({
          id: a.id,
          created_at: a.created_at,
          job_title: a.job_title,
          industry: a.industry,
          current_salary: a.current_salary,
          market_salary_p50: a.market_salary_p50,
          salary_gap_percentage: a.salary_gap_percentage,
          percentile: a.percentile,
          recommendation: a.recommendation,
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('History error:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener historial' },
      { status: 500 }
    );
  }
}
