'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { LayoutDashboard, ShoppingCart, TrendingUp, Bot, Menu } from 'lucide-react';

export const MobileNav: React.FC<{ onOpenMobileMenu?: () => void }> = ({ onOpenMobileMenu }) => {
  const pathname = usePathname();
  const { role } = useAuth();

  const mainDashboard = role === 'buyer' ? '/buyer/marketplace' : role === 'admin' ? '/admin/dashboard' : '/farmer/dashboard';

  const navItems = [
    { label: 'Home', href: '/', icon: LayoutDashboard },
    { label: 'Dashboard', href: mainDashboard, icon: LayoutDashboard },
    { label: 'Market', href: '/marketplace', icon: ShoppingCart },
    { label: 'Prices', href: '/market-prices', icon: TrendingUp },
    { label: 'AgriAI', href: '/ai-assistant', icon: Bot },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0d1410]/95 backdrop-blur-md border-t border-[#1e2d26] px-3 py-2 flex items-center justify-around shadow-2xl">
      {navItems.map((item, idx) => {
        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
        return (
          <Link
            key={idx}
            href={item.href}
            className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition ${
              isActive ? 'text-emerald-400 font-bold' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[10px] tracking-tight">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};
