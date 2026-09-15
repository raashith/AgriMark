'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import {
  Sprout,
  LayoutDashboard,
  MapPin,
  Calendar,
  Eye,
  Layers,
  ShoppingBag,
  ShoppingCart,
  TrendingUp,
  CloudSun,
  FileText,
  CheckSquare,
  ShieldCheck,
  Bot,
  Settings,
  Building2,
  Truck,
  Users,
} from 'lucide-react';

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

  let items = farmerNav;
  if (role === 'buyer') items = buyerNav;
  if (role === 'admin') items = adminNav;

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-[#121a16] border-r border-[#1e2d26] min-h-[calc(100vh-4rem)] p-4 space-y-6 shrink-0">
      {/* User Role Profile Badge */}
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

      {/* Nav List */}
      <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
        {items.map((item, idx) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={idx}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition ${
                isActive
                  ? 'bg-emerald-600 text-white font-bold shadow-md'
                  : 'text-gray-300 hover:text-white hover:bg-[#18241f]'
              }`}
            >
              <item.icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-emerald-400'}`} />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};
