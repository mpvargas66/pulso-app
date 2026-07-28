import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import SessionProvider from '@/components/SessionProvider';
import Header from '@/components/Header';
import './globals.css';

export const metadata: Metadata = {
  title: 'PULSO - Toma el pulso del mercado salarial',
  description: 'Descubre tu valor en el mercado con análisis inteligentes impulsados por IA',
  viewport: 'width=device-width, initial-scale=1',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='75' font-size='75' fill='%232563eb'>P</text></svg>" />
      </head>
      <body className="bg-white text-gray-900 antialiased">
        <SessionProvider session={session}>
          <Header />
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
