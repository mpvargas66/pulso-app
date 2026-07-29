// PULSO v2 - Analysis History Component

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { formatCurrency } from '@/lib/utils';

interface AnalysisHistoryProps {
  refreshTrigger?: number;
}

export default function AnalysisHistory({ refreshTrigger = 0 }: AnalysisHistoryProps) {
  const { data: session } = useSession();
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchHistory() {
      try {
        setLoading(true);
        setError('');

        const res = await fetch('/api/analysis/history?limit=20');
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || 'Error al cargar historial');
          return;
        }

        setAnalyses(data.analyses || []);
      } catch (err) {
        setError('Error inesperado');
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, [refreshTrigger]);

  if (loading) {
    return <div className="text-slate-400">Cargando...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  if (analyses.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400 text-lg">
          No hay análisis anteriores. ¡Crea uno nuevo!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {analyses.map((analysis: any) => (
        <div
          key={analysis.id}
          className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-emerald-500/50 transition"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <h4 className="text-lg font-semibold text-white">
                {analysis.job_title}
              </h4>
              <p className="text-sm text-slate-400">
                {analysis.industry} • {new Date(analysis.created_at).toLocaleDateString('es-CL')}
              </p>
            </div>
            <div className="text-right">
              <p className="text-emerald-400 font-semibold">
                P{analysis.percentile}
              </p>
              <p className="text-slate-400 text-sm">Percentil</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <p className="text-slate-400 text-xs mb-1">SALARIO ACTUAL</p>
              <p className="text-white font-semibold">
                {formatCurrency(analysis.current_salary)}
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-xs mb-1">MERCADO (P50)</p>
              <p className="text-emerald-400 font-semibold">
                {formatCurrency(analysis.market_salary_p50)}
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-xs mb-1">BRECHA</p>
              <p className={`font-semibold ${
                analysis.salary_gap_percentage <= -5
                  ? 'text-green-400'
                  : analysis.salary_gap_percentage > 20
                  ? 'text-red-400'
                  : analysis.salary_gap_percentage > 10
                  ? 'text-yellow-400'
                  : 'text-blue-400'
              }`}>
                {analysis.salary_gap_percentage > 0 ? '-' : '+'}
                {Math.abs(analysis.salary_gap_percentage).toFixed(1)}%
              </p>
            </div>
          </div>

          <p className="text-slate-300 text-sm mt-4 pt-4 border-t border-slate-700">
            {analysis.recommendation}
          </p>
        </div>
      ))}
    </div>
  );
}
