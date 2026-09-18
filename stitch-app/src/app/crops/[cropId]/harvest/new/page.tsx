'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { CardPanel } from '@/components/ui/CardPanel';
import { Input, Select, Button } from '@/components/ui/InputControls';
import { PackageCheck, Check } from 'lucide-react';

export default function RecordHarvestPage({ params }: { params: { cropId: string } }) {
  const router = useRouter();
  const [totalKg, setTotalKg] = useState('18500');
  const [gradeAKg, setGradeAKg] = useState('12000');
  const [gradeBKg, setGradeBKg] = useState('5000');
  const [gradeCKg, setGradeCKg] = useState('1500');
  const [moisturePct, setMoisturePct] = useState('11.5');
  const [curingHours, setCuringHours] = useState('48');
  const [lotCode, setLotCode] = useState('LOT-N-884-2026');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      router.push('/inventory');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader
        title="Record Harvest & Sorting Tally"
        subtitle="Mint a NABL traceable produce lot with Grade A/B/C sorting metrics."
      />

      <CardPanel>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Harvest Lot Identification Code"
            value={lotCode}
            onChange={(e) => setLotCode(e.target.value)}
            required
            helperText="Unique lot identifier generated for QR tag minting"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Total Gross Harvest (kg)"
              type="number"
              value={totalKg}
              onChange={(e) => setTotalKg(e.target.value)}
              required
            />
            <Input
              label="Moisture Content (%)"
              type="number"
              step="0.1"
              value={moisturePct}
              onChange={(e) => setMoisturePct(e.target.value)}
            />
          </div>

          <div className="p-4 bg-[#F6F4ED] border border-[#E7E5DC] rounded-xl space-y-3">
            <h4 className="text-xs font-bold text-[#19201D] uppercase">Grade Sorting Breakdown (kg)</h4>
            <div className="grid grid-cols-3 gap-3">
              <Input
                label="Grade A (Premium)"
                type="number"
                value={gradeAKg}
                onChange={(e) => setGradeAKg(e.target.value)}
              />
              <Input
                label="Grade B (Standard)"
                type="number"
                value={gradeBKg}
                onChange={(e) => setGradeBKg(e.target.value)}
              />
              <Input
                label="Grade C (Local)"
                type="number"
                value={gradeCKg}
                onChange={(e) => setGradeCKg(e.target.value)}
              />
            </div>
          </div>

          <Input
            label="Field Curing / Drying Hours Tally"
            type="number"
            value={curingHours}
            onChange={(e) => setCuringHours(e.target.value)}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-[#E7E5DC]">
            <Button type="button" variant="secondary" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading}>
              <PackageCheck className="w-4 h-4" />
              <span>Mint Produce Lot & Sync Inventory</span>
            </Button>
          </div>
        </form>
      </CardPanel>
    </div>
  );
}
