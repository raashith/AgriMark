'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { TopNav } from './TopNav';
import { DesktopSidebar } from './DesktopSidebar';
import { MobileBottomDock } from './MobileBottomDock';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const isLandingPage = pathname === '/';

  if (isLandingPage) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F7F5EE] text-[#19201D] overflow-x-hidden selection:bg-[#E5A93C]/30 selection:text-[#1B4D3E]">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F2] text-[#19201D]">
      <TopNav />
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <DesktopSidebar />
        <main className="flex-1 p-4 md:p-8 mb-20 md:mb-8 overflow-x-hidden">
          {children}
        </main>
      </div>
      <MobileBottomDock />
    </div>
  );
};

