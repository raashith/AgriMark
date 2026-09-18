'use client';

import React from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/PageHeader';
import { CardPanel } from '@/components/ui/CardPanel';
import { MetricCard } from '@/components/ui/MetricCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/InputControls';
import { ShoppingCart, Truck, Plus, ShieldCheck, ArrowRight, FileText } from 'lucide-react';

export default function BuyerDashboardPage() {
  const orders = [
    {
      id: 'ORD-99812',
      crop: 'Red Onion (Bhima Super)',
      quantityKg: 5000,
      amount: '₹1,30,000',
      seller: 'Shree Ganesh Krishi Farm (Ramesh Patil)',
      status: 'in_transit',
      reeferTemp: '+4.2°C',
      bay: 'Bay #2 Bhiwandi Terminal',
    },
    {
      id: 'ORD-88124',
      crop: 'Sharbati Wheat',
      quantityKg: 10000,
      amount: '₹3,20,000',
      seller: 'Narmada Kisan FPO',
      status: 'confirmed',
      reeferTemp: 'Ambient',
      bay: 'Pending Loading',
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Buyer Procurement Dashboard"
        subtitle="Manage active produce purchases, cold-chain in-transit orders, and escrow releases."
        action={
          <div className="flex gap-2">
            <Link href="/buyer/rfqs">
              <Button variant="secondary" size="md">
                <Plus className="w-4 h-4" />
                <span>Issue New RFQ</span>
              </Button>
            </Link>
            <Link href="/marketplace">
              <Button size="md">
                <ShoppingCart className="w-4 h-4" />
                <span>Browse Live Mandi</span>
              </Button>
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard title="Active Procurements" value="15,000 kg" subtitle="2 Orders In-Flight" icon={<ShoppingCart className="w-5 h-5" />} />
        <MetricCard title="Escrow Value Locked" value="₹4,50,000" subtitle="100% Protected" icon={<ShieldCheck className="w-5 h-5" />} />
        <MetricCard title="In-Transit Cold Chain" value="1 Reefer Truck" subtitle="+4.2°C Bhiwandi Route" icon={<Truck className="w-5 h-5" />} />
      </div>

      <CardPanel title="Active Buyer Orders & Dispatches">
        <div className="space-y-4">
          {orders.map((ord) => (
            <div key={ord.id} className="p-4 bg-[#F6F4ED] border border-[#E7E5DC] rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#1B4D3E]">{ord.id}</span>
                  <h3 className="font-bold text-sm text-[#19201D]">{ord.crop}</h3>
                  <StatusBadge status={ord.status} />
                </div>
                <p className="text-xs text-gray-500">
                  Seller: {ord.seller} • {ord.quantityKg.toLocaleString()} kg • {ord.bay}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="font-mono font-extrabold text-sm text-[#19201D]">{ord.amount}</p>
                  <p className="text-[11px] font-mono text-emerald-700 font-bold">Temp: {ord.reeferTemp}</p>
                </div>

                <Link href={`/logistics/track/${ord.id}`}>
                  <Button size="sm" variant="secondary">
                    <Truck className="w-3.5 h-3.5" />
                    <span>Track Reefer</span>
                  </Button>
                </Link>
                <Link href={`/logistics/gate-pass/${ord.id}`}>
                  <Button size="sm">
                    <span>Gate Pass QR</span>
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </CardPanel>
    </div>
  );
}
