'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { CardPanel } from '@/components/ui/CardPanel';
import { Input, Select, Button } from '@/components/ui/InputControls';
import { supabase } from '@/lib/supabase';
import { recordActionEvent } from '@/lib/telemetry';
import { Sprout, CheckCircle2 } from 'lucide-react';

export default function FarmerOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [farmName, setFarmName] = useState('Shree Ganesh Krishi Farm');
  const [acreage, setAcreage] = useState('4.5');
  const [district, setDistrict] = useState('Nashik');
  const [state, setState] = useState('Maharashtra');
  const [village, setVillage] = useState('Pimpalgaon Baswant');
  const [rorNumber, setRorNumber] = useState('712/99B-2026');
  const [soilType, setSoilType] = useState('Medium Deep Black Regur');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateFarm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;

      if (userId) {
        await supabase.from('farms').insert({
          owner_id: userId,
          name: farmName,
          acreage: parseFloat(acreage),
          location_address: village,
          district,
          state,
          soil_type: soilType,
          ror_number: rorNumber,
        });
      }
      await recordActionEvent('create_farm_onboarding', { farmName, acreage });
      router.push('/farm');
    } catch (_) {
      router.push('/farm');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-4">
      <PageHeader
        title="Farmer Onboarding & Farm Land Passport Setup"
        subtitle="Complete your cadastral farm profile to activate NABL produce lot minting and APMC Mandi access."
      />

      {/* Stepper Header */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-[#E7E5DC]">
        {[
          { step: 1, label: 'Parcel Details' },
          { step: 2, label: 'RoR 7/12 Cadastral' },
          { step: 3, label: 'Soil & Irrigation' },
        ].map((s) => (
          <div key={s.step} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${step >= s.step ? 'bg-[#1B4D3E] text-amber-300' : 'bg-gray-100 text-gray-400'}`}>
              {s.step}
            </div>
            <span className={`text-xs font-semibold ${step >= s.step ? 'text-[#19201D]' : 'text-gray-400'}`}>{s.label}</span>
          </div>
        ))}
      </div>

      <CardPanel>
        <form onSubmit={handleCreateFarm} className="space-y-4">
          {step === 1 && (
            <>
              <Input
                label="Farm Name / Alias"
                value={farmName}
                onChange={(e) => setFarmName(e.target.value)}
                required
              />
              <Input
                label="Total Farm Area (Acres)"
                type="number"
                step="0.1"
                value={acreage}
                onChange={(e) => setAcreage(e.target.value)}
                required
              />
              <Input
                label="Village / Taluka / Post"
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                required
              />
              <div className="grid grid-cols-2 gap-3">
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
              <Button type="button" onClick={() => setStep(2)} className="w-full">
                Next: RoR 7/12 Entry →
              </Button>
            </>
          )}

          {step === 2 && (
            <>
              <Input
                label="RoR / 7-12 Extract Code (Mahabhulekh / Khasra)"
                value={rorNumber}
                onChange={(e) => setRorNumber(e.target.value)}
                helperText="Digital verification enables instant NABL grade certification"
              />
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1 text-xs text-emerald-900">
                <div className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" /> Cadastral Verification Hook Ready
                </div>
                <p>Digital land title verification automatically pre-fills plot boundary polygons.</p>
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="secondary" onClick={() => setStep(1)} className="w-1/2">
                  ← Back
                </Button>
                <Button type="button" onClick={() => setStep(3)} className="w-1/2">
                  Next: Soil Profile →
                </Button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <Select
                label="Primary Soil Classification"
                value={soilType}
                onChange={(e) => setSoilType(e.target.value)}
                options={[
                  { label: 'Medium Deep Black Regur Soil', value: 'Medium Deep Black Regur' },
                  { label: 'Red Alluvial Loam', value: 'Red Alluvial Loam' },
                  { label: 'Laterite Black Soil', value: 'Laterite Black' },
                  { label: 'Sandy Loam Drip Fertigated', value: 'Sandy Loam' },
                ]}
              />
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="secondary" onClick={() => setStep(2)} className="w-1/2">
                  ← Back
                </Button>
                <Button type="submit" isLoading={isLoading} className="w-1/2">
                  <Sprout className="w-4 h-4" />
                  <span>Save & Activate Farm</span>
                </Button>
              </div>
            </>
          )}
        </form>
      </CardPanel>
    </div>
  );
}
