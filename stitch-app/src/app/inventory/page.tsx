'use client';

import React from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/PageHeader';
import { CardPanel } from '@/components/ui/CardPanel';
import { MetricCard } from '@/components/ui/MetricCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/InputControls';
import { Package, Plus, QrCode, Tag, ArrowRight } from 'lucide-react';

export default function ProduceInventoryPage() {
  const produceLots = [
    {
      id: 'LOT-N-884',
      crop: 'Red Onion (Bhima Super)',
      availableKg: 12000,
      escrowLockedKg: 5000,
      grade: 'Grade A',
      farmName: 'Shree Ganesh Krishi Farm',
      location: 'Nashik, Maharashtra',
      assayTag: 'NABL-NSK-2026-9921',
      status: 'active',
    },
    {
      id: 'LOT-S-412',
      crop: 'Bhagwa Pomegranate',
      availableKg: 3500,
      escrowLockedKg: 0,
      grade: 'Grade A',
      farmName: 'Maheshwari Organic Orchard',
      location: 'Solapur, Maharashtra',
      assayTag: 'NABL-SLP-2026-4412',
      status: 'active',
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Produce Inventory & Lot Ledger"
        subtitle="Manage NABL certified produce lots, escrow-locked inventory, and Mandi listing status."
        action={
          <Link href="/crops/crop-001/harvest/new">
            <Button size="md">
              <Plus className="w-4 h-4" />
              <span>Record Harvest Batch</span>
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard title="Total Available Produce" value="15,500 kg" subtitle="Ready for Mandi Listing" icon={<Package className="w-5 h-5" />} />
        <MetricCard title="Escrow-Locked Stock" value="5,000 kg" subtitle="Pending Dispatch Confirmation" icon={<Tag className="w-5 h-5" />} />
        <MetricCard title="NABL Assayed Lots" value="2 Lots" subtitle="100% Quality Tagged" icon={<QrCode className="w-5 h-5" />} />
      </div>

      <CardPanel title="Active Produce Lots in Shed">
        <div className="space-y-4">
          {produceLots.map((lot) => (
            <div key={lot.id} className="p-4 bg-[#F6F4ED] border border-[#E7E5DC] rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#1B4D3E]">{lot.id}</span>
                  <h3 className="font-bold text-sm text-[#19201D]">{lot.crop}</h3>
                  <StatusBadge status={lot.grade} />
                </div>
                <p className="text-xs text-gray-500">
                  {lot.farmName} • {lot.location} • NABL Tag: <span className="font-mono font-semibold text-[#1B4D3E]">{lot.assayTag}</span>
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-mono font-extrabold text-sm text-[#19201D]">
                    {lot.availableKg.toLocaleString()} kg <span className="text-xs font-normal text-gray-500">Available</span>
                  </p>
                  {lot.escrowLockedKg > 0 && (
                    <p className="text-xs font-mono font-bold text-amber-700">
                      {lot.escrowLockedKg.toLocaleString()} kg Escrow Locked
                    </p>
                  )}
                </div>

                <Link href={`/produce/${lot.id}/list`}>
                  <Button size="sm">
                    <Tag className="w-3.5 h-3.5" />
                    <span>List on Mandi</span>
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
