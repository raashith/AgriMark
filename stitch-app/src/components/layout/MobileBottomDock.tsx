'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Sprout, Store, Wallet, Bot } from 'lucide-react';

export const MobileBottomDock: React.FC = () => {
  const pathname = usePathname();

  const dockItems = [
    { label: 'Home', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Farm', href: '/farm', icon: Sprout },
    { label: 'Mandi', href: '/marketplace', icon: Store },
    { label: 'Khaata', href: '/finance', icon: Wallet },
    { label: 'AgriAI', href: '/ai-assistant', icon: Bot },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#19201D] text-white border-t border-emerald-950 px-2 py-2 flex items-center justify-around md:hidden shadow-2xl pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
      {dockItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] px-2 py-1 rounded-xl transition ${
              isActive
                ? 'bg-[#1B4D3E] text-amber-300 font-extrabold scale-105'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Icon className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};
