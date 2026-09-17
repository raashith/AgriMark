'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { CardPanel } from '@/components/ui/CardPanel';
import { Input, Select, Button } from '@/components/ui/InputControls';
import { FileUpload } from '@/components/ui/FileUpload';
import { AlertTriangle, Check, Camera, Mic } from 'lucide-react';

export default function FieldScoutingPage({ params }: { params: { cropId: string } }) {
  const router = useRouter();
  const [observationType, setObservationType] = useState('pest');
  const [severity, setSeverity] = useState('medium');
  const [notes, setNotes] = useState('Observed mild thrips infestation on lower leaf canopy.');
  const [photoUrl, setPhotoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      router.push(`/crops/${params.cropId}/timeline`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader
        title="Field Scouting & Pest Observation"
        subtitle="Capture photo evidence, pest symptoms, audio notes, and AI diagnosis."
      />

      <CardPanel>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Observation Category"
            value={observationType}
            onChange={(e) => setObservationType(e.target.value)}
            options={[
              { label: 'Pest Infestation (Thrips, Bollworm, Caterpillars)', value: 'pest' },
              { label: 'Fungal / Bacterial Disease (Purple Blotch, Mildew)', value: 'disease' },
              { label: 'Nutrient Deficiency (Yellowing, Nitrogen / Zinc)', value: 'nutrient' },
              { label: 'Irrigation Stress (Wilting, Moisture Deficit)', value: 'irrigation' },
            ]}
          />

          <Select
            label="Severity Rating"
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            options={[
              { label: 'Low (Spot Infestation <5%)', value: 'low' },
              { label: 'Medium (Noticeable Spread 5-20%)', value: 'medium' },
              { label: 'High (Severe Damage 20-50%)', value: 'high' },
              { label: 'Critical (Outbreak >50%)', value: 'critical' },
            ]}
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#19201D] uppercase">Scouting Field Notes</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 bg-white border border-[#E7E5DC] focus:border-[#1B4D3E] rounded-xl text-sm outline-none"
            />
          </div>

          <FileUpload label="Field Photo Evidence" value={photoUrl} onChange={setPhotoUrl} />

          <div className="p-4 bg-[#F6F4ED] border border-[#E7E5DC] rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Mic className="w-4 h-4 text-[#1B4D3E]" />
              <span className="font-bold text-[#19201D]">Record Audio Field Note</span>
            </div>
            <Button type="button" variant="outline" size="sm">
              Start Mic
            </Button>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#E7E5DC]">
            <Button type="button" variant="secondary" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading}>
              <Check className="w-4 h-4" />
              <span>Submit Scouting Log</span>
            </Button>
          </div>
        </form>
      </CardPanel>
    </div>
  );
}
