// PULSO v2 - Results Card Component

'use client';

import { formatCurrency, formatPercentage } from '@/lib/utils';

interface ResultsCardProps {
  result: any;
}

export default function ResultsCard({ result }: ResultsCardProps) {
  const salaryGap = result.salary_gap || 0;
  const gapPercentage = result.salary_gap_percentage || 0;

  const getGapColor = (percentage: number) => {
    if (percentage <= -5) return 'text-green-400'; // Gana más
    if (percentage > 20) return 'text-red-400'; // Gana mucho menos
    if (percentage > 10) return 'text-yellow-400'; // Gana menos
    return 'text-blue-400'; // Alineado
  };

  return (
    <div className="bg-gradient-to-br from-emerald-900/30 to-emerald-900/10 border border-emerald-700/50 rounded-lg p-8">
      <h3 className="text-2xl font-bold text-white mb-8">Tu Análisis</h3>

      {/* Main Result */}
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        {/* Salary Comparison */}
        <div className="bg-slate-800/50 rounded-lg p-6">
          <p className="text-slate-400 text-sm mb-2">TU SALARIO ACTUAL</p>
          <p className="text-3xl font-bold text-white mb-4">
            {formatCurrency(result.current_salary)}
          </p>

          <p className="text-slate-400 text-sm mb-2">SALARIO MERCADO (P50)</p>
          <p className="text-3xl font-bold text-emerald-400 mb-6">
            {formatCurrency(result.market_salary_p50)}
          </p>

          <div className={`text-2xl font-bold mb-2 ${getGapColor(gapPercentage)}`}>
            {gapPercentage > 0 ? '-' : '+'}
            {formatCurrency(Math.abs(salaryGap))}
          </div>
          <p className="text-slate-400 text-sm">
            {gapPercentage > 0
              ? `Estás ganando ${Math.abs(gapPercentage).toFixed(1)}% menos`
              : `Estás ganando ${Math.abs(gapPercentage).toFixed(1)}% más`}
          </p>
        </div>

        {/* Percentile & Score */}
        <div className="bg-slate-800/50 rounded-lg p-6 space-y-6">
          <div>
            <p className="text-slate-400 text-sm mb-2">PERCENTIL</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-emerald-400">
                {result.percentile}
              </span>
              <span className="text-slate-300">percentil</span>
            </div>
            <div className="mt-3 bg-slate-700 rounded-full h-2">
              <div
                className="bg-emerald-500 h-2 rounded-full"
                style={{
                  width: `${Math.min(100, (result.percentile / 90) * 100)}%`,
                }}
              />
            </div>
          </div>

          <div>
            <p className="text-slate-400 text-sm mb-2">SCORE CALCULADO</p>
            <p className="text-3xl font-bold text-blue-400">
              {result.weighted_score?.toFixed(1)}/100
            </p>
          </div>
        </div>
      </div>

      {/* Salary Range */}
      <div className="bg-slate-800/50 rounded-lg p-6 mb-8">
        <p className="text-slate-400 text-sm mb-4">RANGO SALARIAL DEL MERCADO</p>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-300">P25 (25% gana menos)</span>
            <span className="text-white font-semibold">
              {formatCurrency(result.market_salary_p25)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-300">P50 (Promedio)</span>
            <span className="text-emerald-400 font-semibold">
              {formatCurrency(result.market_salary_p50)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-300">P75 (25% gana más)</span>
            <span className="text-white font-semibold">
              {formatCurrency(result.market_salary_p75)}
            </span>
          </div>
        </div>
      </div>

      {/* Recommendation */}
      <div className="bg-slate-800/50 rounded-lg p-6">
        <p className="text-slate-400 text-sm mb-2">RECOMENDACIÓN</p>
        <p className="text-white text-lg leading-relaxed">
          {result.recommendation}
        </p>
      </div>
    </div>
  );
}
