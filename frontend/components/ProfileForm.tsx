'use client';

import { useState, FormEvent } from 'react';

interface FormData {
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

const initialFormData: FormData = {
  currentPosition: '',
  yearsOfExperience: '',
  yearsInCurrentRole: '',
  peopleLeading: '',
  technicalSkills: [],
  education: '',
  industry: '',
  companySize: '',
  region: '',
  currentSalary: '',
};

const technicalSkillsOptions = ['Python', 'PostgreSQL', 'AWS', 'Rust', 'Go', 'Node.js', 'React'];
const educationOptions = ['Carrera en CS', 'Bootcamp', 'Autodidacta'];
const industryOptions = ['FinTech', 'SaaS', 'Large Corp', 'Startup'];
const companySizeOptions = ['1-50', '50-500', '500-5k', '5k+'];
const regionOptions = ['Santiago', 'Regiones'];

export default function ProfileForm() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSkillToggle = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      technicalSkills: prev.technicalSkills.includes(skill)
        ? prev.technicalSkills.filter((s) => s !== skill)
        : [...prev.technicalSkills, skill],
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.currentPosition.trim()) {
      newErrors.currentPosition = 'El cargo actual es requerido';
    }
    if (!formData.yearsOfExperience) {
      newErrors.yearsOfExperience = 'La experiencia total es requerida';
    }
    if (!formData.yearsInCurrentRole) {
      newErrors.yearsInCurrentRole = 'Los años en el cargo actual son requeridos';
    }
    if (!formData.education) {
      newErrors.education = 'La educación es requerida';
    }
    if (!formData.industry) {
      newErrors.industry = 'La industria es requerida';
    }
    if (!formData.companySize) {
      newErrors.companySize = 'El tamaño de empresa es requerido';
    }
    if (!formData.region) {
      newErrors.region = 'La región es requerida';
    }
    if (!formData.currentSalary) {
      newErrors.currentSalary = 'El salario actual es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Call API endpoint to analyze profile
      console.log('Enviando datos:', formData);

      // Simular delay de API
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Success handling
      alert('Análisis iniciado. Pronto recibirás tus resultados.');
    } catch (error) {
      console.error('Error:', error);
      alert('Hubo un error al procesar tu análisis. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Análisis de Salario</h1>
        <p className="text-gray-600">Completa tu perfil para obtener un análisis personalizado de tu valor en el mercado</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        {/* Cargo Actual */}
        <div>
          <label htmlFor="currentPosition" className="block text-sm font-medium text-gray-900 mb-1">
            ¿Cuál es tu cargo actual? *
          </label>
          <input
            type="text"
            id="currentPosition"
            name="currentPosition"
            value={formData.currentPosition}
            onChange={handleChange}
            placeholder="e.g. Senior Backend Engineer"
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.currentPosition ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.currentPosition && <p className="text-red-500 text-sm mt-1">{errors.currentPosition}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Años de Experiencia */}
          <div>
            <label htmlFor="yearsOfExperience" className="block text-sm font-medium text-gray-900 mb-1">
              Años de experiencia total *
            </label>
            <input
              type="number"
              id="yearsOfExperience"
              name="yearsOfExperience"
              value={formData.yearsOfExperience}
              onChange={handleChange}
              placeholder="5"
              min="0"
              max="70"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.yearsOfExperience ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.yearsOfExperience && <p className="text-red-500 text-sm mt-1">{errors.yearsOfExperience}</p>}
          </div>

          {/* Años en Cargo Actual */}
          <div>
            <label htmlFor="yearsInCurrentRole" className="block text-sm font-medium text-gray-900 mb-1">
              Años en cargo actual *
            </label>
            <input
              type="number"
              id="yearsInCurrentRole"
              name="yearsInCurrentRole"
              value={formData.yearsInCurrentRole}
              onChange={handleChange}
              placeholder="2"
              min="0"
              max="70"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.yearsInCurrentRole ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.yearsInCurrentRole && <p className="text-red-500 text-sm mt-1">{errors.yearsInCurrentRole}</p>}
          </div>

          {/* Personas Liderando */}
          <div>
            <label htmlFor="peopleLeading" className="block text-sm font-medium text-gray-900 mb-1">
              ¿Personas que lideran?
            </label>
            <input
              type="number"
              id="peopleLeading"
              name="peopleLeading"
              value={formData.peopleLeading}
              onChange={handleChange}
              placeholder="0"
              min="0"
              max="500"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Competencias Técnicas */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-3">Competencias técnicas</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {technicalSkillsOptions.map((skill) => (
              <label key={skill} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.technicalSkills.includes(skill)}
                  onChange={() => handleSkillToggle(skill)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{skill}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Educación */}
        <div>
          <label htmlFor="education" className="block text-sm font-medium text-gray-900 mb-1">
            Educación *
          </label>
          <select
            id="education"
            name="education"
            value={formData.education}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.education ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Selecciona una opción</option>
            {educationOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {errors.education && <p className="text-red-500 text-sm mt-1">{errors.education}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Industria */}
          <div>
            <label htmlFor="industry" className="block text-sm font-medium text-gray-900 mb-1">
              Industria *
            </label>
            <select
              id="industry"
              name="industry"
              value={formData.industry}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.industry ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Selecciona una opción</option>
              {industryOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {errors.industry && <p className="text-red-500 text-sm mt-1">{errors.industry}</p>}
          </div>

          {/* Tamaño de Empresa */}
          <div>
            <label htmlFor="companySize" className="block text-sm font-medium text-gray-900 mb-1">
              Tamaño empresa actual *
            </label>
            <select
              id="companySize"
              name="companySize"
              value={formData.companySize}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.companySize ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Selecciona una opción</option>
              {companySizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {errors.companySize && <p className="text-red-500 text-sm mt-1">{errors.companySize}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Región */}
          <div>
            <label htmlFor="region" className="block text-sm font-medium text-gray-900 mb-1">
              Región *
            </label>
            <select
              id="region"
              name="region"
              value={formData.region}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.region ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Selecciona una opción</option>
              {regionOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {errors.region && <p className="text-red-500 text-sm mt-1">{errors.region}</p>}
          </div>

          {/* Salario Actual */}
          <div>
            <label htmlFor="currentSalary" className="block text-sm font-medium text-gray-900 mb-1">
              Tu salario actual (USD) *
            </label>
            <input
              type="number"
              id="currentSalary"
              name="currentSalary"
              value={formData.currentSalary}
              onChange={handleChange}
              placeholder="50000"
              min="0"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.currentSalary ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.currentSalary && <p className="text-red-500 text-sm mt-1">{errors.currentSalary}</p>}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all ${
            isLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
          }`}
        >
          {isLoading ? 'Analizando...' : 'Analizar'}
        </button>

        <p className="text-center text-xs text-gray-500">
          * Campos requeridos
        </p>
      </form>
    </div>
  );
}
