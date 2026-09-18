'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { CardPanel } from '@/components/ui/CardPanel';
import { Input, Select, Button } from '@/components/ui/InputControls';
import { FileUpload } from '@/components/ui/FileUpload';
import { ShieldAlert, Check } from 'lucide-react';

export default function DisputePage({ params }: { params: { orderId: string } }) {
  const router = useRouter();
  const [reason, setReason] = useState('weight_variance');
  const [description, setDescription] = useState('Weighbridge scale at Bhiwandi yard recorded 4,820 kg vs 5,000 kg on dispatch gate pass (3.6% moisture variance).');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      router.push('/admin/disputes');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader
        title="Dispute Resolution & Arbitrator Desk"
        subtitle={`Order #${params.orderId} • Mandi Conciliation Timeline`}
      />

      <CardPanel>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-1 text-xs text-amber-900">
            <div className="font-bold flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-700" /> Escrow Disbursal Paused
            </div>
            <p>Submitting a dispute locks escrow funds until Mandi Arbitrator desk verifies weight & quality assay evidence.</p>
          </div>

          <Select
            label="Dispute Reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            options={[
              { label: 'Weight Variance (>2% Scale Deviation)', value: 'weight_variance' },
              { label: 'Moisture / Quality Grade Mismatch', value: 'quality_mismatch' },
              { label: 'Transit Temperature Violation (Cold Chain Break)', value: 'temp_violation' },
              { label: 'Damaged Packaging / Rotting', value: 'damaged_produce' },
            ]}
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#19201D] uppercase">Detailed Explanation & Assay Claim</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 bg-white border border-[#E7E5DC] focus:border-[#1B4D3E] rounded-xl text-sm outline-none"
              required
            />
          </div>

          <FileUpload label="Upload Weighbridge Slip / NABL Assay Evidence" value={evidenceUrl} onChange={setEvidenceUrl} />

          <div className="flex justify-end gap-3 pt-4 border-t border-[#E7E5DC]">
            <Button type="button" variant="secondary" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" variant="danger" isLoading={isLoading}>
              <Check className="w-4 h-4" />
              <span>Submit Dispute Claim</span>
            </Button>
          </div>
        </form>
      </CardPanel>
    </div>
  );
}
