'use client';

import React from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/PageHeader';
import { CardPanel } from '@/components/ui/CardPanel';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/InputControls';
import { QrCode, ShieldCheck, Download, Printer } from 'lucide-react';

export default function DockGatePassPage({ params }: { params: { orderId: string } }) {
  const gatePass = {
    orderId: params.orderId || 'ORD-99812',
    passCode: 'GP-BHIWANDI-0915',
    bayNumber: 'Bay #2 (Cold Storage Terminal)',
    vehicleNo: 'MH-15-EG-4412',
    driverName: 'Santosh Shinde',
    commodity: 'Red Onion Grade A (5,000 kg)',
    validUntil: '2026-09-15 20:00',
    status: 'active',
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <PageHeader
        title="Dock Gate Pass & Unloading QR"
        subtitle={`Present at terminal security gate for automatic weighbridge scanning.`}
        action={
          <Button variant="secondary" size="sm" onClick={() => window.print()}>
            <Printer className="w-4 h-4" />
            <span>Print Pass</span>
          </Button>
        }
      />

      <CardPanel className="text-center space-y-6">
        <div className="space-y-1">
          <span className="text-xs font-mono font-bold text-[#1B4D3E] uppercase">BHARAT MANDI GATE PASS</span>
          <h2 className="text-xl font-extrabold text-[#19201D]">{gatePass.bayNumber}</h2>
          <p className="text-xs text-gray-500">Pass Code: <span className="font-mono font-bold text-[#19201D]">{gatePass.passCode}</span></p>
        </div>

        {/* High-Contrast QR Code Visual */}
        <div className="p-6 bg-white border-2 border-[#19201D] rounded-2xl w-56 h-56 mx-auto flex flex-col items-center justify-center space-y-2 shadow-md">
          <QrCode className="w-36 h-36 text-[#19201D]" />
          <span className="text-[10px] font-mono font-bold text-gray-600">{gatePass.passCode}</span>
        </div>

        <div className="grid grid-cols-2 gap-3 p-4 bg-[#F6F4ED] rounded-xl text-xs text-left">
          <div>
            <span className="text-gray-500 block">COMMODITY & WEIGHT</span>
            <span className="font-bold text-[#19201D]">{gatePass.commodity}</span>
          </div>
          <div>
            <span className="text-gray-500 block">VEHICLE & DRIVER</span>
            <span className="font-bold text-[#19201D]">{gatePass.vehicleNo} • {gatePass.driverName}</span>
          </div>
          <div>
            <span className="text-gray-500 block">ORDER REF</span>
            <span className="font-mono font-bold text-[#1B4D3E]">{gatePass.orderId}</span>
          </div>
          <div>
            <span className="text-gray-[#19201D] font-bold block">VALID UNTIL</span>
            <span className="font-mono font-bold text-amber-700">{gatePass.validUntil}</span>
          </div>
        </div>

        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-xl flex items-center justify-center gap-1.5 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <span>Security & Weighbridge Check-in Verified</span>
        </div>
      </CardPanel>
    </div>
  );
}
