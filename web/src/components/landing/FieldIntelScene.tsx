'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export const FieldIntelScene: React.FC = () => {
  const [selectedParcel, setSelectedParcel] = useState<'krishna' | 'godavari' | 'malwa'>('krishna');

  const parcels = {
    krishna: {
      name: 'Krishna Valley Parcel #48A',
      ndvi: '0.84 (VIGOROUS)',
      chlorophyll: 'Chlorophyll Absorption: Peak Normal',
      canopy: '94%',
      moisture: '31.2% (OPTIMAL)',
      valves: 'AUTO-CYCLING',
      harvestWindow: 'NOV 14 - 17',
      probeNpks: '14:12:10',
      climateTemp: '27.4°C',
    },
    godavari: {
      name: 'Godavari Basin #12B',
      ndvi: '0.79 (HEALTHY)',
      chlorophyll: 'Chlorophyll Absorption: Steady',
      canopy: '88%',
      moisture: '29.8% (OPTIMAL)',
      valves: 'SCHEDULED 18:00',
      harvestWindow: 'DEC 02 - 05',
      probeNpks: '12:10:14',
      climateTemp: '26.1°C',
    },
    malwa: {
      name: 'Malwa Plateau #09C',
      ndvi: '0.91 (OPTIMAL)',
      chlorophyll: 'Chlorophyll Absorption: Maximum',
      canopy: '96%',
      moisture: '33.5% (HIGH)',
      valves: 'STANDBY',
      harvestWindow: 'NOV 28 - 30',
      probeNpks: '15:15:12',
      climateTemp: '25.8°C',
    },
  };

  const active = parcels[selectedParcel];

  return (
    <section id="scene-field" className="scene-target py-28 relative border-t border-white/10 reveal-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left: 3D Digital Farm Map with Parcel Zones */}
          <div className="lg:col-span-7 space-y-4">
            {/* Parcel Zone Selector */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => setSelectedParcel('krishna')}
                className={
                  selectedParcel === 'krishna'
                    ? 'px-3.5 py-1.5 rounded-lg bg-[#1B4D3E] border border-[#E5A93C]/50 text-xs font-mono font-bold text-[#FCE196] shadow-sm'
                    : 'px-3.5 py-1.5 rounded-lg holo-glass-subtle text-xs font-mono text-white/70 hover:text-white border border-white/10'
                }
              >
                Krishna Valley Parcel #48A
              </button>
              <button
                type="button"
                onClick={() => setSelectedParcel('godavari')}
                className={
                  selectedParcel === 'godavari'
                    ? 'px-3.5 py-1.5 rounded-lg bg-[#1B4D3E] border border-[#E5A93C]/50 text-xs font-mono font-bold text-[#FCE196] shadow-sm'
                    : 'px-3.5 py-1.5 rounded-lg holo-glass-subtle text-xs font-mono text-white/70 hover:text-white border border-white/10'
                }
              >
                Godavari Basin #12B
              </button>
              <button
                type="button"
                onClick={() => setSelectedParcel('malwa')}
                className={
                  selectedParcel === 'malwa'
                    ? 'px-3.5 py-1.5 rounded-lg bg-[#1B4D3E] border border-[#E5A93C]/50 text-xs font-mono font-bold text-[#FCE196] shadow-sm'
                    : 'px-3.5 py-1.5 rounded-lg holo-glass-subtle text-xs font-mono text-white/70 hover:text-white border border-white/10'
                }
              >
                Malwa Plateau #09C
              </button>
            </div>

            {/* Digital Field Twin Display */}
            <div className="holo-glass rounded-3xl p-6 sm:p-7 border border-[#3E7B54]/40 shadow-2xl relative overflow-hidden group">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-display font-bold text-white text-base">
                    {active.name.toUpperCase()} • SATELLITE MULTISPECTRAL TWIN
                  </span>
                </div>
                <span className="font-mono text-xs text-[#E5A93C] font-bold">NDVI: {active.ndvi}</span>
              </div>

              {/* Multispectral Simulation Canvas Frame */}
              <div className="relative h-72 sm:h-80 w-full rounded-2xl overflow-hidden border border-white/10 tech-dots bg-[#020b07] flex items-center justify-center">
                {/* Contour Topography Map Overlay */}
                <svg className="absolute inset-0 w-full h-full opacity-60" viewBox="0 0 500 300">
                  <path d="M20,240 Q150,180 280,210 T500,160" fill="none" stroke="#3E7B54" strokeDasharray="4 4" strokeWidth="1.5" />
                  <path d="M0,190 Q180,120 320,160 T500,110" fill="none" opacity="0.6" stroke="#2DD4BF" strokeWidth="1" />
                  <path d="M0,130 Q160,70 340,110 T500,60" fill="none" stroke="#E5A93C" strokeWidth="1.2" className="animated-pulse-line" />
                  <circle cx="160" cy="140" r="8" fill="rgba(45, 212, 191, 0.3)" stroke="#2DD4BF" strokeWidth="1.5" />
                  <circle cx="340" cy="120" r="8" fill="rgba(229, 169, 60, 0.3)" stroke="#E5A93C" strokeWidth="1.5" />
                  <circle cx="260" cy="200" r="8" fill="rgba(74, 222, 128, 0.3)" stroke="#4ade80" strokeWidth="1.5" />
                </svg>

                {/* Center Interactive NDVI Polygon */}
                <div className="relative z-10 text-center p-5 rounded-2xl holo-glass border border-emerald-400/30 max-w-sm">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-xs font-mono text-[#9BC7A2] uppercase">Vegetative Vigor Profile</span>
                  </div>
                  <div className="text-2xl font-display font-bold text-white">Canopy Density {active.canopy}</div>
                  <div className="text-xs font-mono text-emerald-300 mt-1">{active.chlorophyll}</div>
                </div>

                {/* Digital Crop Zones Bottom HUD */}
                <div className="absolute bottom-3 inset-x-3 grid grid-cols-3 gap-2">
                  <div className="holo-glass-subtle p-2 rounded-xl border border-white/10 text-left">
                    <div className="text-[9px] font-mono text-[#9BC7A2]">SOIL MOISTURE</div>
                    <div className="font-display font-bold text-xs text-white">{active.moisture}</div>
                  </div>
                  <div className="holo-glass-subtle p-2 rounded-xl border border-white/10 text-left">
                    <div className="text-[9px] font-mono text-[#9BC7A2]">VALVES</div>
                    <div className="font-display font-bold text-xs text-teal-300">{active.valves}</div>
                  </div>
                  <div className="holo-glass-subtle p-2 rounded-xl border border-white/10 text-left">
                    <div className="text-[9px] font-mono text-[#9BC7A2]">HARVEST WINDOW</div>
                    <div className="font-display font-bold text-[#FCE196]">{active.harvestWindow}</div>
                  </div>
                </div>
              </div>

              {/* Hoverable Sensor Probes Strip */}
              <div className="mt-4 pt-3 flex flex-wrap items-center justify-between gap-3 text-xs font-mono border-t border-white/10">
                <div className="flex items-center gap-2 text-white/80">
                  <span className="px-1.5 py-0.5 rounded bg-white/10 text-[#FCE196]">PROBE #04</span>
                  <span>
                    NPK Telemetry: <strong className="text-emerald-300">{active.probeNpks}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <span>
                    Micro-climate Canopy: <strong className="text-[#E5A93C]">{active.climateTemp}</strong>
                  </span>
                  <span className="text-teal-300">RH: 58%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Copy & Capabilities */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-block px-3 py-1 rounded-full holo-glass-subtle text-[11px] font-mono tracking-widest text-emerald-400 uppercase">
              02 // Precision Farm OS
            </div>
            <h2 className="font-display text-3xl sm:text-5xl font-bold text-white leading-tight">
              Know what is happening in every field.
            </h2>
            <p className="text-base text-[#F7F5EE]/75 leading-relaxed">
              Eliminate guesswork with hyper-local multispectral vegetative indices, IoT soil probes, and micro-climate crop modeling engineered specifically for smallholders and commercial farm enterprises.
            </p>
            <div className="space-y-3 font-sans text-sm text-[#F7F5EE]/90">
              <div className="p-3.5 rounded-xl holo-glass-subtle border border-white/10 flex items-start gap-3">
                <span className="text-[#E5A93C] font-bold text-base">✦</span>
                <div>
                  <strong className="text-white block font-display">Crop Zone Diagnostics</strong>
                  <span className="text-xs text-white/70">
                    Pinpoint nutrient deficiencies down to 10-meter grid squares using Sentinel-2 and drone thermal imagery.
                  </span>
                </div>
              </div>
              <div className="p-3.5 rounded-xl holo-glass-subtle border border-white/10 flex items-start gap-3">
                <span className="text-[#E5A93C] font-bold text-base">✦</span>
                <div>
                  <strong className="text-white block font-display">Autonomous Water Management</strong>
                  <span className="text-xs text-white/70">
                    Synchronize drip irrigation valves with real-time evapotranspiration algorithms to save 34% water.
                  </span>
                </div>
              </div>
              <div className="p-3.5 rounded-xl holo-glass-subtle border border-white/10 flex items-start gap-3">
                <span className="text-[#E5A93C] font-bold text-base">✦</span>
                <div>
                  <strong className="text-white block font-display">Yield Prediction Engine</strong>
                  <span className="text-xs text-white/70">
                    Calibrated against 10-year historical Mandi harvest outputs with 91.8% pre-harvest volume accuracy.
                  </span>
                </div>
              </div>
            </div>
            <div className="pt-2">
              <Link
                href="/farmer/dashboard"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-display font-bold text-sm bg-[#1B4D3E] hover:bg-[#23604e] text-[#FCE196] border border-[#E5A93C]/40 transition-all shadow-md"
              >
                OPEN FARM COMMAND
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
