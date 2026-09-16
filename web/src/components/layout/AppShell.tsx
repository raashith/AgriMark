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

  // Hide sidebar on public marketing / legal pages if not logged in or on specific public pages
  const isPublicPage = [
    '/',
    '/about',
    '/contact',
    '/help',
    '/faq',
    '/privacy',
    '/terms',
    '/cookies',
    '/accessibility',
    '/security',
    '/refund-policy',
    '/shipping-policy',
    '/auth/login',
    '/auth/register',
    '/auth/onboarding',
  ].includes(pathname);

  return (
    <ToastProvider>
      <AgriMarkIntro />
      <div className="min-h-screen bg-[#0a0f0d] text-gray-100 flex flex-col font-sans selection:bg-emerald-600 selection:text-white">
        <Navbar />
        <div className="flex-1 flex w-full max-w-[1600px] mx-auto">
          {!isPublicPage && <Sidebar />}
          <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 lg:pb-12 space-y-6">
            {children}
          </main>
        </div>
        <Footer />
        {!isPublicPage && <MobileNav />}
      </div>
    </ToastProvider>
  );
};
