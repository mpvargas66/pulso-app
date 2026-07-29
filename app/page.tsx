// PULSO v2 - Landing Page
// Home: descripción del producto + CTA

'use client';

export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function Home() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-emerald-400">PULSO</div>
          <div className="flex gap-4">
            {session ? (
              <>
                <Link
                  href="/dashboard"
                  className="px-4 py-2 text-slate-200 hover:text-white transition"
                >
                  Dashboard
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-slate-200 hover:text-white transition"
                >
                  Ingresar
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition"
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
          Toma el pulso del
          <span className="text-emerald-400"> mercado salarial</span>
        </h1>

        <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
          Descubre cuánto deberías ganar en Chile. Análisis inmediato basado en
          metodología robusta de benchmarking salarial.
        </p>

        <div className="flex gap-4 justify-center mb-16">
          {session ? (
            <Link
              href="/dashboard"
              className="px-8 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition text-lg font-semibold"
            >
              Ir a Mi Análisis
            </Link>
          ) : (
            <>
              <Link
                href="/register"
                className="px-8 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition text-lg font-semibold"
              >
                Empezar Ahora (Gratis)
              </Link>
              <Link
                href="/login"
                className="px-8 py-3 border border-slate-400 text-white rounded-lg hover:bg-slate-800 transition text-lg font-semibold"
              >
                Ingresar
              </Link>
            </>
          )}
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-8">
            <div className="text-3xl mb-4">📊</div>
            <h3 className="text-lg font-bold text-white mb-2">Análisis Inmediato</h3>
            <p className="text-slate-300">
              Resultados en segundos. Sin esperas, sin complicaciones.
            </p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-8">
            <div className="text-3xl mb-4">🎯</div>
            <h3 className="text-lg font-bold text-white mb-2">Datos Actuales</h3>
            <p className="text-slate-300">
              Benchmarks del mercado chileno actualizados regularmente.
            </p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-8">
            <div className="text-3xl mb-4">🔒</div>
            <h3 className="text-lg font-bold text-white mb-2">100% Privado</h3>
            <p className="text-slate-300">
              Tus datos son privados y nunca se comparten sin consentimiento.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700 bg-slate-900/50 mt-20 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400">
          <p>© 2024 PULSO - Toma el pulso del mercado salarial</p>
        </div>
      </footer>
    </div>
  );
}
