import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Analytics } from '@vercel/analytics/react';
import './globals.css';

export const metadata: Metadata = {
  title: 'Otosipsak A.Ş.',
  description: 'Otosipsak A.Ş. — Hızlı, şeffaf ve güvenli satış süreci.',
  icons: {
    icon: '/images/oto-sipsak-icon-light.png',
    shortcut: '/images/oto-sipsak-icon-light.png',
    apple: '/images/oto-sipsak-icon-light.png'
  }
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="tr">
      <body className="font-sans bg-white text-slate-900 antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}

