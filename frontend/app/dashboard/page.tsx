'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import ProfileForm from '@/components/ProfileForm';
import AnalysisResult from '@/components/AnalysisResult';

interface AnalysisResult {
  peso: number;
  p50_usd: number;
  salario_actual: number;
  brecha_pct: number;
  recomendaciones: string;
}

interface FormDataSubmit {
  currentPosition: string;
  yearsOfExperience: string;
  yearsInCurrentRole: string;
  peopleLeading: string;
  technicalSkills: string[];
  education: string;
  industry: string;
  companySize: string;
  region: string;
  currentSalary: string;
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [resultado, setResultado] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect si no hay sesión
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
          </div>
          <p className="text-gray-600 mt-4">Cargando...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/auth/signin');
    return null;
  }

  const handleAnalyze = async (formData: FormDataSubmit) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/analyses`,
        {
          current_position: formData.currentPosition,
          years_of_experience: parseInt(formData.yearsOfExperience),
          years_in_current_role: parseInt(formData.yearsInCurrentRole),
          people_leading: parseInt(formData.peopleLeading) || 0,
          technical_skills: formData.technicalSkills,
          education: formData.education,
          industry: formData.industry,
          company_size: formData.companySize,
          region: formData.region,
          current_salary: parseInt(formData.currentSalary),
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.user?.id}`,
          },
        }
      );

      if (response.data) {
        setResultado({
          peso: response.data.peso || response.data.weight || 680,
          p50_usd: response.data.p50_usd || response.data.market_salary || 80000,
          salario_actual: parseInt(formData.currentSalary),
          brecha_pct: response.data.brecha_pct || response.data.salary_gap || 15.5,
          recomendaciones: response.data.recomendaciones || response.data.recommendations || 'Basado en tu perfil, tienes un buen potencial salarial.',
        });
      }
    } catch (err) {
      console.error('Error analyzing profile:', err);

      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          setError('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
          router.push('/auth/signin');
        } else if (err.response?.status === 400) {
          setError('Por favor verifica que todos los datos sean válidos.');
        } else {
          setError('Error al procesar el análisis. Intenta nuevamente.');
        }
      } else {
        setError('Ocurrió un error inesperado. Intenta nuevamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewAnalysis = () => {
    setResultado(null);
    setError(null);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 max-w-4xl mx-auto mt-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Welcome Message */}
      {!resultado && (
        <div className="max-w-4xl mx-auto p-4 pt-8">
          <div className="mb-6">
            <p className="text-gray-600">
              Bienvenido, <span className="font-semibold">{session?.user?.name}</span>
            </p>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="pb-12">
        {resultado === null ? (
          // Mostrar formulario de perfil
          <ProfileForm
            onSubmit={async (formData: FormDataSubmit) => {
              await handleAnalyze(formData);
            }}
          />
        ) : (
          // Mostrar resultados del análisis
          <AnalysisResult
            resultado={resultado}
            onNewAnalysis={handleNewAnalysis}
          />
        )}
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 text-center">
            <div className="inline-block animate-spin mb-4">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
            </div>
            <p className="text-lg font-semibold text-gray-900">Analizando tu perfil...</p>
            <p className="text-sm text-gray-600 mt-2">Esto puede tomar unos segundos</p>
          </div>
        </div>
      )}
    </main>
  );
}
