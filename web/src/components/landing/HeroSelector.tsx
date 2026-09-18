'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Sprout, ShoppingCart, Truck, CheckCircle2, ArrowUpRight } from 'lucide-react';

export type EcosystemMode = 'FARMER' | 'MARKET' | 'LOGISTICS';

interface HeroSelectorProps {
  onModeChange?: (mode: EcosystemMode) => void;
}

export const HeroSelector: React.FC<HeroSelectorProps> = ({ onModeChange }) => {
  const [mode, setMode] = useState<EcosystemMode>('FARMER');

  const handleSelect = (selected: EcosystemMode) => {
    setMode(selected);
    onModeChange?.(selected);
  };

  const modeData = {
    FARMER: {
      tag: 'SOVEREIGN FARMING',
      title: 'Know Your Lot Value Before Harvest',
      copy: 'Empowering Indian farmers with real-time mandi prices, field disease diagnostics, and direct buyer contracts.',
      stats: [
        { label: 'Fair Price Guarantee', val: 'Direct Mandi' },
        { label: 'Assay Quality', val: 'Grade A Verification' },
      ],
      image: '/images/landing/farmer_hero.png',
      alt: 'Indian Farmer in Green Fields',
      icon: Sprout,
    },
    MARKET: {
      tag: 'INSTITUTIONAL TRADE',
      title: 'Source Direct from Verified Produce Lots',
      copy: 'Connect wholesale buyers, processors, and FPOs with transparent quality scores and automated escrow settlement.',
      stats: [
        { label: 'Lot Transparency', val: '100% Traceable' },
        { label: 'Trade Escrow', val: 'Instant Release' },
      ],
      image: '/images/landing/market_hero.png',
      alt: 'Live Agricultural Produce Marketplace',
      icon: ShoppingCart,
    },
    LOGISTICS: {
      tag: 'COLD CHAIN & REEFER',
      title: 'GPS-Tracked Farm-to-Port Delivery',
      copy: 'Smart dispatch routing with real-time reefer temperature monitoring, dock gate passes, and instant driver payouts.',
      stats: [
        { label: 'Reefer Monitoring', val: 'Live GPS Temp' },
        { label: 'Transit Loss', val: '<0.5% Target' },
      ],
      image: '/images/landing/logistics_hero.png',
      alt: 'Cold Chain Reefer Logistics GPS',
      icon: Truck,
    },
  };

  const current = modeData[mode];

  return (
    <div className="w-full space-y-6">
      {/* Selector Tabs */}
      <div className="flex items-center justify-center p-1.5 bg-[#0a0f0d]/90 border border-[#1e2d26] rounded-2xl max-w-md mx-auto backdrop-blur-md shadow-2xl">
        {(['FARMER', 'MARKET', 'LOGISTICS'] as EcosystemMode[]).map((m) => {
          const isActive = mode === m;
          const IconComp = modeData[m].icon;
          return (
            <button
              key={m}
              onClick={() => handleSelect(m)}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all duration-300 flex items-center justify-center gap-2 ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-950/60 scale-[1.02]'
                  : 'text-gray-400 hover:text-white hover:bg-[#121a16]'
              }`}
            >
              <IconComp className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-emerald-500/70'}`} />
              <span>{m}</span>
            </button>
          );
        })}
      </div>

      {/* Dynamic Content Display */}
      <div className="relative bg-[#121a16]/90 border border-[#1e2d26] rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl overflow-hidden transition-all duration-500">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Left Text Detail */}
          <div className="md:col-span-7 space-y-3.5 text-left animate-in fade-in slide-in-from-left-4 duration-300">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-950/80 border border-emerald-800/60 rounded-full text-[10px] font-mono font-bold text-emerald-400 tracking-wider">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              {current.tag}
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">
              {current.title}
            </h3>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              {current.copy}
            </p>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              {current.stats.map((s, idx) => (
                <div key={idx} className="p-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl space-y-0.5">
                  <span className="text-[10px] font-mono text-gray-400 uppercase block">{s.label}</span>
                  <span className="text-xs sm:text-sm font-extrabold text-emerald-300 font-mono block">{s.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Image Visual */}
          <div className="md:col-span-5 relative h-48 sm:h-56 rounded-2xl overflow-hidden border border-[#1e2d26] shadow-lg group">
            <Image
              src={current.image}
              alt={current.alt}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f0d] via-transparent to-transparent opacity-80" />
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-mono font-bold text-white bg-[#0a0f0d]/80 px-3 py-1.5 rounded-xl border border-[#1e2d26] backdrop-blur-md">
              <span>{current.tag}</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
