import './globals.css';
import React from 'react';
import { I18nProvider } from '@/lib/i18n';
import { AuthProvider } from '@/lib/auth';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { AgriMarkIntro } from '@/components/AgriMarkIntro';

export const metadata = {
  title: 'AgriMark — Farmer-First Agricultural Marketplace',
  description: 'Direct agricultural produce marketplace and intelligence OS for farmers, buyers, FPOs, and logistics.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#0a0f0d] text-gray-100 flex flex-col min-h-screen">
        <I18nProvider>
          <AuthProvider>
            <AgriMarkIntro />
            <Navbar />
            <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6">
              {children}
            </main>
            <Footer />
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
