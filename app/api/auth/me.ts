// PULSO v2 - Get Current User Endpoint
// Retorna datos del usuario autenticado

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from './[...nextauth]';
import { getUserById } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    // Obtener sesión
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'No autenticado' },
        { status: 401 }
      );
    }

    // Obtener datos usuario
    const user = await getUserById(session.user.id);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          profile_data: user.profile_data,
          created_at: user.created_at,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener usuario' },
      { status: 500 }
    );
  }
}
