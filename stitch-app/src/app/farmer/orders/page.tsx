'use client';

import React from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/PageHeader';
import { CardPanel } from '@/components/ui/CardPanel';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/InputControls';
import { FileText, Truck, QrCode, ArrowRight } from 'lucide-react';

export default function FarmerOrdersPage() {
  const orders = [
    {
      id: 'ORD-99812',
      crop: 'Red Onion (Bhima Super)',
      quantityKg: 5000,
      totalAmount: '₹1,30,000',
      buyer: 'Reliance Fresh Retail Procurement',
      dispatchDate: '2026-09-15',
      status: 'in_transit',
      gatePassCode: 'GP-BHIWANDI-0915',
    },
    {
      id: 'ORD-88102',
      crop: 'Bhagwa Pomegranate',
      quantityKg: 2000,
      totalAmount: '₹1,70,000',
      buyer: 'Sahyadri Farmers Producer Co.',
      dispatchDate: '2026-09-10',
      status: 'completed',
      gatePassCode: 'GP-NASHIK-0910',
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Farmer Orders & Mandi Dispatches"
        subtitle="Track confirmed Mandi buyers, dispatch gate passes, and escrow disbursals."
      />

      <CardPanel title="Order Fulfillment Feed">
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
                  Buyer: {ord.buyer} • Quantity: {ord.quantityKg.toLocaleString()} kg • Dispatched: {ord.dispatchDate}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-mono font-extrabold text-sm text-[#19201D]">{ord.totalAmount}</span>

                <Link href={`/logistics/gate-pass/${ord.id}`}>
                  <Button size="sm" variant="secondary">
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Gate Pass</span>
                  </Button>
                </Link>

                <Link href={`/finance/receipt/${ord.id}`}>
                  <Button size="sm">
                    <span>Receipt</span>
                    <ArrowRight className="w-3.5 h-3.5" />
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
