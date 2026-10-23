'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import {
  Sprout, LayoutDashboard, MapPin, Calendar, Eye, Layers, ShoppingBag,
  ShoppingCart, TrendingUp, CloudSun, FileText, CheckSquare, ShieldCheck,
  Bot, Settings, Building2, Truck, Users, PackageCheck, Navigation,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(false);
  const { user, role } = useAuth();
  const normalizedRole = String(role || user?.role || '').trim().toLowerCase();
  const isBuyerRoute = pathname === '/buyer' || pathname.startsWith('/buyer/');
  const isLogisticsRoute = pathname === '/logistics' || pathname.startsWith('/logistics/');

  const farmerNav = [
    { label: 'Dashboard', href: '/farmer/dashboard', icon: LayoutDashboard },
    { label: 'My Farms', href: '/farmer/farms', icon: MapPin },
    { label: 'Crops & Cultivation', href: '/farmer/crops', icon: Sprout },
    { label: 'Crop Plans', href: '/farmer/crop-plans', icon: Calendar },
    { label: 'Field Observations', href: '/farmer/observations', icon: Eye },
    { label: 'Harvest & Lots', href: '/farmer/harvest', icon: Layers },
    { label: 'Produce Stock', href: '/farmer/produce', icon: ShoppingBag },
    { label: 'My Listings', href: '/farmer/sell', icon: ShoppingCart },
    { label: 'Market', href: '/farmer/market', icon: PackageCheck },
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
    { label: 'Home', href: '/buyer/dashboard', icon: LayoutDashboard },
    { label: 'Mandi Prices', href: '/market-prices', icon: TrendingUp },
    { label: 'Market', href: '/buyer/market', icon: PackageCheck },
    { label: 'Orders', href: '/buyer/orders', icon: ShoppingBag },
    { label: 'Listed', href: '/buyer/listed', icon: Layers },
    { label: 'AgriAI', href: '/ai-assistant', icon: Bot },
  ];

  const logisticsNav = [
    { label: 'Operations', href: '/logistics', icon: LayoutDashboard },
    { label: 'Delivery Board', href: '/logistics/deliveries', icon: PackageCheck },
    { label: 'Live Routes & Map', href: '/logistics/routes', icon: Navigation },
    { label: 'Fleet', href: '/logistics/fleet', icon: Truck },
    { label: 'Drivers', href: '/logistics/drivers', icon: Users },
    { label: 'Cold Chain', href: '/logistics/cold-chain', icon: CloudSun },
    { label: 'Marketplace Orders', href: '/marketplace', icon: ShoppingCart },
    { label: 'Settings', href: '/farmer/settings', icon: Settings },
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

  let items = farmerNav;
  if (normalizedRole === 'buyer' || isBuyerRoute) items = buyerNav;
  if (normalizedRole === 'logistics' || isLogisticsRoute) items = logisticsNav;
  if (normalizedRole === 'admin') items = adminNav;

  const isItemActive = (href: string) => {
    if (href === '/logistics') return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <aside
      aria-label="AgriMark navigation"
      aria-expanded={isExpanded}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      onFocus={() => setIsExpanded(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setIsExpanded(false);
      }}
      className={`sticky top-[4.25rem] z-30 hidden h-[calc(100vh-4.25rem)] shrink-0 flex-col border-r border-[#1e2d26] bg-[#0d1511] p-2 transition-[width] duration-200 ease-out lg:flex ${isExpanded ? 'w-64 shadow-2xl' : 'w-[4.5rem]'}`}
    >
      <div className={`mb-3 flex min-h-14 items-center gap-3 overflow-hidden rounded-2xl border border-[#1e2d26] bg-[#0a0f0d] ${isExpanded ? 'p-3' : 'justify-center p-1.5'}`}>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-700/60 bg-emerald-950 font-bold text-emerald-400">
          {user?.avatar_url ? <img src={user.avatar_url} alt="" referrerPolicy="no-referrer" className="h-full w-full rounded-xl object-cover" /> : (user?.full_name?.trim()?.[0]?.toUpperCase() || 'A')}
        </div>
        <div className={`min-w-0 ${isExpanded ? 'opacity-100' : 'hidden'}`}>
          <h4 className="truncate text-sm font-bold text-white">{user?.full_name || 'AgriMark User'}</h4>
          <span className="mt-1 inline-block rounded-full border border-emerald-800/40 bg-emerald-950/80 px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">
            {role || 'Farmer'}
          </span>
        </div>
      </div>
      {isExpanded ? <div className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">Workspace</div> : <div className="mb-2 text-center text-[9px] text-gray-600" aria-hidden="true">•••</div>}
      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto pr-1" aria-label="Workspace pages">
        {items.map((item) => {
          const active = isItemActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              title={isExpanded ? undefined : item.label}
              className={`group flex items-center rounded-xl border py-2.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${isExpanded ? 'gap-3 px-3' : 'justify-center px-0'} ${active ? 'border-emerald-500/30 bg-emerald-600 text-white shadow-sm' : 'border-transparent text-gray-300 hover:border-[#294238] hover:bg-[#14221b] hover:text-white'}`}
            >
              <item.icon className={`h-4 w-4 shrink-0 ${active ? 'text-white' : 'text-emerald-400 group-hover:text-emerald-300'}`} />
              {isExpanded && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>
      <div className={`mt-3 rounded-xl border border-[#1e2d26] bg-[#0a0f0d] ${isExpanded ? 'p-3' : 'flex justify-center p-2'}`}>
        <div className="flex items-center gap-2 text-[11px] font-semibold text-gray-300"><Sprout className="h-4 w-4 shrink-0 text-emerald-400" /> {isExpanded && <span>Farmer-first logistics</span>}</div>
        {isExpanded && <p className="mt-1 text-[10px] leading-4 text-gray-500">Track shipments and open routes in the map workspace.</p>}
      </div>
    </aside>
  );
};
