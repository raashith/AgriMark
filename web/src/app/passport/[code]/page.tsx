'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { ShieldCheck, MapPin, Calendar, Award, Sprout, Layers, CheckCircle2, User } from 'lucide-react';

export default function PassportVerificationPage() {
  const { code } = useParams() as { code: string };

  const passport = {
    code: code || 'PASSPORT-TAMIL-TURMERIC-2026-001',
    farmer: 'Ramanathan K.',
    farm: 'Sundaram Organic Orchard',
    location: 'Orathanadu, Thanjavur, Tamil Nadu',
    coordinates: '10.6271° N, 79.2458° E',
    crop: 'Finger Turmeric (Curcumin > 4.5%)',
    variety: 'Erode Local Finger',
    sowingDate: '2025-06-01',
    harvestDate: '2026-02-12',
    qualityGrade: 'Grade A Organic',
    curcuminPct: '4.8%',
    moisturePct: '11.2%',
    soilType: 'Red Sandy Loam',
    irrigation: 'Drip Irrigation with Solar Pump',
    verificationStatus: '100% Verified AgriMark Provenance Chain',
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-6">
      <div className="bg-[#121a16] border border-emerald-800/60 p-6 md:p-8 rounded-3xl space-y-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#1e2d26] pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-950/80 border border-emerald-700 text-emerald-400 font-mono text-xs font-bold rounded-full mb-2">
              <ShieldCheck className="w-4 h-4" /> Official Produce Passport
            </div>
            <h1 className="text-2xl font-black text-white">{passport.crop}</h1>
            <p className="text-xs text-gray-400 font-mono mt-0.5">Trace Code: {passport.code}</p>
          </div>

          <span className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> Verified Authenticity
          </span>
        </div>

        {/* Provenance Timeline Steps */}
        <div className="space-y-4">
          <h3 className="font-bold text-sm text-gray-300 uppercase tracking-wider font-mono">
            Farm-to-Table Provenance Chain
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-[#0a0f0d] border border-[#1e2d26] rounded-2xl space-y-2">
              <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold flex items-center gap-1">
                <User className="w-3.5 h-3.5" /> 1. Farmer & Origin
              </span>
              <h4 className="font-bold text-white text-sm">{passport.farmer}</h4>
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-500" /> {passport.location}
              </p>
              <p className="text-[11px] text-gray-500 font-mono">GPS: {passport.coordinates}</p>
            </div>

            <div className="p-4 bg-[#0a0f0d] border border-[#1e2d26] rounded-2xl space-y-2">
              <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold flex items-center gap-1">
                <Sprout className="w-3.5 h-3.5" /> 2. Agronomy & Soil
              </span>
              <h4 className="font-bold text-white text-sm">Variety: {passport.variety}</h4>
              <p className="text-xs text-gray-400">Soil: {passport.soilType}</p>
              <p className="text-xs text-gray-400">Irrigation: {passport.irrigation}</p>
            </div>

            <div className="p-4 bg-[#0a0f0d] border border-[#1e2d26] rounded-2xl space-y-2">
              <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> 3. Cultivation Timeline
              </span>
              <p className="text-xs text-gray-300">Sown: <span className="font-bold text-white">{passport.sowingDate}</span></p>
              <p className="text-xs text-gray-300">Harvested: <span className="font-bold text-white">{passport.harvestDate}</span></p>
            </div>

            <div className="p-4 bg-[#0a0f0d] border border-[#1e2d26] rounded-2xl space-y-2">
              <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold flex items-center gap-1">
                <Award className="w-3.5 h-3.5" /> 4. Assaying Quality
              </span>
              <p className="text-xs text-emerald-300 font-bold">Grade: {passport.qualityGrade}</p>
              <p className="text-xs text-gray-400">Curcumin Content: {passport.curcuminPct}</p>
              <p className="text-xs text-gray-400">Moisture: {passport.moisturePct}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
