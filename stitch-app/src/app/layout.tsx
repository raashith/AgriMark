import './globals.css';
import React from 'react';
import { I18nProvider } from '@/lib/i18n';
import { AuthProvider } from '@/lib/auth';
import { AppShell } from '@/components/layout/AppShell';

export const metadata = {
  title: 'AgriMark — Bharat Agricultural OS & Intelligence',
  description: 'Direct agricultural produce marketplace, crop intelligence, Khaata ledger, and escrow trade OS.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#FBF9F2] text-[#19201D] min-h-screen">
        <I18nProvider>
          <AuthProvider>
            <AppShell>{children}</AppShell>
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
