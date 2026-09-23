'use client';

import React from 'react';

export const TraceabilityScene: React.FC = () => {
  return (
    <section id="scene-traceability" className="scene-target py-28 relative border-t border-white/10 reveal-section">
      <div className="max-w-5xl mx-auto px-4 sm:px-8">
        <div className="text-center space-y-3 mb-16">
          <div className="inline-block px-3 py-1 rounded-full holo-glass-subtle text-[11px] font-mono tracking-widest text-teal-400 uppercase">
            04 // Verifiable Provenance Journey
          </div>
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-white">Every lot has a story.</h2>
          <p className="text-base text-[#F7F5EE]/75 max-w-xl mx-auto">
            Cryptographically hashed provenance linking organic certifications, cold chain telemetry, and farmer payouts to a single scan.
          </p>
        </div>

        {/* Vertical Connected Timeline Journey */}
        <div className="relative border-l-2 border-[#E5A93C]/40 ml-4 sm:ml-28 space-y-9 pb-4">
          {/* Node 1: SEED */}
          <div className="relative pl-8 sm:pl-10 group">
            <div className="absolute -left-[9px] top-2 w-4 h-4 rounded-full bg-[#04100B] border-2 border-[#E5A93C] group-hover:scale-125 transition-transform shadow-sm shadow-[#E5A93C]" />
            <div className="holo-glass rounded-2xl p-4 sm:p-5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group-hover:border-[#E5A93C]/50 transition-all">
              <div>
                <span className="text-[9px] font-mono text-[#E5A93C] uppercase tracking-wider font-bold">
                  NODE 01 • SEED GENETICS
                </span>
                <h4 className="font-display font-bold text-white text-base mt-0.5">Certified Non-GMO Seed Stock</h4>
                <p className="text-xs text-[#9BC7A2]">
                  Breeder: Indian Agricultural Research Institute (IARI) • Batch #SN-902-IND
                </p>
              </div>
              <span className="text-xs font-mono text-white/50 self-start sm:self-center">IARI LAB SEALED</span>
            </div>
          </div>

          {/* Node 2: FARM */}
          <div className="relative pl-8 sm:pl-10 group">
            <div className="absolute -left-[9px] top-2 w-4 h-4 rounded-full bg-[#04100B] border-2 border-emerald-400 group-hover:scale-125 transition-transform shadow-sm shadow-emerald-400" />
            <div className="holo-glass rounded-2xl p-4 sm:p-5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group-hover:border-emerald-400/50 transition-all">
              <div>
                <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-wider font-bold">
                  NODE 02 • FARM CULTIVATION
                </span>
                <h4 className="font-display font-bold text-white text-base mt-0.5">Organic Bio-Enriched Soil</h4>
                <p className="text-xs text-[#9BC7A2]">
                  Farmer: Ramesh Patil (Farm ID: #AGRI-842) • Nashik Agricultural Cluster
                </p>
              </div>
              <span className="text-xs font-mono text-emerald-400 self-start sm:self-center">
                ZERO CHEMICAL RESIDUE: PASS
              </span>
            </div>
          </div>

          {/* Node 3: HARVEST */}
          <div className="relative pl-8 sm:pl-10 group">
            <div className="absolute -left-[9px] top-2 w-4 h-4 rounded-full bg-[#04100B] border-2 border-[#FCE196] group-hover:scale-125 transition-transform shadow-sm shadow-[#FCE196]" />
            <div className="holo-glass rounded-2xl p-4 sm:p-5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group-hover:border-[#FCE196]/50 transition-all">
              <div>
                <span className="text-[9px] font-mono text-[#FCE196] uppercase tracking-wider font-bold">
                  NODE 03 • PRECISION HARVEST
                </span>
                <h4 className="font-display font-bold text-white text-base mt-0.5">
                  Precision Hand Plucked at Peak Sugar
                </h4>
                <p className="text-xs text-[#9BC7A2]">
                  Refractometer Brix Level: 6.8 • Harvested 05:30 AM before radiant heat spike
                </p>
              </div>
              <span className="text-xs font-mono text-white/50 self-start sm:self-center">TIMESTAMP: 05:30 AM</span>
            </div>
          </div>

          {/* Node 4: QUALITY */}
          <div className="relative pl-8 sm:pl-10 group">
            <div className="absolute -left-[9px] top-2 w-4 h-4 rounded-full bg-[#04100B] border-2 border-teal-400 group-hover:scale-125 transition-transform shadow-sm shadow-teal-400" />
            <div className="holo-glass rounded-2xl p-4 sm:p-5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group-hover:border-teal-400/50 transition-all">
              <div>
                <span className="text-[9px] font-mono text-teal-300 uppercase tracking-wider font-bold">
                  NODE 04 • AI OPTICAL QUALITY SORTING
                </span>
                <h4 className="font-display font-bold text-white text-base mt-0.5">
                  Computer Vision Grade A Export Standard
                </h4>
                <p className="text-xs text-[#9BC7A2]">
                  Color Uniformity: 98% • Surface Blemish Index: 0.2% • Size Sorting: 65mm-75mm
                </p>
              </div>
              <span className="text-xs font-mono text-teal-300 font-bold self-start sm:self-center">
                APEDA GRADE A
              </span>
            </div>
          </div>

          {/* Node 5: PRODUCE LOT */}
          <div className="relative pl-8 sm:pl-10 group">
            <div className="absolute -left-[9px] top-2 w-4 h-4 rounded-full bg-[#04100B] border-2 border-[#E5A93C] group-hover:scale-125 transition-transform shadow-sm shadow-[#E5A93C]" />
            <div className="holo-glass rounded-2xl p-4 sm:p-5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group-hover:border-[#E5A93C]/50 transition-all">
              <div>
                <span className="text-[9px] font-mono text-[#E5A93C] uppercase tracking-wider font-bold">
                  NODE 05 • CRYPTOGRAPHIC HASH SEAL
                </span>
                <h4 className="font-display font-bold text-white text-base mt-0.5">Cryptographic Produce Lot Hash</h4>
                <p className="text-xs font-mono text-[#9BC7A2]">HASH: #AGRI-8429-MH-2026-X091 • QR Geo-Lock Verified</p>
              </div>
              <span className="text-xs font-mono text-[#FCE196] self-start sm:self-center">IMMUTABLE BLOCK</span>
            </div>
          </div>

          {/* Node 6: COLD CHAIN */}
          <div className="relative pl-8 sm:pl-10 group">
            <div className="absolute -left-[9px] top-2 w-4 h-4 rounded-full bg-[#04100B] border-2 border-teal-400 group-hover:scale-125 transition-transform shadow-sm shadow-teal-400" />
            <div className="holo-glass rounded-2xl p-4 sm:p-5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group-hover:border-teal-400/50 transition-all">
              <div>
                <span className="text-[9px] font-mono text-teal-300 uppercase tracking-wider font-bold">
                  NODE 06 • REEFER TELEMETRY
                </span>
                <h4 className="font-display font-bold text-white text-base mt-0.5">
                  Reefer Truck GPS &amp; Continuous Temp Audit
                </h4>
                <p className="text-xs text-[#9BC7A2]">
                  Internal Pod Temp: 4.2°C Continuous • Vehicle: #MH-15-EG-4402 • Speed: 62 km/h
                </p>
              </div>
              <span className="text-xs font-mono text-emerald-400 self-start sm:self-center">
                SEAL #4982-LOCKED
              </span>
            </div>
          </div>

          {/* Node 7: ESCROW SETTLEMENT */}
          <div className="relative pl-8 sm:pl-10 group">
            <div className="absolute -left-[9px] top-2 w-4 h-4 rounded-full bg-[#E5A93C] group-hover:scale-125 transition-transform shadow-md shadow-[#E5A93C]" />
            <div className="holo-glass rounded-2xl p-4 sm:p-5 border border-[#E5A93C]/40 bg-[#1B4D3E]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group-hover:border-[#E5A93C] transition-all">
              <div>
                <span className="text-[9px] font-mono text-[#FCE196] uppercase tracking-wider font-bold">
                  NODE 07 • SMART ESCROW SETTLEMENT
                </span>
                <h4 className="font-display font-bold text-white text-base mt-0.5">
                  Direct UPI/IMPS Bank Transfer Clearance
                </h4>
                <p className="text-xs text-[#9BC7A2]">
                  Buyer: BigBasket Regional Sourcing Hub • Zero Middlemen Commission
                </p>
              </div>
              <span className="font-mono text-xs font-bold text-[#FCE196] bg-[#07110D] px-3 py-1.5 rounded-xl border border-[#E5A93C]/40 self-start sm:self-center">
                INSTANT ₹ 3,42,000 SETTLED
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
