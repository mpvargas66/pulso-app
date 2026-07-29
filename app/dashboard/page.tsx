'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <p className="text-white">Cargando...</p>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-emerald-400">PULSO</h1>
          <div className="flex items-center gap-4">
            <span className="text-slate-300 text-sm">{session.user?.email}</span>
            <button
              onClick={() => signOut({ redirect: true, callbackUrl: '/' })}
              className="px-4 py-2 text-slate-200 hover:text-white border border-slate-600 rounded-lg transition"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-white mb-8">Bienvenido al Dashboard</h2>
        <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-8">
          <p className="text-slate-300">Próximamente: Formulario de análisis salarial</p>
        </div>
      </main>
    </div>
  );
}
