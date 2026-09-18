'use client';

import React from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/PageHeader';
import { CardPanel } from '@/components/ui/CardPanel';
import { Button } from '@/components/ui/InputControls';
import { Printer, Download, ShieldCheck, Sprout } from 'lucide-react';

export default function PaymentReceiptPage({ params }: { params: { orderId: string } }) {
  const receipt = {
    receiptNo: 'RCP-2026-99812',
    orderId: params.orderId || 'ORD-99812',
    date: '2026-09-15',
    sellerName: 'Ramesh Patil (Shree Ganesh Krishi Farm)',
    sellerGst: '27AABCU9912K1ZD',
    buyerName: 'Reliance Fresh Retail Procurement',
    commodity: 'Red Onion Grade A (5,000 kg @ ₹26/kg)',
    subtotal: 130000,
    mandiCess: 1300,
    escrowFee: 1300,
    netPayable: 127400,
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader
        title="Official Commercial Sale Voucher & Receipt"
        subtitle={`Receipt #${receipt.receiptNo} • Tax-Ready Commercial Invoice`}
        action={
          <Button variant="secondary" size="sm" onClick={() => window.print()}>
            <Printer className="w-4 h-4" />
            <span>Print Receipt</span>
          </Button>
        }
      />

      <CardPanel className="space-y-6 border-2 border-[#19201D]">
        <div className="flex items-center justify-between border-b border-[#E7E5DC] pb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#1B4D3E] text-amber-300 rounded-xl">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-[#19201D]">AgriMark Mandi Receipt</h2>
              <p className="text-xs text-gray-500">Bharat Agricultural Escrow OS</p>
            </div>
          </div>

          <div className="text-right">
            <p className="font-mono font-bold text-xs text-[#1B4D3E]">{receipt.receiptNo}</p>
            <p className="text-xs text-gray-500">Date: {receipt.date}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-[#F6F4ED] rounded-xl space-y-1">
            <span className="text-gray-500 font-bold block">PRODUCER / SELLER</span>
            <p className="font-bold text-[#19201D]">{receipt.sellerName}</p>
            <p className="text-gray-500">GSTIN: {receipt.sellerGst}</p>
          </div>

          <div className="p-3 bg-[#F6F4ED] rounded-xl space-y-1">
            <span className="text-gray-500 font-bold block">BUYER / INSTITUTION</span>
            <p className="font-bold text-[#19201D]">{receipt.buyerName}</p>
            <p className="text-gray-500">APMC License Verified</p>
          </div>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between py-2 border-b border-[#E7E5DC]">
            <span className="font-bold text-[#19201D]">{receipt.commodity}</span>
            <span className="font-mono font-bold">₹{receipt.subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>APMC Mandi Cess (1%):</span>
            <span className="font-mono">₹{receipt.mandiCess.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>Bharat Escrow Processing (1%):</span>
            <span className="font-mono">₹{receipt.escrowFee.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-baseline pt-2 border-t border-[#19201D]">
            <span className="font-extrabold text-sm text-[#19201D]">Net Settled Payment:</span>
            <span className="font-mono font-extrabold text-xl text-[#1B4D3E]">
              ₹{receipt.netPayable.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-xl flex items-center justify-center gap-1.5 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <span>Digitally Signed & Verified by Bharat Mandi Settlement Engine</span>
        </div>
      </CardPanel>
    </div>
  );
}
