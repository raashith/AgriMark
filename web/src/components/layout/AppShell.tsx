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

  const publicPages = new Set([
    '/', '/about', '/contact', '/help', '/faq', '/privacy', '/terms', '/cookies',
    '/accessibility', '/security', '/refund-policy', '/shipping-policy',
    '/auth/login', '/auth/register', '/auth/onboarding', '/auth/location',
    '/farmers', '/buyers', '/knowledge', '/research', '/policy', '/policy/schemes',
  ]);
  const isPublicPage = publicPages.has(pathname) || pathname.startsWith('/passport/');

  if (pathname === '/') {
    return (
      <ToastProvider>
        <AgriMarkIntro />
        <div className="min-h-screen bg-[#04100B] text-[#F7F5EE] font-sans selection:bg-[#1B4D3E] selection:text-white">
          {children}
        </div>
      </ToastProvider>
    );
  }

  return (
    <ToastProvider>
      {!isPublicPage && <AgriMarkIntro />}
      <div className="min-h-screen bg-[#19201D] text-[#F7F5EE] font-sans selection:bg-[#1B4D3E] selection:text-white">
        <Navbar />
        <div className="flex min-h-[calc(100vh-61px)] w-full bg-[#19201D]">
          {!isPublicPage && <Sidebar />}
          <main className="app-content-shell min-w-0 flex-1 px-4 py-5 md:px-6 lg:px-8 pb-24 lg:pb-10">
            <div className="mx-auto w-full max-w-[1200px]">
              {children}
            </div>
          </main>
        </div>
        <Footer />
        {!isPublicPage && <MobileNav />}
      </div>
    </ToastProvider>
  );
};
