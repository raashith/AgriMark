'use client';

import React from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/PageHeader';
import { CardPanel } from '@/components/ui/CardPanel';
import { Button } from '@/components/ui/InputControls';
import { CheckCircle2, ShieldCheck, ArrowRight, Download, FileText } from 'lucide-react';

export default function EscrowDisbursedPage({ params }: { params: { caseId: string } }) {
  const settlement = {
    caseId: params.caseId || 'DSP-2026-0842',
    orderId: 'ORD-99812',
    grossAmount: '₹1,30,000',
    fee: '₹1,300',
    netPayout: '₹1,28,700',
    beneficiary: 'Ramesh Patil (Ganesh Farm HDFC Bank A/c xx4412)',
    rtgsRef: 'RTGS-HDFC-20260915-9921',
    disbursedAt: '2026-09-15 16:45 IST',
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <PageHeader
        title="Escrow Disbursal Confirmation"
        subtitle={`Case #${settlement.caseId} • Direct Bank RTGS Transfer`}
      />

      <CardPanel className="text-center space-y-6">
        <div className="p-4 bg-emerald-100 text-[#1B4D3E] rounded-full w-16 h-16 mx-auto flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-1">
          <h2 className="text-2xl font-extrabold text-[#19201D]">{settlement.netPayout}</h2>
          <p className="text-xs font-bold text-emerald-800">Net Escrow Payment Disbursed</p>
        </div>

        <div className="p-4 bg-[#F6F4ED] rounded-xl text-xs text-left space-y-2 border border-[#E7E5DC]">
          <div className="flex justify-between">
            <span className="text-gray-500">BENEFICIARY ACCOUNT</span>
            <span className="font-bold text-[#19201D]">{settlement.beneficiary}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">RTGS UTR REFERENCE</span>
            <span className="font-mono font-bold text-[#1B4D3E]">{settlement.rtgsRef}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">DISBURSED TIMESTAMP</span>
            <span className="font-mono font-bold text-gray-700">{settlement.disbursedAt}</span>
          </div>
        </div>

        <div className="flex gap-3">
          <Link href={`/finance/receipt/${settlement.orderId}`} className="w-1/2">
            <Button variant="secondary" size="md" className="w-full">
              <FileText className="w-4 h-4" />
              <span>Tax Voucher</span>
            </Button>
          </Link>
          <Link href="/finance" className="w-1/2">
            <Button size="md" className="w-full">
              <span>View Khaata</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </CardPanel>
    </div>
  );
}
