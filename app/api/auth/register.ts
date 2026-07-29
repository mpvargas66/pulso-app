// PULSO v2 - Registration Endpoint
// Crear nuevo usuario con email + password

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getUserByEmail, createUser } from '@/lib/db';
import { validateEmail } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    const { email, password, fullName } = await req.json();

    // Validar input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email y contraseña requeridos' },
        { status: 400 }
      );
    }

    if (!validateEmail(email)) {
      return NextResponse.json(
        { success: false, error: 'Email inválido' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: 'La contraseña debe tener al menos 8 caracteres' },
        { status: 400 }
      );
    }

    // Verificar si usuario ya existe
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'El email ya está registrado' },
        { status: 409 }
      );
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Crear usuario
    const user = await createUser(email, passwordHash, fullName);

    return NextResponse.json(
      {
        success: true,
        message: 'Usuario registrado exitosamente',
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, error: 'Error al registrar usuario' },
      { status: 500 }
    );
  }
}
