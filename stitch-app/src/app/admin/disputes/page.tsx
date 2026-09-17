'use client';

import React from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { CardPanel } from '@/components/ui/CardPanel';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/InputControls';
import { ShieldAlert, Check, X, FileText } from 'lucide-react';

export default function AdminDisputesPage() {
  const disputes = [
    {
      id: 'DSP-2026-0842',
      orderId: 'ORD-99812',
      buyer: 'Reliance Fresh Retail',
      seller: 'Ramesh Patil (Ganesh Farm)',
      reason: 'Weight Variance (180 kg moisture scale difference)',
      escrowLocked: '₹1,30,000',
      status: 'under_review',
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Dispute Resolution Desk"
        subtitle="Review APMC weighbridge slips, NABL assay reports, and arbitrate escrow claims."
        badge="Admin Desk"
      />

      <CardPanel title="Active Arbitration Queue">
        <div className="space-y-4">
          {disputes.map((d) => (
            <div key={d.id} className="p-4 bg-[#F6F4ED] border border-[#E7E5DC] rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#1B4D3E]">{d.id}</span>
                  <h3 className="font-bold text-sm text-[#19201D]">{d.reason}</h3>
                  <StatusBadge status={d.status} />
                </div>
                <p className="text-xs text-gray-500">
                  Buyer: {d.buyer} • Seller: {d.seller} • Escrow: <span className="font-bold text-[#19201D]">{d.escrowLocked}</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button size="sm" variant="secondary">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Assay Evidence</span>
                </Button>
                <Button size="sm">
                  <Check className="w-3.5 h-3.5" />
                  <span>Approve Settlement</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardPanel>
    </div>
  );
}
