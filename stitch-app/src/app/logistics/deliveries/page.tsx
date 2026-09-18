'use client';

import React from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/PageHeader';
import { CardPanel } from '@/components/ui/CardPanel';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/InputControls';
import { Truck, QrCode, ArrowRight } from 'lucide-react';

export default function LogisticsDeliveriesPage() {
  const deliveries = [
    {
      orderId: 'ORD-99812',
      crop: 'Red Onion (Bhima Super)',
      quantityKg: 5000,
      driver: 'Santosh Shinde',
      vehicle: 'MH-15-EG-4412 (Eicher Reefer)',
      bay: 'Bay #2 Bhiwandi Terminal',
      status: 'in_transit',
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Logistics Fleet & Delivery Operations"
        subtitle="Manage active transit jobs, temperature telemetry, and dock gate passes."
      />

      <CardPanel title="Active Dispatch Jobs">
        <div className="space-y-3">
          {deliveries.map((del) => (
            <div key={del.orderId} className="p-4 bg-[#F6F4ED] border border-[#E7E5DC] rounded-xl flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#1B4D3E]">{del.orderId}</span>
                  <h3 className="font-bold text-sm text-[#19201D]">{del.crop}</h3>
                  <StatusBadge status={del.status} />
                </div>
                <p className="text-xs text-gray-500">
                  Vehicle: {del.vehicle} • Driver: {del.driver} • Destination: {del.bay}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Link href={`/logistics/track/${del.orderId}`}>
                  <Button size="sm" variant="secondary">
                    <Truck className="w-3.5 h-3.5" />
                    <span>GPS Track</span>
                  </Button>
                </Link>
                <Link href={`/logistics/gate-pass/${del.orderId}`}>
                  <Button size="sm">
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Gate Pass</span>
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
