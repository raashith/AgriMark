'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import {
  LayoutDashboard,
  Sprout,
  Store,
  Truck,
  Package,
  Wallet,
  Bot,
  ShieldAlert,
  PlusCircle,
  FileText,
  Users,
} from 'lucide-react';

export const DesktopSidebar: React.FC = () => {
  const pathname = usePathname();
  const { role } = useAuth();

  const navItems = [
    { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { label: 'My Farms', href: '/farm', icon: Sprout },
    { label: 'Live Mandi', href: '/marketplace', icon: Store },
    { label: 'Inventory Lots', href: '/inventory', icon: Package },
    { label: 'Orders', href: '/farmer/orders', icon: FileText },
    { label: 'Logistics', href: '/logistics/deliveries', icon: Truck },
    { label: 'Farm Khaata', href: '/finance', icon: Wallet },
    { label: 'AgriAI Assistant', href: '/ai-assistant', icon: Bot },
  ];

  if (role === 'buyer') {
    navItems.splice(1, 1, { label: 'Buyer Dashboard', href: '/buyer/dashboard', icon: LayoutDashboard });
    navItems.push({ label: 'RFQs Procurement', href: '/buyer/rfqs', icon: Users });
  }

  if (role === 'admin') {
    navItems.push({ label: 'Dispute Desk', href: '/admin/disputes', icon: ShieldAlert });
  }

  return (
    <aside className="w-64 bg-white border-r border-[#E7E5DC] p-4 flex-col justify-between hidden md:flex min-h-[calc(100vh-61px)]">
      <div className="space-y-6">
        {/* Quick Action Button */}
        <Link
          href="/marketplace/new"
          className="w-full py-3 px-4 bg-[#1B4D3E] hover:bg-[#143B30] text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition"
        >
          <PlusCircle className="w-4 h-4 text-amber-300" />
          <span>List Produce on Mandi</span>
        </Link>

        {/* Navigation List */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition ${
                  isActive
                    ? 'bg-[#1B4D3E] text-white shadow-sm'
                    : 'text-[#19201D] hover:bg-[#F6F4ED] hover:text-[#1B4D3E]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-300' : 'text-gray-500'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Banner */}
      <div className="p-3 bg-[#F6F4ED] border border-[#E7E5DC] rounded-xl text-center space-y-1">
        <span className="text-[10px] font-mono font-bold text-[#1B4D3E] uppercase">NABL Certified Mandi</span>
        <p className="text-[11px] text-gray-500">Instant Escrow Disbursal & GPS Reefer Cold Chain</p>
      </div>
    </aside>
  );
};
