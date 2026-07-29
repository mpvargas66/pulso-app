// PULSO v2 - Extract Skills via Claude API
// Usa Claude para extraer skills técnicas y blandas del perfil

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

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

    const { profile_description, job_title, industry } = await req.json();

    if (!profile_description || !ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'Descripción de perfil o API key faltante' },
        { status: 400 }
      );
    }

    // Llamar Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-1',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: `Analiza el siguiente perfil profesional y extrae:
1. 5-7 habilidades técnicas principales (skills técnicas específicas)
2. 4-6 habilidades blandas (soft skills: comunicación, liderazgo, etc.)

Perfil:
- Descripción: ${profile_description}
- Cargo: ${job_title || 'No especificado'}
- Industria: ${industry || 'No especificada'}

Responde en JSON con este formato (sin markdown):
{
  "technical_skills": ["skill1", "skill2"],
  "soft_skills": ["skill1", "skill2"]
}

IMPORTANTE: Responde SOLO con el JSON, sin explicaciones.`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Claude API error:', error);
      return NextResponse.json(
        { success: false, error: 'Error al llamar Claude API' },
        { status: 500 }
      );
    }

    const data = await response.json();
    const content = data.content[0]?.text || '{}';

    // Parsear JSON response
    let skills;
    try {
      skills = JSON.parse(content);
    } catch {
      skills = {
        technical_skills: [],
        soft_skills: [],
      };
    }

    return NextResponse.json(
      {
        success: true,
        skills,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Extract skills error:', error);
    return NextResponse.json(
      { success: false, error: 'Error al extraer skills' },
      { status: 500 }
    );
  }
}
