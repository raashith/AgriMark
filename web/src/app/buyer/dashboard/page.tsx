'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, Bot, PackageCheck, ShoppingBag, TrendingUp, Truck } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';

export default function BuyerDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ listings: 0, orders: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getListings().catch(() => []), api.getOrders().catch(() => [])])
      .then(([listings, orders]) => setStats({
        listings: listings.filter((x: any) => (x.quantity_available_kg ?? 0) > 0).length,
        orders: orders.length,
      }))
      .finally(() => setLoading(false));
  }, []);

  const actions = [
    { title: 'Mandi Prices', text: 'Compare current mandi signals before procurement.', href: '/market-prices', icon: TrendingUp },
    { title: 'Market', text: 'Discover verified produce available now.', href: '/buyer/market', icon: PackageCheck },
    { title: 'Orders', text: 'Track purchases, fulfillment and delivery.', href: '/buyer/orders', icon: ShoppingBag },
    { title: 'Listed', text: 'Review all currently listed produce.', href: '/buyer/listed', icon: Truck },
    { title: 'AgriAI', text: 'Ask AgriAI about crops, prices and procurement.', href: '/ai-assistant', icon: Bot },
  ];

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-[#214235] bg-gradient-to-br from-[#10251b] via-[#0d1712] to-[#09100c] p-6 md:p-8">
        <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="relative">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">Buyer workspace</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-white md:text-4xl">Welcome back{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}.</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-400">One focused procurement flow: prices → market → order → listed supply → AgriAI.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/buyer/market" className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-500">Open Market <ArrowRight className="h-4 w-4" /></Link>
            <Link href="/market-prices" className="inline-flex items-center gap-2 rounded-xl border border-emerald-800 bg-[#0a130e] px-4 py-2.5 text-sm font-bold text-emerald-200 hover:bg-emerald-950/60">Check Mandi Prices</Link>
          </div>
        </div>
      </section>
      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="rounded-2xl border border-[#1e2d26] bg-[#121a16] p-4"><p className="text-[10px] uppercase tracking-wider text-gray-500">Live listings</p><p className="mt-2 text-2xl font-black text-white">{loading ? '—' : stats.listings}</p></div>
        <div className="rounded-2xl border border-[#1e2d26] bg-[#121a16] p-4"><p className="text-[10px] uppercase tracking-wider text-gray-500">My orders</p><p className="mt-2 text-2xl font-black text-white">{loading ? '—' : stats.orders}</p></div>
        <div className="rounded-2xl border border-[#1e2d26] bg-[#121a16] p-4"><p className="text-[10px] uppercase tracking-wider text-gray-500">Role</p><p className="mt-2 text-lg font-black text-emerald-400">BUYER</p></div>
        <div className="rounded-2xl border border-[#1e2d26] bg-[#121a16] p-4"><p className="text-[10px] uppercase tracking-wider text-gray-500">AI access</p><p className="mt-2 text-lg font-black text-white">Ready</p></div>
      </section>
      <section>
        <div className="mb-3"><p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-500">Procurement flow</p><h2 className="mt-1 text-xl font-bold text-white">Everything a buyer needs</h2></div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {actions.map((item) => <Link key={item.href} href={item.href} className="group rounded-2xl border border-[#1e2d26] bg-[#121a16] p-4 transition hover:-translate-y-0.5 hover:border-emerald-700/70"><item.icon className="h-5 w-5 text-emerald-400" /><h3 className="mt-4 text-sm font-bold text-white">{item.title}</h3><p className="mt-1 text-xs leading-5 text-gray-500">{item.text}</p><span className="mt-4 inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400">Open <ArrowRight className="h-3 w-3 transition group-hover:translate-x-1" /></span></Link>)}
        </div>
      </section>
    </div>
  );
}
