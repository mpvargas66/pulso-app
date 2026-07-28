'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function Home() {
  const { data: session } = useSession();

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-400 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">PULSO</span>
            </div>

            {session ? (
              <Link
                href="/dashboard"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href="/auth/signup"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Comienza gratis
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
        <div className="text-center space-y-8">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
            Toma el <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400">pulso</span> del mercado salarial
          </h1>

          <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            ¿Estás ganando lo que mereces? Descubre tu valor en el mercado con análisis inteligentes impulsados por IA.
          </p>

          {/* Value Proposition */}
          <div className="grid sm:grid-cols-3 gap-6 max-w-2xl mx-auto py-8">
            <div className="space-y-2">
              <div className="text-3xl font-bold text-blue-600">📊</div>
              <p className="text-gray-700 font-medium">Análisis de mercado</p>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-blue-600">🤖</div>
              <p className="text-gray-700 font-medium">Powered by IA</p>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-blue-600">⚡</div>
              <p className="text-gray-700 font-medium">Resultados al instante</p>
            </div>
          </div>

          {/* CTA Button */}
          {session ? (
            <Link
              href="/dashboard"
              className="inline-block px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
            >
              Ir a Dashboard
            </Link>
          ) : (
            <Link
              href="/auth/signup"
              className="inline-block px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
            >
              Comenzar análisis
            </Link>
          )}

          <p className="text-gray-500 text-sm">
            No requiere tarjeta de crédito • Acceso inmediato
          </p>
        </div>

        {/* Decoration */}
        <div className="mt-20 relative h-96 bg-gradient-to-b from-blue-50 to-transparent rounded-3xl flex items-center justify-center">
          <div className="text-center text-gray-400">
            <p className="text-lg">Dashboard preview</p>
            <p className="text-sm">Coming soon</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid sm:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Producto</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <Link href="#" className="hover:text-gray-900">
                    Características
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-gray-900">
                    Precios
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <Link href="#" className="hover:text-gray-900">
                    Privacidad
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-gray-900">
                    Términos
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Redes</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <Link href="#" className="hover:text-gray-900">
                    Twitter
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-gray-900">
                    LinkedIn
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Contacto</h3>
              <p className="text-sm text-gray-600">
                <Link href="mailto:hola@pulso.app" className="hover:text-gray-900">
                  hola@pulso.app
                </Link>
              </p>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-8 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-600">
            <p>&copy; 2024 PULSO. Todos los derechos reservados.</p>
            <div className="flex space-x-6 mt-4 sm:mt-0">
              <Link href="/privacy" className="hover:text-gray-900">
                Privacidad
              </Link>
              <Link href="/terms" className="hover:text-gray-900">
                Términos
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
