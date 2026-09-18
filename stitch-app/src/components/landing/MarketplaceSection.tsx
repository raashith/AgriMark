'use client';

import React from 'react';
import Link from 'next/link';
import {
  Store,
  ShieldCheck,
  PackageCheck,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Lock,
  Tag,
  Truck,
} from 'lucide-react';

export const MarketplaceSection: React.FC = () => {
  const sampleLots = [
    {
      title: 'Nashik Red Onion (Bhima Super)',
      location: 'Niphad, Nashik, MH',
      quantity: '18,500 kg',
      grade: 'NABL Grade A',
      moisture: '12.2%',
      price: '₹2,600 / Qtl',
      mandiRef: '₹2,450 / Qtl',
      escrowStatus: 'Escrow Protected',
      farmer: 'Shree Ganesh Krishi Farm',
    },
    {
      title: 'Solapur Bhagwa Pomegranate',
      location: 'Sangola, Solapur, MH',
      quantity: '8,200 kg',
      grade: 'NABL Export Grade',
      moisture: '14.5%',
      price: '₹9,800 / Qtl',
      mandiRef: '₹9,200 / Qtl',
      escrowStatus: 'Escrow Protected',
      farmer: 'Maheshwari Farmers Producer Co',
    },
    {
      title: 'Sangli Rajapuri Turmeric',
      location: 'Shirala, Sangli, MH',
      quantity: '12,000 kg',
      grade: 'Curcumin 4.8%',
      moisture: '8.5%',
      price: '₹14,500 / Qtl',
      mandiRef: '₹13,800 / Qtl',
      escrowStatus: 'Escrow Protected',
      farmer: 'Sahyadri Agro FPO',
    },
  ];

  return (
    <section id="marketplace" className="py-24 bg-[#F7F5EE] text-[#19201D] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-16">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#1B4D3E]/10 border border-[#1B4D3E]/20 rounded-full text-xs font-mono font-bold text-[#1B4D3E] uppercase">
              <Store className="w-4 h-4 text-[#E5A93C]" /> DIRECT B2B MARKETPLACE
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[#19201D]">
              Move produce from farm to buyer.
            </h2>
            <p className="text-base text-gray-600 leading-relaxed font-normal">
              Direct producer listings with NABL quality assays, transparent 3-tier mandi pricing, automated purchase orders, and Bank Escrow payment security.
            </p>
          </div>

          <Link
            href="/marketplace"
            className="px-6 py-3.5 bg-[#1B4D3E] hover:bg-[#143B30] text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center gap-2 transition shrink-0 self-start md:self-auto"
          >
            <span>Explore Marketplace</span>
            <ArrowRight className="w-4 h-4 text-[#E5A93C]" />
          </Link>
        </div>

        {/* Live Verified Lots Preview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {sampleLots.map((lot, idx) => (
            <div
              key={idx}
              className="bg-white border border-[#E7E5DC] rounded-3xl p-6 shadow-md hover:shadow-xl hover:border-[#1B4D3E] transition-all duration-300 flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                {/* Header Tag */}
                <div className="flex items-center justify-between text-xs">
                  <span className="px-3 py-1 bg-[#1B4D3E]/10 text-[#1B4D3E] font-mono font-bold rounded-full border border-[#1B4D3E]/20">
                    {lot.grade}
                  </span>
                  <span className="flex items-center gap-1 text-emerald-800 font-bold font-mono text-[11px]">
                    <Lock className="w-3.5 h-3.5 text-[#E5A93C]" /> {lot.escrowStatus}
                  </span>
                </div>

                {/* Produce Title & Location */}
                <div>
                  <h3 className="text-lg font-extrabold text-[#19201D] leading-snug">{lot.title}</h3>
                  <p className="text-xs text-gray-500 mt-1 font-medium">{lot.location} • {lot.farmer}</p>
                </div>

                {/* Specs Box */}
                <div className="p-3.5 bg-[#F6F4ED] rounded-2xl border border-[#E7E5DC] grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] font-mono text-gray-500 uppercase">Available Quantity</span>
                    <p className="font-bold text-[#19201D] mt-0.5">{lot.quantity}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-gray-500 uppercase">Moisture Content</span>
                    <p className="font-bold text-[#1B4D3E] mt-0.5">{lot.moisture}</p>
                  </div>
                </div>

                {/* Pricing Box */}
                <div className="p-4 bg-gradient-to-r from-[#1B4D3E]/5 to-[#E5A93C]/10 border border-[#1B4D3E]/15 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-gray-500 uppercase font-semibold">Farmer Ask Price</span>
                    <p className="text-lg font-mono font-extrabold text-[#1B4D3E]">{lot.price}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-gray-500 uppercase font-semibold">APMC Reference</span>
                    <p className="text-xs font-mono font-bold text-gray-600">{lot.mandiRef}</p>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <Link
                href="/marketplace"
                className="w-full py-3 bg-[#19201D] hover:bg-[#1B4D3E] text-white font-bold text-xs rounded-xl transition text-center flex items-center justify-center gap-2 group"
              >
                <span>View Lot Details & Bid</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#E5A93C] group-hover:translate-x-1 transition" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
