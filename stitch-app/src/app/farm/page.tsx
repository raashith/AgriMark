'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/PageHeader';
import { CardPanel } from '@/components/ui/CardPanel';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/InputControls';
import { recordScreenView } from '@/lib/telemetry';
import { Sprout, MapPin, Plus, FileCheck, Layers, ArrowRight } from 'lucide-react';

export default function MyFarmPage() {
  const [farms, setFarms] = useState([
    {
      id: 'farm-001',
      name: 'Shree Ganesh Krishi Farm',
      acreage: 4.5,
      district: 'Nashik',
      state: 'Maharashtra',
      location: 'Pimpalgaon Baswant',
      ror_number: '712/99B-2026',
      soil_type: 'Medium Deep Black Regur',
      cropsCount: 2,
    },
    {
      id: 'farm-002',
      name: 'Maheshwari Organic Orchard',
      acreage: 2.0,
      district: 'Solapur',
      state: 'Maharashtra',
      location: 'Mohol',
      ror_number: 'Khasra #441',
      soil_type: 'Sandy Loam Drip Fertigated',
      cropsCount: 1,
    },
  ]);

  useEffect(() => {
    void recordScreenView('crop_passport');
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Farm & Land Passport"
        subtitle="Manage cadastral farm parcels, active crop passports, soil health metrics, and ROR land extracts."
        action={
          <Link href="/farm/new">
            <Button size="md">
              <Plus className="w-4 h-4" />
              <span>Add New Farm Parcel</span>
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {farms.map((f) => (
          <CardPanel key={f.id} className="hover:border-[#1B4D3E]/40 transition space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-[#19201D]">{f.name}</h2>
                  <StatusBadge status="Verified 7/12" />
                </div>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#1B4D3E]" /> {f.location}, {f.district}, {f.state}
                </p>
              </div>
              <div className="p-2.5 bg-[#F6F4ED] rounded-xl text-[#1B4D3E]">
                <Sprout className="w-6 h-6" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 py-2 bg-[#F6F4ED]/60 rounded-xl p-3 text-xs">
              <div>
                <span className="text-gray-500 block text-[10px]">TOTAL AREA</span>
                <span className="font-extrabold font-mono text-[#19201D]">{f.acreage} Acres</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[10px]">ROR EXTRACT</span>
                <span className="font-bold text-[#1B4D3E]">{f.ror_number}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[10px]">ACTIVE CROPS</span>
                <span className="font-extrabold text-amber-700">{f.cropsCount} Crops</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#F6F4ED]">
              <span className="text-xs text-gray-500">{f.soil_type}</span>
              <Link href={`/farm/${f.id}`} className="text-xs font-bold text-[#1B4D3E] hover:underline flex items-center gap-1">
                <span>Inspect Passport</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </CardPanel>
        ))}
      </div>
    </div>
  );
}
