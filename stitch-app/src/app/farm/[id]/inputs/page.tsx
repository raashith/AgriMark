'use client';

import React from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { CardPanel } from '@/components/ui/CardPanel';
import { MetricCard } from '@/components/ui/MetricCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/InputControls';
import { Package, Plus, QrCode, FileText } from 'lucide-react';

export default function InputTrackerPage({ params }: { params: { id: string } }) {
  const inputs = [
    {
      name: '19:19:19 Water Soluble NPK',
      category: 'Fertilizer',
      quantity: 50,
      unit: 'kg',
      cost: '₹3,500',
      supplier: 'IFFCO Agro Center Nashik',
      date: '2026-08-15',
    },
    {
      name: 'Cold-Pressed Organic Neem Oil 10000 PPM',
      category: 'Pesticide',
      quantity: 5,
      unit: 'Liters',
      cost: '₹1,200',
      supplier: 'MahaAgri Input Kendra',
      date: '2026-08-20',
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Input Inventory & Application Tracker"
        subtitle="Track fertilizers, bio-inputs, QR batch verification, and farm shed stock."
        action={
          <Button size="md">
            <Plus className="w-4 h-4" />
            <span>Add Input Purchase</span>
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard title="Total Input Expenses" value="₹4,700" subtitle="Kharif 2026 Season" icon={<Package className="w-5 h-5" />} />
        <MetricCard title="Verified Bio-Inputs" value="2 Products" subtitle="100% QR Scanned" icon={<QrCode className="w-5 h-5" />} />
        <MetricCard title="Shed Stock Status" value="Optimal" subtitle="Next Refill in 15 days" icon={<FileText className="w-5 h-5" />} />
      </div>

      <CardPanel title="Recorded Agro-Inputs Shed Ledger">
        <div className="space-y-3">
          {inputs.map((inp, idx) => (
            <div key={idx} className="p-4 bg-[#F6F4ED] border border-[#E7E5DC] rounded-xl flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-[#19201D]">{inp.name}</h4>
                  <StatusBadge status={inp.category} />
                </div>
                <p className="text-xs text-gray-500">
                  Purchased on {inp.date} • Supplier: {inp.supplier}
                </p>
              </div>

              <div className="text-right">
                <p className="font-mono font-extrabold text-sm text-[#1B4D3E]">{inp.quantity} {inp.unit}</p>
                <p className="text-xs font-bold text-gray-700">{inp.cost}</p>
              </div>
            </div>
          ))}
        </div>
      </CardPanel>
    </div>
  );
}
