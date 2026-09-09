import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Cumbre Norte · Inmobiliaria boutique en Lima',
  description: 'Propiedades seleccionadas en Lima y asesoría inmobiliaria con criterio, cercanía y visión de futuro.',
  openGraph: { title: 'Cumbre Norte · Inmobiliaria boutique en Lima', description: 'Espacios con buena arquitectura, ubicación y potencial.', type: 'website' },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body>{children}</body></html>;
}
