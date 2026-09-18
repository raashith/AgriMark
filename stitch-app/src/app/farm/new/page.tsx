'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { CardPanel } from '@/components/ui/CardPanel';
import { Input, Select, Button } from '@/components/ui/InputControls';
import { Sprout, MapPin, Map, Check } from 'lucide-react';

export default function AddFarmPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [acreage, setAcreage] = useState('');
  const [district, setDistrict] = useState('Nashik');
  const [state, setState] = useState('Maharashtra');
  const [locationAddress, setLocationAddress] = useState('');
  const [rorNumber, setRorNumber] = useState('');
  const [soilType, setSoilType] = useState('Medium Deep Black Regur');
  const [soilPh, setSoilPh] = useState('7.2');
  const [organicCarbon, setOrganicCarbon] = useState('0.65');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      router.push('/farm');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        title="Add Farm & Land Survey"
        subtitle="Register a new cadastral parcel with 7/12 RoR extract, soil test pH, and GIS boundary."
      />

      <CardPanel>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#19201D] border-b border-[#F6F4ED] pb-2 uppercase tracking-wide">
              1. Basic Farm Identification
            </h3>
            <Input
              label="Farm Name / Alias"
              placeholder="e.g. Mahavir Krishi Vigyan Farm"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Total Acreage (Acres)"
                type="number"
                step="0.1"
                placeholder="5.0"
                value={acreage}
                onChange={(e) => setAcreage(e.target.value)}
                required
              />
              <Input
                label="RoR / 7-12 Extract Number"
                placeholder="e.g. 712/88A"
                value={rorNumber}
                onChange={(e) => setRorNumber(e.target.value)}
              />
            </div>
            <Input
              label="Village / Taluka Address"
              placeholder="Pimpalgaon Baswant, Niphad"
              value={locationAddress}
              onChange={(e) => setLocationAddress(e.target.value)}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="District"
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
                  { label: 'Tamil Nadu', value: 'Tamil Nadu' },
                ]}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#19201D] border-b border-[#F6F4ED] pb-2 uppercase tracking-wide">
              2. Agronomic & Soil Health
            </h3>
            <Select
              label="Soil Classification"
              value={soilType}
              onChange={(e) => setSoilType(e.target.value)}
              options={[
                { label: 'Medium Deep Black Regur', value: 'Medium Deep Black Regur' },
                { label: 'Red Alluvial Loam', value: 'Red Alluvial Loam' },
                { label: 'Laterite Black Soil', value: 'Laterite Black' },
                { label: 'Sandy Loam Drip Fertigated', value: 'Sandy Loam' },
              ]}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Soil pH"
                type="number"
                step="0.1"
                placeholder="7.2"
                value={soilPh}
                onChange={(e) => setSoilPh(e.target.value)}
              />
              <Input
                label="Organic Carbon (%)"
                type="number"
                step="0.01"
                placeholder="0.65"
                value={organicCarbon}
                onChange={(e) => setOrganicCarbon(e.target.value)}
              />
            </div>
          </div>

          <div className="p-4 bg-[#F6F4ED] border border-[#E7E5DC] rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Map className="w-6 h-6 text-[#1B4D3E]" />
              <div>
                <p className="text-xs font-bold text-[#19201D]">GIS Cadastral Boundary Picker</p>
                <p className="text-[11px] text-gray-500">Tap to record GPS vertices or upload GeoJSON polygon</p>
              </div>
            </div>
            <Button type="button" variant="outline" size="sm">
              Draw Boundary
            </Button>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#E7E5DC]">
            <Button type="button" variant="secondary" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading}>
              <Check className="w-4 h-4" />
              <span>Save & Register Parcel</span>
            </Button>
          </div>
        </form>
      </CardPanel>
    </div>
  );
}
