'use client';

import React, { useState } from 'react';
import {
  Sprout,
  Users,
  Store,
  Building2,
  Truck,
  Wallet,
  Bot,
  Database,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';

export const EcosystemSection: React.FC = () => {
  const [selectedPillar, setSelectedPillar] = useState<number>(0);

  const pillars = [
    {
      icon: Sprout,
      name: 'Farmers',
      role: 'Production & Soil Passports',
      desc: 'Plot boundaries, 7/12 land passports, crop scouting, and direct produce lot creation.',
    },
    {
      icon: Users,
      name: 'FPOs & Cooperatives',
      role: 'Aggregation & Bulk Trade',
      desc: 'Collective harvest pooling, input bulk buying, and FPO export marketing.',
    },
    {
      icon: Store,
      name: 'Wholesale Buyers',
      role: 'Direct Procurement',
      desc: 'Institutional buyers, retail chains, and exporters bidding on verified NABL lots.',
    },
    {
      icon: Building2,
      name: 'APMC Mandi Markets',
      role: 'Price Benchmark',
      desc: 'Transparent 3-tier price comparison between APMC modal rates and direct farm ask.',
    },
    {
      icon: Truck,
      name: 'Cold Logistics',
      role: 'Reefer Telemetry',
      desc: 'Automated cold-chain transport booking, temperature monitoring, and arrival dispatch.',
    },
    {
      icon: Wallet,
      name: 'Finance & Escrow',
      role: 'Instant Settlement',
      desc: 'Bank escrow payment locks, NABARD-compliant credit scoring, and instant payouts.',
    },
    {
      icon: Bot,
      name: 'AgriAI Advisory',
      role: 'Intelligence Layer',
      desc: '24/7 multilingual crop diagnosis, weather predictions, and price foresight.',
    },
    {
      icon: Database,
      name: 'Unified Data OS',
      role: 'Telemetry Backbone',
      desc: 'Satellite NDVI, soil sensors, NABL lab certificates, and immutable transaction ledgers.',
    },
  ];

  return (
    <section className="py-24 bg-[#F7F5EE] text-[#19201D] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#1B4D3E]/10 border border-[#1B4D3E]/20 rounded-full text-xs font-mono font-bold text-[#1B4D3E] uppercase">
            <ShieldCheck className="w-4 h-4 text-[#E5A93C]" /> CONNECTED BHARAT ARCHITECTURE
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[#19201D]">
            One connected agricultural operating system.
          </h2>
          <p className="text-base text-gray-600 leading-relaxed font-normal">
            Bridging every stakeholder in agricultural commerce through real-time telemetry, automated trade execution, and bank-grade trust.
          </p>
        </div>

        {/* Connected Grid Diagram */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
          {pillars.map((pillar, idx) => {
            const PillarIcon = pillar.icon;
            const isSelected = selectedPillar === idx;
            return (
              <div
                key={idx}
                onClick={() => setSelectedPillar(idx)}
                className={`cursor-pointer bg-white border rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 space-y-4 flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#1B4D3E] ring-2 ring-[#1B4D3E]/20 shadow-md bg-emerald-50/20'
                    : 'border-[#E7E5DC] hover:border-[#1B4D3E]/50'
                }`}
              >
                <div className="space-y-3">
                  <div
                    className={`p-3 rounded-2xl w-fit transition ${
                      isSelected ? 'bg-[#1B4D3E] text-[#E5A93C]' : 'bg-[#F6F4ED] text-[#1B4D3E]'
                    }`}
                  >
                    <PillarIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-[#19201D]">{pillar.name}</h3>
                    <p className="text-[11px] font-mono text-[#1B4D3E] font-semibold mt-0.5">{pillar.role}</p>
                  </div>
                </div>

                <p className="text-xs text-gray-600 leading-relaxed font-normal">{pillar.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
