// PULSO v2 - Dashboard
// Formulario principal de análisis + historial

'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import AnalysisForm from '@/components/AnalysisForm';
import ResultsCard from '@/components/ResultsCard';
import AnalysisHistory from '@/components/AnalysisHistory';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'analyze' | 'history'>('analyze');
  const [results, setResults] = useState(null);
  const [refreshHistory, setRefreshHistory] = useState(0);

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
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-emerald-400">PULSO</h1>
          <div className="flex items-center gap-4">
            <span className="text-slate-300 text-sm">
              {session.user?.email}
            </span>
            <button
              onClick={() => signOut({ redirect: true, callbackUrl: '/' })}
              className="px-4 py-2 text-slate-200 hover:text-white border border-slate-600 rounded-lg transition"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-slate-700">
          <button
            onClick={() => setActiveTab('analyze')}
            className={`px-6 py-3 font-semibold transition ${
              activeTab === 'analyze'
                ? 'text-emerald-400 border-b-2 border-emerald-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Nuevo Análisis
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-3 font-semibold transition ${
              activeTab === 'history'
                ? 'text-emerald-400 border-b-2 border-emerald-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Historial
          </button>
        </div>

        {/* Content */}
        {activeTab === 'analyze' ? (
          <>
            <AnalysisForm
              onSuccess={(result) => {
                setResults(result);
                setRefreshHistory((prev) => prev + 1);
              }}
            />
            {results && <ResultsCard result={results} />}
          </>
        ) : (
          <AnalysisHistory refreshTrigger={refreshHistory} />
        )}
      </main>
    </div>
  );
}
