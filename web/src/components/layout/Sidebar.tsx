'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Sprout, LayoutDashboard, MapPin, Calendar, Eye, Layers, ShoppingBag, ShoppingCart, TrendingUp, CloudSun, FileText, CheckSquare, ShieldCheck, Bot, Settings, Building2, Truck, Users } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { user, role } = useAuth();

  const farmerNav = [
    { label: 'Dashboard', href: '/farmer/dashboard', icon: LayoutDashboard },
    { label: 'My Farms', href: '/farmer/farms', icon: MapPin },
    { label: 'Crops & Cultivation', href: '/farmer/crops', icon: Sprout },
    { label: 'Crop Plans', href: '/farmer/crop-plans', icon: Calendar },
    { label: 'Field Observations', href: '/farmer/observations', icon: Eye },
    { label: 'Harvest & Lots', href: '/farmer/harvest', icon: Layers },
    { label: 'Produce Stock', href: '/farmer/produce', icon: ShoppingBag },
    { label: 'My Listings', href: '/farmer/sell', icon: ShoppingCart },
    { label: 'Received Orders', href: '/farmer/orders', icon: CheckSquare },
    { label: 'Mandi Prices', href: '/market-prices', icon: TrendingUp },
    { label: 'Weather & Climate', href: '/weather', icon: CloudSun },
    { label: 'Farm Finance', href: '/finance', icon: FileText },
    { label: 'Farm Tasks', href: '/tasks', icon: CheckSquare },
    { label: 'Land Documents', href: '/documents', icon: ShieldCheck },
    { label: 'Produce Passport', href: '/farmer/traceability', icon: ShieldCheck },
    { label: 'AgriAI Assistant', href: '/ai-assistant', icon: Bot },
    { label: 'Settings', href: '/farmer/settings', icon: Settings },
  ];
  const buyerNav = [
    { label: 'Procurement Dashboard', href: '/buyer/marketplace', icon: LayoutDashboard },
    { label: 'Browse Produce', href: '/marketplace', icon: ShoppingCart },
    { label: 'RFQs & Demands', href: '/buyer/rfqs', icon: FileText },
    { label: 'Offers Received', href: '/buyer/offers', icon: Layers },
    { label: 'My Orders', href: '/buyer/orders', icon: ShoppingBag },
    { label: 'Verified Suppliers', href: '/farmers', icon: Users },
    { label: 'Market Prices', href: '/market-prices', icon: TrendingUp },
    { label: 'Logistics', href: '/logistics', icon: Truck },
    { label: 'Cold Storage', href: '/storage', icon: Building2 },
    { label: 'AgriAI Assistant', href: '/ai-assistant', icon: Bot },
  ];
  const adminNav = [
    { label: 'Admin Operations', href: '/admin/dashboard', icon: ShieldCheck },
    { label: 'Marketplace', href: '/marketplace', icon: ShoppingCart },
    { label: 'Market Intelligence', href: '/market-prices', icon: TrendingUp },
    { label: 'Cold Storage', href: '/storage', icon: Building2 },
    { label: 'Logistics', href: '/logistics', icon: Truck },
    { label: 'Documents Review', href: '/documents', icon: FileText },
    { label: 'AgriAI Engine', href: '/ai-assistant', icon: Bot },
  ];

  const items = role === 'buyer' ? buyerNav : role === 'admin' ? adminNav : farmerNav;

  return (
    <aside className="hidden lg:flex w-[235px] shrink-0 flex-col min-h-[calc(100vh-4rem)] border-r border-[#24382e] bg-[#0c120f] p-4">
      <div className="mb-4 flex items-center gap-3 rounded-[18px] border border-white/10 bg-[#07110d] p-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#3e7b54]/60 bg-[#1b4d3e]/25 text-sm font-bold text-[#52a67a]">
          {user?.full_name ? user.full_name[0].toUpperCase() : 'A'}
        </div>
        <div className="min-w-0">
          <h4 className="truncate text-sm font-bold text-[#f7f5ee]">{user?.full_name || 'AgriMark User'}</h4>
          <span className="mt-1 inline-block rounded-full border border-[#3e7b54]/50 bg-[#1b4d3e]/30 px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider text-[#9bc7a2]">{role || 'Farmer'}</span>
        </div>
      </div>
      <div className="mb-3 px-3 text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-gray-500">Workspace</div>
      <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
        {items.map((item) => {
          const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href} className={`group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm transition ${active ? 'bg-[#1b4d3e] font-semibold text-[#f7f5ee] shadow-md shadow-black/20' : 'font-medium text-[#adbdb2] hover:bg-[#16221c] hover:text-[#f7f5ee]'}`}>
              <item.icon className={`h-4 w-4 shrink-0 ${active ? 'text-[#f7f5ee]' : 'text-[#52a67a] group-hover:text-[#9bc7a2]'}`} />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};
