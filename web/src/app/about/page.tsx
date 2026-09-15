'use client';

import React from 'react';
import Link from 'next/link';
import { Sprout, ShieldCheck, TrendingUp, Users, Award, ArrowRight } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 py-6">
      <div className="bg-[#121a16] border border-[#1e2d26] p-8 md:p-12 rounded-3xl space-y-4 text-center md:text-left shadow-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-950/80 border border-emerald-800/60 rounded-full text-xs font-mono font-bold text-emerald-400">
          <Sprout className="w-4 h-4" /> About AgriMark
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight">
          Empowering Indian Agriculture Through Digital Sovereignty & Direct Trade
        </h1>
        <p className="text-base text-gray-300 max-w-3xl leading-relaxed">
          AgriMark is a national-scale agricultural intelligence, commerce, operations, and decision platform connecting farmers, buyers, FPOs, logistics providers, and research centers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-[#121a16] border border-[#1e2d26] rounded-3xl space-y-3">
          <ShieldCheck className="w-8 h-8 text-emerald-400" />
          <h3 className="font-bold text-lg text-white">Direct Marketplace</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Eliminating unnecessary middle layers. Farmers sell directly to retail chains, processors, and exporters.
          </p>
        </div>

        <div className="p-6 bg-[#121a16] border border-[#1e2d26] rounded-3xl space-y-3">
          <TrendingUp className="w-8 h-8 text-purple-400" />
          <h3 className="font-bold text-lg text-white">Price Transparency</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Daily verified Mandi observations from AGMARKNET and official spicing boards with AI decision signals.
          </p>
        </div>

        <div className="p-6 bg-[#121a16] border border-[#1e2d26] rounded-3xl space-y-3">
          <Award className="w-8 h-8 text-amber-400" />
          <h3 className="font-bold text-lg text-white">Digital Produce Passport</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Every harvest lot gets a QR produce passport tracing farm GPS coordinates, soil moisture, and quality grade.
          </p>
        </div>
      </div>
    </div>
  );
}
