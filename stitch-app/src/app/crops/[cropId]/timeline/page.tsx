'use client';

import React from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/PageHeader';
import { CardPanel } from '@/components/ui/CardPanel';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/InputControls';
import { Users, Plus, CheckCircle2, FileSpreadsheet, AlertTriangle } from 'lucide-react';

export default function SmartTimelinePage({ params }: { params: { cropId: string } }) {
  const timeline = [
    {
      date: '2026-09-14',
      title: 'Foliar Spray Application (19:19:19 NPK + Neem Oil)',
      category: 'Spraying',
      labourAssigned: 'Baban (Labour Lead) + 2 Workers',
      cost: '₹1,250',
      status: 'completed',
    },
    {
      date: '2026-09-08',
      title: 'Field Weeding & Soil Mulching Tally',
      category: 'Weeding',
      labourAssigned: 'Family Labour (3 Persons)',
      cost: '₹800',
      status: 'completed',
    },
    {
      date: '2026-09-01',
      title: 'Drip Soluble Potash Fertigation Cycle',
      category: 'Irrigation',
      labourAssigned: 'Automated Drip Timer',
      cost: '₹2,100',
      status: 'completed',
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Smart Crop Timeline & Labour Ledger"
        subtitle="Chronological field activity log, labor voucher generator, and input cost sync."
        action={
          <div className="flex gap-2">
            <Link href={`/crops/${params.cropId}/scout`}>
              <Button variant="secondary" size="md">
                <AlertTriangle className="w-4 h-4" />
                <span>Log Scouting</span>
              </Button>
            </Link>
            <Link href={`/crops/${params.cropId}/harvest/new`}>
              <Button size="md">
                <Plus className="w-4 h-4" />
                <span>Record Harvest</span>
              </Button>
            </Link>
          </div>
        }
      />

      <CardPanel title="Field Task & Labour Ledger Entries">
        <div className="space-y-4">
          {timeline.map((entry, idx) => (
            <div key={idx} className="p-4 bg-[#F6F4ED] border border-[#E7E5DC] rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#1B4D3E]">{entry.date}</span>
                  <StatusBadge status={entry.category} />
                </div>
                <h4 className="font-bold text-sm text-[#19201D]">{entry.title}</h4>
                <p className="text-xs text-gray-500">
                  Labour: <span className="font-medium text-[#19201D]">{entry.labourAssigned}</span>
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-mono font-extrabold text-sm text-[#19201D]">{entry.cost}</span>
                <span className="p-2 bg-emerald-100 text-[#1B4D3E] rounded-lg">
                  <CheckCircle2 className="w-4 h-4" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardPanel>
    </div>
  );
}
