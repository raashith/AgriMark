'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { CardPanel } from '@/components/ui/CardPanel';
import { Input, Select, Button } from '@/components/ui/InputControls';
import { ShieldCheck, Truck, Check } from 'lucide-react';

export default function CheckoutPage({ params }: { params: { listingId: string } }) {
  const router = useRouter();
  const [quantityKg, setQuantityKg] = useState('2000');
  const pricePerKg = 26;
  const [deliveryAddress, setDeliveryAddress] = useState('Bhiwandi Cold Chain Terminal Bay #2, Mumbai, MH');
  const [logisticsType, setLogisticsType] = useState('reefer');
  const [isLoading, setIsLoading] = useState(false);

  const totalAmount = parseFloat(quantityKg || '0') * pricePerKg;
  const escrowFee = totalAmount * 0.01;

  const handleConfirmOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      router.push('/buyer/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader
        title="Checkout & Escrow Order Placement"
        subtitle={`Listing #${params.listingId} • Bharat Mandi Escrow Lock`}
      />

      <CardPanel>
        <form onSubmit={handleConfirmOrder} className="space-y-4">
          <Input
            label="Order Quantity (kg)"
            type="number"
            value={quantityKg}
            onChange={(e) => setQuantityKg(e.target.value)}
            required
            helperText={`Available lot stock: 10,000 kg`}
          />

          <Input
            label="Destination Address / Discharge Yard"
            value={deliveryAddress}
            onChange={(e) => setDeliveryAddress(e.target.value)}
            required
          />

          <Select
            label="Logistics & Cold Chain Option"
            value={logisticsType}
            onChange={(e) => setLogisticsType(e.target.value)}
            options={[
              { label: 'Reefer Cold Chain Container (+4°C Sensor)', value: 'reefer' },
              { label: 'Standard Tarpaulin Trucking', value: 'standard' },
              { label: 'Buyer Self-Pickup at Farm Yard', value: 'self_pickup' },
            ]}
          />

          <div className="p-4 bg-[#F6F4ED] border border-[#E7E5DC] rounded-xl space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500">Produce Subtotal ({quantityKg} kg @ ₹{pricePerKg}/kg):</span>
              <span className="font-mono font-bold text-[#19201D]">₹{totalAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Bharat Escrow Protection Fee (1%):</span>
              <span className="font-mono font-bold">₹{escrowFee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-baseline pt-2 border-t border-[#E7E5DC]">
              <span className="font-bold text-sm text-[#19201D]">Total Escrow Lock:</span>
              <span className="font-mono font-extrabold text-lg text-[#1B4D3E]">
                ₹{(totalAmount + escrowFee).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-xl flex items-center gap-2 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-700 flex-shrink-0" />
            <span>Funds are locked safely in Escrow until quality & weight verification at discharge bay.</span>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#E7E5DC]">
            <Button type="button" variant="secondary" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" variant="accent" isLoading={isLoading}>
              <Check className="w-4 h-4" />
              <span>Confirm & Lock Escrow</span>
            </Button>
          </div>
        </form>
      </CardPanel>
    </div>
  );
}
