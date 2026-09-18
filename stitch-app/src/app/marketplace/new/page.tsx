'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { CardPanel } from '@/components/ui/CardPanel';
import { Input, Select, Button } from '@/components/ui/InputControls';
import { Tag, Check, TrendingUp } from 'lucide-react';

export default function CreateListingPage({ params }: { params?: { lotId?: string } }) {
  const router = useRouter();
  const [cropName, setCropName] = useState('Red Onion (Bhima Super)');
  const [quantityKg, setQuantityKg] = useState('10000');
  const [pricePerKg, setPricePerKg] = useState('26');
  const [mandiRefPrice, setMandiRefPrice] = useState('24.5');
  const [district, setDistrict] = useState('Nashik');
  const [state, setState] = useState('Maharashtra');
  const [grade, setGrade] = useState('Grade A');
  const [description, setDescription] = useState('NABL Quality Assayed Grade A Nashik Red Onion. Well-cured with 11.5% moisture content.');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      router.push('/marketplace');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader
        title="Create Mandi Marketplace Listing"
        subtitle="Publish produce lot for direct bidding by verified institutional buyers."
      />

      <CardPanel>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Commodity / Crop Name"
            value={cropName}
            onChange={(e) => setCropName(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Listing Quantity (kg)"
              type="number"
              value={quantityKg}
              onChange={(e) => setQuantityKg(e.target.value)}
              required
            />
            <Select
              label="Quality Grade"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              options={[
                { label: 'Grade A (Export / Super)', value: 'Grade A' },
                { label: 'Grade B (Standard Mandi)', value: 'Grade B' },
                { label: 'Grade C (Local Yard)', value: 'Grade C' },
              ]}
            />
          </div>

          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-[#1B4D3E]">
              <span className="flex items-center gap-1.5"><TrendingUp className="w-4 h-4" /> Observed Mandi Benchmark Rate</span>
              <span className="font-mono text-sm font-extrabold">₹{mandiRefPrice} / kg (₹2,450 / Qtl)</span>
            </div>
            <Input
              label="Your Asking Price (₹ per kg)"
              type="number"
              step="0.5"
              value={pricePerKg}
              onChange={(e) => setPricePerKg(e.target.value)}
              required
              helperText={`Total Listing Value: ₹${(parseFloat(quantityKg || '0') * parseFloat(pricePerKg || '0')).toLocaleString()}`}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="District Yard"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              options={[
                { label: 'Nashik', value: 'Nashik' },
                { label: 'Ahmednagar', value: 'Ahmednagar' },
                { label: 'Pune', value: 'Pune' },
                { label: 'Solapur', value: 'Solapur' },
              ]}
            />
            <Select
              label="State"
              value={state}
              onChange={(e) => setState(e.target.value)}
              options={[
                { label: 'Maharashtra', value: 'Maharashtra' },
                { label: 'Gujarat', value: 'Gujarat' },
                { label: 'Karnataka', value: 'Karnataka' },
              ]}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#19201D] uppercase">Lot Description & Specifications</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 bg-white border border-[#E7E5DC] focus:border-[#1B4D3E] rounded-xl text-sm outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#E7E5DC]">
            <Button type="button" variant="secondary" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading}>
              <Tag className="w-4 h-4" />
              <span>Publish Mandi Listing</span>
            </Button>
          </div>
        </form>
      </CardPanel>
    </div>
  );
}
