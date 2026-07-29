// PULSO v2 - Health Check Endpoint
// Verifica que el backend y DB estén OK

import { NextRequest, NextResponse } from 'next/server';
import { checkDatabaseHealth } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const dbHealth = await checkDatabaseHealth();

    return NextResponse.json(
      {
        success: true,
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: dbHealth.healthy ? 'connected' : 'disconnected',
        environment: {
          hasAnthropicKey: !!process.env.ANTHROPIC_API_KEY,
          hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
          hasDatabaseUrl: !!process.env.DATABASE_URL,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      {
        success: false,
        status: 'error',
        error: String(error),
      },
      { status: 500 }
    );
  }
}
