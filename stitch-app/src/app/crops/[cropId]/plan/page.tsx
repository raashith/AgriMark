'use client';

import React from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/PageHeader';
import { CardPanel } from '@/components/ui/CardPanel';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/InputControls';
import { Calendar, Sprout, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function CropPlanPage({ params }: { params: { cropId: string } }) {
  const cropPlan = {
    cropName: 'Red Onion (Bhima Super)',
    farmName: 'Shree Ganesh Krishi Farm',
    acreage: 2.5,
    sowingDate: '2026-07-10',
    expectedHarvestDate: '2026-10-15',
    currentStageIndex: 2,
    stages: [
      { name: 'Nursery & Land Preparation', duration: 'Day 1 - 20', status: 'completed' },
      { name: 'Transplanting & Root Establishment', duration: 'Day 21 - 40', status: 'completed' },
      { name: 'Bulb Swelling & Vegetative Growth', duration: 'Day 41 - 85', status: 'active' },
      { name: 'Bulb Maturation & Neck Fall', duration: 'Day 86 - 105', status: 'planned' },
      { name: 'Harvesting, Curing & Grading', duration: 'Day 106 - 115', status: 'planned' },
    ],
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Crop Plan & Phenology Calendar: ${cropPlan.cropName}`}
        subtitle={`${cropPlan.farmName} • ${cropPlan.acreage} Acres • Expected Harvest: ${cropPlan.expectedHarvestDate}`}
        action={
          <Link href={`/crops/${params.cropId}/timeline`}>
            <Button size="md">
              <span>View Timeline & Labour Ledger</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        }
      />

      <CardPanel title="Agronomic Phenology Arc & Stage Checklist">
        <div className="space-y-4">
          {cropPlan.stages.map((stg, i) => (
            <div
              key={i}
              className={`p-4 rounded-xl border flex items-center justify-between gap-4 transition ${
                stg.status === 'active'
                  ? 'bg-emerald-50 border-[#1B4D3E] ring-2 ring-[#1B4D3E]/20'
                  : stg.status === 'completed'
                  ? 'bg-[#F6F4ED] border-[#E7E5DC]'
                  : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                    stg.status === 'completed'
                      ? 'bg-[#1B4D3E] text-amber-300'
                      : stg.status === 'active'
                      ? 'bg-[#D97706] text-white animate-pulse'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {stg.status === 'completed' ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#19201D]">{stg.name}</h4>
                  <p className="text-xs text-gray-500">{stg.duration}</p>
                </div>
              </div>
              <StatusBadge status={stg.status} />
            </div>
          ))}
        </div>
      </CardPanel>
    </div>
  );
}
