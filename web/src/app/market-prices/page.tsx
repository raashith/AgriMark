'use client';

import React, { useState, useEffect } from 'react';
import { MarketPriceObservation } from '@/types';
import { dataService } from '@/lib/data-service';
import { TrendingUp, MapPin, Calendar, ShieldCheck, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function MarketPricesPage() {
  const [prices, setPrices] = useState<MarketPriceObservation[]>([]);

  useEffect(() => {
    dataService.getMarketPrices().then(setPrices);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#121a16] border border-[#1e2d26] p-6 md:p-8 rounded-3xl space-y-2 shadow-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-950/80 border border-emerald-800/60 rounded-full text-xs font-mono font-bold text-emerald-400">
          <TrendingUp className="w-4 h-4 text-purple-400" /> Mandi Intelligence & Price Signals
        </div>
        <h1 className="text-2xl md:text-4xl font-extrabold text-white">
          Real-Time Mandi Commodity Prices
        </h1>
        <p className="text-sm text-gray-300 max-w-xl">
          Verified daily observation records across major agricultural mandis in India. Transparent price signals with zero guesswork.
        </p>
      </div>

      {/* Mandi Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {prices.map((p) => (
          <div key={p.id} className="bg-[#121a16] border border-[#1e2d26] rounded-3xl p-6 space-y-4 shadow-lg flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-extrabold text-lg text-white">{p.commodity}</h3>
                  <p className="text-xs text-emerald-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5" /> {p.mandi_name}
                  </p>
                </div>
                <span className="px-2.5 py-1 bg-purple-950 text-purple-300 border border-purple-800 text-[10px] font-mono font-bold rounded-full">
                  {p.state}
                </span>
              </div>

              {/* Price Breakdown */}
              <div className="p-4 bg-[#0a0f0d] border border-[#1e2d26] rounded-2xl space-y-2">
                <span className="text-[10px] uppercase font-mono text-gray-400">Modal Trading Price</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-emerald-400">₹{p.modal_price?.toLocaleString('en-IN')}</span>
                  <span className="text-xs text-gray-400 font-mono">/ {p.unit}</span>
                </div>

                <div className="flex justify-between text-xs text-gray-400 pt-2 border-t border-[#1e2d26]">
                  <span>Min: ₹{p.min_price?.toLocaleString('en-IN')}</span>
                  <span>Max: ₹{p.max_price?.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-gray-500 font-mono pt-2 border-t border-[#1e2d26]">
              <span>Source: {p.source}</span>
              <span>Observed: {p.observation_date}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
