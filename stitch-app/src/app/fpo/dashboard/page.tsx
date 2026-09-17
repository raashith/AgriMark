'use client';

import React from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/PageHeader';
import { CardPanel } from '@/components/ui/CardPanel';
import { MetricCard } from '@/components/ui/MetricCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/InputControls';
import { Users, Sprout, Store, PackageCheck, Plus, FileSpreadsheet } from 'lucide-react';

export default function FpoDashboardPage() {
  const members = [
    { name: 'Ramesh Patil', land: '4.5 Acres', crop: 'Red Onion', lotCode: 'LOT-N-884', status: 'active' },
    { name: 'Suresh More', land: '2.0 Acres', crop: 'Pomegranate', lotCode: 'LOT-S-412', status: 'active' },
    { name: 'Vijay Deshmukh', land: '6.0 Acres', crop: 'Sharbati Wheat', lotCode: 'LOT-W-991', status: 'active' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="FPO & Farmer Cooperative Aggregation Desk"
        subtitle="Aggregate member farm harvests, manage bulk seed/fertilizer procurement, and issue Khaata vouchers."
        action={
          <div className="flex gap-2">
            <Link href="/marketplace/new">
              <Button size="md">
                <Plus className="w-4 h-4" />
                <span>Create Bulk FPO Listing</span>
              </Button>
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard title="Registered FPO Members" value="142 Farmers" subtitle="Niphad Taluka Co-op" icon={<Users className="w-5 h-5" />} />
        <MetricCard title="Aggregated Produce Stock" value="48,500 kg" subtitle="Grade A Nashik Allium" icon={<PackageCheck className="w-5 h-5" />} />
        <MetricCard title="Bulk Procurement Khaata" value="₹12.4 Lakhs" subtitle="Fertilizer & Seed Orders" icon={<FileSpreadsheet className="w-5 h-5" />} />
      </div>

      <CardPanel title="FPO Member Harvest Aggregation Ledger">
        <div className="space-y-3">
          {members.map((m, idx) => (
            <div key={idx} className="p-4 bg-[#F6F4ED] border border-[#E7E5DC] rounded-xl flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-[#19201D]">{m.name}</h4>
                  <StatusBadge status={m.status} />
                </div>
                <p className="text-xs text-gray-500">
                  Land: {m.land} • Crop: {m.crop} • Lot Tag: <span className="font-mono font-bold text-[#1B4D3E]">{m.lotCode}</span>
                </p>
              </div>

              <Button size="sm" variant="secondary">View Passport</Button>
            </div>
          ))}
        </div>
      </CardPanel>
    </div>
  );
}
