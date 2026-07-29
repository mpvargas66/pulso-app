// PULSO v2 - Root Layout

import type { Metadata } from 'next';
import { Providers } from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'PULSO - Toma el pulso del mercado salarial',
  description: 'Análisis inmediato de tu salario vs mercado en Chile',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
