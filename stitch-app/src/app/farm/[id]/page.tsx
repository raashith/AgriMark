'use client';

import React from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/PageHeader';
import { CardPanel } from '@/components/ui/CardPanel';
import { MetricCard } from '@/components/ui/MetricCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/InputControls';
import { Sprout, MapPin, Plus, ArrowRight, Layers, FileCheck, Droplets } from 'lucide-react';

export default function FarmDetailsPage({ params }: { params: { id: string } }) {
  const farm = {
    id: params.id || 'farm-001',
    name: 'Shree Ganesh Krishi Farm',
    acreage: 4.5,
    location: 'Pimpalgaon Baswant',
    district: 'Nashik',
    state: 'Maharashtra',
    ror_number: '712/99B-2026',
    soil_type: 'Medium Deep Black Regur',
    soil_ph: 7.2,
    organic_carbon: 0.68,
    irrigation_source: 'Well + Drip Fertigation System',
    cultivations: [
      {
        id: 'crop-001',
        name: 'Red Onion (Bhima Super)',
        area: 2.5,
        sowing_date: '2026-07-10',
        expected_harvest: '2026-10-15',
        status: 'growing',
        stage: 'Bulb Swelling (Day 62)',
      },
      {
        id: 'crop-002',
        name: 'Bt Cotton (RCH-659)',
        area: 2.0,
        sowing_date: '2026-06-01',
        expected_harvest: '2026-11-20',
        status: 'flowering',
        stage: 'Boll Development (Day 85)',
      },
    ],
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={farm.name}
        subtitle={`${farm.location}, ${farm.district}, ${farm.state} • Cadastral Parcel #${farm.ror_number}`}
        badge="RoR 7/12 Verified"
        action={
          <Link href={`/farm/${farm.id}/crops/new`}>
            <Button size="md">
              <Plus className="w-4 h-4" />
              <span>Plant New Crop</span>
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard title="Total Parcel Area" value={`${farm.acreage} Acres`} subtitle="100% Irrigated" icon={<Sprout className="w-5 h-5" />} />
        <MetricCard title="Soil pH Rating" value={farm.soil_ph} subtitle="Slightly Alkaline (Ideal)" icon={<Layers className="w-5 h-5" />} />
        <MetricCard title="Organic Carbon" value={`${farm.organic_carbon}%`} subtitle="Good Microbial Activity" icon={<FileCheck className="w-5 h-5" />} />
        <MetricCard title="Irrigation Method" value="Drip System" subtitle={farm.irrigation_source} icon={<Droplets className="w-5 h-5" />} />
      </div>

      <CardPanel
        title="Active Crop Passports & Cultivations"
        subtitle="Season Kharif 2026 plot allocation"
        action={
          <Link href={`/farm/${farm.id}/inputs`} className="text-xs font-bold text-[#1B4D3E] hover:underline">
            View Input Inventory →
          </Link>
        }
      >
        <div className="space-y-4">
          {farm.cultivations.map((c) => (
            <div key={c.id} className="p-4 bg-[#F6F4ED] border border-[#E7E5DC] rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-[#19201D]">{c.name}</h3>
                  <StatusBadge status={c.status} />
                </div>
                <p className="text-xs text-gray-600">
                  {c.area} Acres • Sown: {c.sowing_date} • Expected Harvest: {c.expected_harvest}
                </p>
                <p className="text-xs font-mono font-bold text-[#1B4D3E]">{c.stage}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link href={`/crops/${c.id}/timeline`}>
                  <Button variant="secondary" size="sm">Smart Timeline</Button>
                </Link>
                <Link href={`/crops/${c.id}/scout`}>
                  <Button variant="secondary" size="sm">Field Scouting</Button>
                </Link>
                <Link href={`/crops/${c.id}/harvest/new`}>
                  <Button size="sm">Record Harvest</Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </CardPanel>
    </div>
  );
}
