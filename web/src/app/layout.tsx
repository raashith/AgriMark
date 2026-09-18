import './globals.css';
import './agrimark-3d-landing.css';
import React from 'react';
import { I18nProvider } from '@/lib/i18n';
import { AuthProvider } from '@/lib/auth';
import { AppShell } from '@/components/layout/AppShell';

export const metadata = {
  title: 'AgriMark — Agricultural Intelligence',
  description: 'Connect farms, markets, AI and logistics in one agricultural intelligence platform.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-black text-white min-h-screen" style={{ background: '#000', color: '#fff' }}>
        <I18nProvider>
          <AuthProvider>
            <AppShell>{children}</AppShell>
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
