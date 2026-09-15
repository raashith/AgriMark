'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sprout, LayoutDashboard, ShoppingCart, Wallet, Bot } from 'lucide-react';

export const AgriDock: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    { label: 'Home', href: '/farmer/dashboard', icon: LayoutDashboard },
    { label: 'My Farm', href: '/farmer/farms', icon: Sprout },
    { label: 'AgriAI', href: '/ai-assistant', icon: Bot, isCenter: true },
    { label: 'Bazaar', href: '/marketplace', icon: ShoppingCart },
    { label: 'Khaata', href: '/finance', icon: Wallet },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#121a16]/95 backdrop-blur-lg border-t border-[#1e2d26] px-3 py-2">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          const Icon = item.icon;

          if (item.isCenter) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center -mt-6 group"
              >
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg border-4 border-[#0a0f0d] group-hover:scale-105 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-medium text-emerald-400 mt-1">
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition ${
                isActive
                  ? 'text-emerald-400 font-bold'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default AgriDock;
