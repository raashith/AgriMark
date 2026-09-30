'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import {
  Sprout, LayoutDashboard, MapPin, Calendar, Eye, Layers, ShoppingBag,
  ShoppingCart, TrendingUp, CloudSun, FileText, CheckSquare, ShieldCheck,
  Bot, Settings, Building2, Truck, Users, ChevronLeft, PackageCheck,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { user, role } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

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
    { label: 'Market', href: '/buyer/stock', icon: PackageCheck },
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

  let items = farmerNav;
  if (role === 'buyer') items = buyerNav;
  if (role === 'admin') items = adminNav;

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      if (event.clientX <= 14) setIsOpen(true);
    };
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, []);

  return (
    <>
      <div aria-hidden="true" className="fixed left-0 top-0 z-[70] hidden lg:block w-3 h-screen" onMouseEnter={() => setIsOpen(true)} />
      <aside
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        aria-label="AgriMark navigation"
        className={[
          'fixed left-0 top-16 z-[60] hidden lg:flex h-[calc(100vh-4rem)] w-64',
          'flex-col bg-[#121a16] border-r border-[#1e2d26] p-4 space-y-6',
          'shadow-[12px_0_40px_rgba(0,0,0,0.22)] transition-transform duration-200 ease-out',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        <div className="p-3.5 bg-[#0a0f0d] border border-[#1e2d26] rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-950 border border-emerald-700/60 rounded-xl flex items-center justify-center text-emerald-400 font-bold shrink-0">
            {user?.full_name ? user.full_name[0].toUpperCase() : 'A'}
          </div>
          <div className="overflow-hidden">
            <h4 className="font-bold text-sm text-white truncate">{user?.full_name || 'AgriMark User'}</h4>
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-400 px-2 py-0.5 bg-emerald-950/80 border border-emerald-800/40 rounded-full inline-block">
              {role || 'Farmer'}
            </span>
          </div>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
          {items.map((item, idx) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link key={idx} href={item.href} className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition ${isActive ? 'bg-emerald-600 text-white font-bold shadow-md' : 'text-gray-300 hover:text-white hover:bg-[#18241f]'}`}>
                <item.icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-emerald-400'}`} />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <button type="button" onClick={() => setIsOpen(false)} className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-[#18241f] hover:text-white transition" aria-label="Close navigation" title="Close navigation">
          <ChevronLeft className="h-4 w-4" />
        </button>
      </aside>
    </>
  );
};
