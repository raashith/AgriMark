'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { CardPanel } from '@/components/ui/CardPanel';
import { Input, Select, Button } from '@/components/ui/InputControls';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Plus, Users, Check } from 'lucide-react';

export default function BuyerRFQPage() {
  const [showNewModal, setShowNewModal] = useState(false);
  const [cropName, setCropName] = useState('Grade A Red Onion');
  const [targetQty, setTargetQty] = useState('25000');
  const [targetPrice, setTargetPrice] = useState('25');
  const [district, setDistrict] = useState('Nashik');
  const [deadline, setDeadline] = useState('2026-10-01');

  const rfqs = [
    {
      id: 'RFQ-2026-091',
      crop: 'Grade A Red Onion',
      quantityKg: 25000,
      targetPrice: '₹25 / kg',
      district: 'Nashik',
      deadline: '2026-10-01',
      bidsCount: 4,
      status: 'open',
    },
    {
      id: 'RFQ-2026-042',
      crop: 'Organic Bhagwa Pomegranate',
      quantityKg: 10000,
      targetPrice: '₹82 / kg',
      district: 'Solapur',
      deadline: '2026-09-25',
      bidsCount: 2,
      status: 'open',
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Buyer RFQ Procurement Desk"
        subtitle="Issue targeted Requests For Quotation to verified farmers and FPOs."
        action={
          <Button size="md" onClick={() => setShowNewModal(true)}>
            <Plus className="w-4 h-4" />
            <span>Issue New RFQ</span>
          </Button>
        }
      />

      <CardPanel title="Active Open Procurement RFQs">
        <div className="space-y-4">
          {rfqs.map((rfq) => (
            <div key={rfq.id} className="p-4 bg-[#F6F4ED] border border-[#E7E5DC] rounded-xl flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#1B4D3E]">{rfq.id}</span>
                  <h3 className="font-bold text-sm text-[#19201D]">{rfq.crop}</h3>
                  <StatusBadge status={rfq.status} />
                </div>
                <p className="text-xs text-gray-500">
                  Target: {rfq.quantityKg.toLocaleString()} kg @ {rfq.targetPrice} • Preferred Yard: {rfq.district} • Deadline: {rfq.deadline}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold bg-emerald-100 text-emerald-900 px-3 py-1 rounded-full">
                  {rfq.bidsCount} Farmer Bids
                </span>
                <Button size="sm">View Bids</Button>
              </div>
            </div>
          ))}
        </div>
      </CardPanel>

      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full space-y-4">
            <h3 className="text-lg font-bold text-[#19201D]">Create New Procurement RFQ</h3>
            <Input label="Commodity / Requirement" value={cropName} onChange={(e) => setCropName(e.target.value)} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Target Quantity (kg)" type="number" value={targetQty} onChange={(e) => setTargetQty(e.target.value)} />
              <Input label="Target Price (₹/kg)" type="number" value={targetPrice} onChange={(e) => setTargetPrice(e.target.value)} />
            </div>
            <Input label="Preferred District" value={district} onChange={(e) => setDistrict(e.target.value)} />
            <Input label="Delivery Deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setShowNewModal(false)}>Cancel</Button>
              <Button onClick={() => setShowNewModal(false)}><Check className="w-4 h-4" /> Publish RFQ</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
