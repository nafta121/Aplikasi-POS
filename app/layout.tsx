import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ThemeProvider } from '@/context/ThemeContext';
import ServiceWorkerRegister from '@/components/common/ServiceWorkerRegister';

export const viewport: Viewport = {
  themeColor: '#f59e0b',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: 'POS & Inventaris Toko Bangunan',
  description:
    'Aplikasi POS Kasir Mobile PWA dan Sistem Inventaris Toko Bangunan dengan arsitektur route group Next.js, Framer Motion, Dark Mode, dan integrasi Supabase.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'POS Kasir',
  },
  icons: {
    icon: [
      { url: '/favicon.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    title: 'POS & Inventaris Toko Bangunan',
    description:
      'Aplikasi POS Kasir Mobile PWA dan Sistem Inventaris Toko Bangunan dengan arsitektur route group Next.js, Framer Motion, Dark Mode, dan integrasi Supabase.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'POS & Inventaris Toko Bangunan',
    description:
      'Aplikasi POS Kasir Mobile PWA dan Sistem Inventaris Toko Bangunan dengan arsitektur route group Next.js, Framer Motion, Dark Mode, dan integrasi Supabase.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body suppressHydrationWarning className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
        <ThemeProvider>
          <ServiceWorkerRegister />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

