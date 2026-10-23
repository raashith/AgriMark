'use client';

import React from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { Footer } from './Footer';
import { ToastProvider } from '@/components/ui/Toast';
import { AgriMarkIntro } from '@/components/AgriMarkIntro';
import { usePathname } from 'next/navigation';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();

  const isPublicPage = [
    '/', '/about', '/contact', '/help', '/faq', '/privacy', '/terms',
    '/cookies', '/accessibility', '/security', '/refund-policy',
    '/shipping-policy', '/auth/login', '/auth/register', '/auth/onboarding',
  ].includes(pathname);

  if (pathname === '/') {
    return (
      <ToastProvider>
        <AgriMarkIntro />
        <div className="min-h-screen bg-[#000000] font-sans text-white selection:bg-[#1B4D3E] selection:text-white">{children}</div>
      </ToastProvider>
    );
  }

  return (
    <ToastProvider>
      <AgriMarkIntro />
      <div className="flex min-h-screen flex-col bg-[#0a0f0d] font-sans text-gray-100 selection:bg-emerald-600 selection:text-white">
        <Navbar />
        <div className="mx-auto flex w-full max-w-[1800px] flex-1">
          {!isPublicPage && <Sidebar />}
          <main className="min-w-0 flex-1 p-3 pb-24 sm:p-4 md:p-6 lg:p-7 lg:pb-10">
            {children}
          </main>
        </div>
        <Footer />
        {!isPublicPage && <MobileNav />}
      </div>
    </ToastProvider>
  );
};
