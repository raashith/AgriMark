'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/PageHeader';
import { CardPanel } from '@/components/ui/CardPanel';
import { MetricCard } from '@/components/ui/MetricCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button, Input, Select } from '@/components/ui/InputControls';
import { Wallet, Plus, FileSpreadsheet, Download, Check } from 'lucide-react';

export default function FarmKhaataPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [entryType, setEntryType] = useState<'income' | 'expense'>('income');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('produce_sale');

  const financeEntries = [
    {
      id: 'KHT-001',
      date: '2026-09-15',
      type: 'income',
      category: 'Produce Sale',
      amount: '+₹1,27,400',
      description: 'Disbursed Escrow Sale: Red Onion (5,000 kg @ ₹26/kg)',
      crop: 'Red Onion',
    },
    {
      id: 'KHT-002',
      date: '2026-09-14',
      type: 'expense',
      category: 'Labor',
      amount: '-₹1,250',
      description: 'Labour Voucher: Foliar Spray Spraying Lead Baban',
      crop: 'Red Onion',
    },
    {
      id: 'KHT-003',
      date: '2026-08-15',
      type: 'expense',
      category: 'Input Purchase',
      amount: '-₹3,500',
      description: 'IFFCO NPK 19:19:19 50kg Purchase',
      crop: 'General Farm',
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Farm Khaata & Crop Profitability Ledger"
        subtitle="Track plot-by-plot ROI, cashflow, inputs vs. produce revenue, and NABARD/KCC export."
        action={
          <div className="flex gap-2">
            <Button variant="secondary" size="md" onClick={() => window.print()}>
              <Download className="w-4 h-4" />
              <span>Export KCC Statement</span>
            </Button>
            <Button size="md" onClick={() => setShowAddModal(true)}>
              <Plus className="w-4 h-4" />
              <span>New Khaata Entry</span>
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard title="Season Gross Income" value="₹3,20,000" subtitle="Produce Sales" icon={<Wallet className="w-5 h-5" />} />
        <MetricCard title="Total Farm Expenses" value="₹1,35,800" subtitle="Inputs + Labor + Transport" icon={<FileSpreadsheet className="w-5 h-5" />} />
        <MetricCard title="Net Season Profit (ROI)" value="₹1,84,200" subtitle="24% Return on Farm Capital" change="24% ROI" isPositive={true} icon={<Wallet className="w-5 h-5" />} />
      </div>

      <CardPanel title="Chronological Farm Cashflow Feed">
        <div className="space-y-3">
          {financeEntries.map((e) => (
            <div key={e.id} className="p-4 bg-[#F6F4ED] border border-[#E7E5DC] rounded-xl flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#1B4D3E]">{e.date}</span>
                  <StatusBadge status={e.category} />
                </div>
                <h4 className="font-bold text-sm text-[#19201D]">{e.description}</h4>
                <p className="text-xs text-gray-500">Crop Allocation: {e.crop}</p>
              </div>

              <div className="text-right">
                <p className={`font-mono font-extrabold text-sm ${e.type === 'income' ? 'text-emerald-700' : 'text-red-700'}`}>
                  {e.amount}
                </p>
                <span className="text-[10px] font-mono font-bold text-gray-400">{e.id}</span>
              </div>
            </div>
          ))}
        </div>
      </CardPanel>

      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full space-y-4">
            <h3 className="text-lg font-bold text-[#19201D]">Record Farm Khaata Entry</h3>
            <Select
              label="Entry Type"
              value={entryType}
              onChange={(e) => setEntryType(e.target.value as any)}
              options={[
                { label: 'Income (Produce Sale / Subsidy)', value: 'income' },
                { label: 'Expense (Inputs / Labor / Logistics)', value: 'expense' },
              ]}
            />
            <Input label="Amount (₹)" type="number" placeholder="2500" value={amount} onChange={(e) => setAmount(e.target.value)} required />
            <Input label="Description" placeholder="e.g. Daily Labor Wages" value={description} onChange={(e) => setDescription(e.target.value)} required />

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setShowAddModal(false)}>Cancel</Button>
              <Button onClick={() => setShowAddModal(false)}><Check className="w-4 h-4" /> Save Entry</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
