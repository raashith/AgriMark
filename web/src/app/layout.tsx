import './globals.css';
import React from 'react';
import { I18nProvider } from '@/lib/i18n';
import { AuthProvider } from '@/lib/auth';
import { AppShell } from '@/components/layout/AppShell';

export const metadata = {
  title: 'AgriMark — National Agricultural Intelligence, Commerce & Trade OS',
  description: 'Production-ready agricultural ecosystem connecting farmers, buyers, FPOs, logistics, service providers, and administrators.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#0a0f0d] text-gray-100 min-h-screen">
        <I18nProvider>
          <AuthProvider>
            <AppShell>{children}</AppShell>
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}

