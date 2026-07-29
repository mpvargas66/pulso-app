// PULSO v2 - Analysis Form Component

'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';

interface AnalysisFormProps {
  onSuccess?: (result: any) => void;
}

export default function AnalysisForm({ onSuccess }: AnalysisFormProps) {
  const { data: session } = useSession();
  const [formData, setFormData] = useState({
    current_salary: '',
    years_experience: '',
    education_level: 'Profesional',
    job_title: '',
    industry: '',
    company_size: 'Large',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/analysis/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          current_salary: parseFloat(formData.current_salary),
          years_experience: parseInt(formData.years_experience),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Error al procesar análisis');
        return;
      }

      onSuccess?.(data.result);
      // Reset form
      setFormData({
        current_salary: '',
        years_experience: '',
        education_level: 'Profesional',
        job_title: '',
        industry: '',
        company_size: 'Large',
      });
    } catch (err) {
      setError('Error inesperado');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-8 mb-8 max-w-2xl">
      <h2 className="text-2xl font-bold text-white mb-6">Nuevo Análisis</h2>

      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Salary */}
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Salario Actual (CLP)
            </label>
            <input
              type="number"
              value={formData.current_salary}
              onChange={(e) =>
                setFormData({ ...formData, current_salary: e.target.value })
              }
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
              placeholder="2500000"
              required
            />
          </div>

          {/* Years Experience */}
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Años de Experiencia
            </label>
            <input
              type="number"
              value={formData.years_experience}
              onChange={(e) =>
                setFormData({ ...formData, years_experience: e.target.value })
              }
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
              placeholder="5"
              required
            />
          </div>

          {/* Job Title */}
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Cargo Actual
            </label>
            <input
              type="text"
              value={formData.job_title}
              onChange={(e) =>
                setFormData({ ...formData, job_title: e.target.value })
              }
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
              placeholder="Software Engineer"
              required
            />
          </div>

          {/* Industry */}
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Industria
            </label>
            <input
              type="text"
              value={formData.industry}
              onChange={(e) =>
                setFormData({ ...formData, industry: e.target.value })
              }
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
              placeholder="Technology"
              required
            />
          </div>

          {/* Education Level */}
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Nivel Educativo
            </label>
            <select
              value={formData.education_level}
              onChange={(e) =>
                setFormData({ ...formData, education_level: e.target.value })
              }
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
            >
              <option>Educación Media</option>
              <option>Técnico</option>
              <option>Profesional</option>
              <option>Magíster</option>
              <option>Doctorado</option>
            </select>
          </div>

          {/* Company Size */}
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Tamaño Empresa
            </label>
            <select
              value={formData.company_size}
              onChange={(e) =>
                setFormData({ ...formData, company_size: e.target.value })
              }
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="Small">Pequeña</option>
              <option value="Medium">Mediana</option>
              <option value="Large">Grande</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-6 py-3 bg-emerald-500 text-white font-semibold rounded-lg hover:bg-emerald-600 transition disabled:opacity-50"
        >
          {loading ? 'Analizando...' : 'Calcular Análisis'}
        </button>
      </form>
    </div>
  );
}
