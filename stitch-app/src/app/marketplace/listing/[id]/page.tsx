'use client';

import React from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/PageHeader';
import { CardPanel } from '@/components/ui/CardPanel';
import { MetricCard } from '@/components/ui/MetricCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/InputControls';
import { ShieldCheck, MapPin, Package, ShoppingCart, ArrowRight, Award, FileText } from 'lucide-react';

export default function ListingDetailsPage({ params }: { params: { id: string } }) {
  const listing = {
    id: params.id || 'LST-9921',
    crop: 'Red Onion (Bhima Super)',
    quantityKg: 10000,
    pricePerKg: 26,
    mandiRefPrice: 24.5,
    grade: 'Grade A',
    seller: 'Ramesh Patil',
    farmName: 'Shree Ganesh Krishi Farm',
    district: 'Nashik',
    state: 'Maharashtra',
    trustScore: 98,
    moisturePct: 11.5,
    curingHours: 48,
    rorNumber: '712/99B-2026',
    assayTag: 'NABL-NSK-2026-9921',
    description: 'NABL Certified Grade A Red Onion lot. Harvested on 2026-09-01 from Shree Ganesh Krishi Farm. Cured for 48 hours with 11.5% moisture content. Free of sprouting or fungal damage.',
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${listing.crop} (${listing.grade})`}
        subtitle={`Listing #${listing.id} • Sourced from ${listing.farmName}, ${listing.district}, ${listing.state}`}
        badge="NABL Assayed"
        action={
          <Link href={`/checkout/${listing.id}`}>
            <Button size="lg" variant="accent">
              <ShoppingCart className="w-5 h-5" />
              <span>Proceed to Escrow Checkout</span>
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard title="Asking Price" value={`₹${listing.pricePerKg} / kg`} subtitle={`Mandi Ref: ₹${listing.mandiRefPrice}`} icon={<ShoppingCart className="w-5 h-5" />} />
        <MetricCard title="Available Quantity" value={`${listing.quantityKg.toLocaleString()} kg`} subtitle="Minimum Order: 500 kg" icon={<Package className="w-5 h-5" />} />
        <MetricCard title="Moisture & Curing" value={`${listing.moisturePct}%`} subtitle={`${listing.curingHours} Hours Sun Cured`} icon={<FileText className="w-5 h-5" />} />
        <MetricCard title="Farmer Trust Score" value={`${listing.trustScore}%`} subtitle="100% On-Time Fulfillment" icon={<Award className="w-5 h-5" />} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <CardPanel title="Lot Specifications & Quality Passport">
            <div className="space-y-4 text-xs text-[#19201D]">
              <p className="text-sm leading-relaxed text-gray-700">{listing.description}</p>

              <div className="grid grid-cols-2 gap-3 p-4 bg-[#F6F4ED] rounded-xl border border-[#E7E5DC]">
                <div>
                  <span className="text-gray-500 block">NABL LAB ASSAY TAG</span>
                  <span className="font-mono font-bold text-[#1B4D3E] text-sm">{listing.assayTag}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">CADASTRAL 7/12 ROR</span>
                  <span className="font-bold text-[#19201D] text-sm">{listing.rorNumber}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">VARIETY / CULTIVAR</span>
                  <span className="font-bold text-[#19201D]">Bhima Super Red</span>
                </div>
                <div>
                  <span className="text-gray-500 block">BULB SIZE DISTRIBUTION</span>
                  <span className="font-bold text-[#19201D]">55mm - 70mm (Uniform)</span>
                </div>
              </div>
            </div>
          </CardPanel>
        </div>

        <div className="space-y-6">
          <CardPanel title="Bharat Mandi Escrow Guarantee">
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" /> 100% Payment Protected
                </div>
                <p>Funds are held in Bharat Mandi Escrow until cold-chain delivery & weight verification at receiving bay.</p>
              </div>

              <div className="pt-2">
                <Link href={`/checkout/${listing.id}`}>
                  <Button size="md" className="w-full">
                    <span>Buy Now / Create Escrow</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </CardPanel>
        </div>
      </div>
    </div>
  );
}
