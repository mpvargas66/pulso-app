'use client';

interface AnalysisData {
  peso: number;
  p50_usd: number;
  salario_actual: number;
  brecha_pct: number;
  recomendaciones: string;
}

interface AnalysisResultProps {
  resultado: AnalysisData;
  onNewAnalysis: () => void;
}

export default function AnalysisResult({ resultado, onNewAnalysis }: AnalysisResultProps) {
  const brechaIsPositive = resultado.brecha_pct >= 0;
  const pesoPercentage = (resultado.peso / 1000) * 100;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Tu análisis salarial</h1>
        <p className="text-gray-600">Basado en tu perfil y datos de mercado</p>
      </div>

      {/* Grid de Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Card 1: Salario Actual vs Mercado */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-6">Comparativa Salarial</h3>

          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">Tu salario actual</p>
              <p className="text-3xl font-bold text-gray-900">
                {formatCurrency(resultado.salario_actual)}
              </p>
            </div>

            <div className="h-1 bg-gray-200 rounded-full"></div>

            <div>
              <p className="text-xs text-gray-500 mb-1">Mercado (P50)</p>
              <p className="text-3xl font-bold text-blue-600">
                {formatCurrency(resultado.p50_usd)}
              </p>
              <p className="text-xs text-gray-600 mt-1">Salario medio de tu segmento</p>
            </div>
          </div>
        </div>

        {/* Card 2: Brecha Salarial */}
        <div className={`rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border ${
          brechaIsPositive
            ? 'bg-green-50 border-green-200'
            : 'bg-red-50 border-red-200'
        }`}>
          <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-6">Brecha Salarial</h3>

          <div>
            <p className={`text-5xl font-bold mb-2 ${
              brechaIsPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              {brechaIsPositive ? '+' : ''}{resultado.brecha_pct.toFixed(1)}%
            </p>

            <p className={`text-sm font-medium ${
              brechaIsPositive ? 'text-green-700' : 'text-red-700'
            }`}>
              {brechaIsPositive
                ? '✓ Ganas más que el mercado'
                : '✗ Ganas menos que el mercado'}
            </p>

            <div className="mt-4 bg-gray-200 rounded-full h-2">
              <div
                className={`h-full rounded-full transition-all ${
                  brechaIsPositive ? 'bg-green-500' : 'bg-red-500'
                }`}
                style={{
                  width: `${Math.min(Math.abs(resultado.brecha_pct), 100)}%`,
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Card 3: Peso Calculado */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-6">Peso Calculado</h3>

          <div className="mb-6">
            <div className="flex justify-between items-end mb-2">
              <p className="text-4xl font-bold text-blue-600">{resultado.peso}</p>
              <p className="text-sm text-gray-600">/1000</p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full transition-all"
                style={{ width: `${pesoPercentage}%` }}
              ></div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div>
              <p className="text-gray-600">Bajo</p>
              <p className="font-semibold text-gray-800">0-300</p>
            </div>
            <div>
              <p className="text-gray-600">Medio</p>
              <p className="font-semibold text-gray-800">300-700</p>
            </div>
            <div>
              <p className="text-gray-600">Alto</p>
              <p className="font-semibold text-gray-800">700+</p>
            </div>
          </div>
        </div>

        {/* Card 4: Recomendaciones */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-4">Recomendaciones</h3>

          <div className="prose prose-sm max-w-none">
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {resultado.recomendaciones}
            </p>
          </div>
        </div>
      </div>

      {/* Summary Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
        <p className="text-sm text-gray-700">
          <span className="font-semibold text-blue-900">Resumen:</span> Tu perfil tiene un peso de{' '}
          <span className="font-bold text-blue-600">{resultado.peso}/1000</span> en el mercado.
          {brechaIsPositive
            ? ` Actualmente estás ganando ${resultado.brecha_pct.toFixed(1)}% más que el promedio del mercado.`
            : ` Hay una oportunidad de negociación: podrías estar ganando ${Math.abs(resultado.brecha_pct).toFixed(1)}% más.`
          }
        </p>
      </div>

      {/* Button */}
      <button
        onClick={onNewAnalysis}
        className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 active:scale-95 transition-all shadow-sm hover:shadow-md"
      >
        Nuevo análisis
      </button>

      {/* Footer Note */}
      <p className="text-center text-xs text-gray-500 mt-6">
        Estos datos son estimaciones basadas en análisis de mercado e IA. Para negociaciones salariales, considera esta información como referencia.
      </p>
    </div>
  );
}
