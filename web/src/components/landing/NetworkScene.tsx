'use client';

import React from 'react';

export const NetworkScene: React.FC = () => {
  return (
    <section id="scene-network" className="scene-target py-28 relative border-t border-white/10 reveal-section overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 text-center">
        <div className="space-y-3 mb-16">
          <div className="inline-block px-3 py-1 rounded-full holo-glass-subtle text-[11px] font-mono tracking-widest text-[#E5A93C] uppercase">
            06 // Sovereign Network Architecture
          </div>
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-white">
            A unified ecosystem for all stakeholders.
          </h2>
          <p className="text-base text-[#F7F5EE]/75 max-w-2xl mx-auto">
            Every participant operates with dedicated workspace views powered by shared real-time truth.
          </p>
        </div>

        {/* 3D Stakeholder Orbit Visualizer Stage */}
        <div className="relative w-full max-w-4xl mx-auto h-[480px] flex items-center justify-center">
          {/* Concentric Orbital Conduits */}
          <div
            className="absolute w-[440px] h-[440px] rounded-full border border-white/10 border-dashed orbit-spin"
            style={{ animationDuration: '90s' }}
          />
          <div
            className="absolute w-[320px] h-[320px] rounded-full border border-[#E5A93C]/20 border-dashed orbit-counter"
            style={{ animationDuration: '60s' }}
          />
          <div className="absolute w-[200px] h-[200px] rounded-full border border-teal-400/20" />

          {/* Center Hub: AGRIMARK SOVEREIGN CORE */}
          <div className="relative z-20 w-32 h-32 rounded-3xl holo-glass border-2 border-[#E5A93C] flex flex-col items-center justify-center shadow-gold-glow p-2 text-center group cursor-pointer hover:scale-105 transition-transform">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-[#E5A93C] mb-1">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAXW6ySJ2LDB7N9l0P8TxVkH3nxOjyGF_0IbvBtOqYyOEKDLdv8gEq2_Xqbsc2SQ-BxDNd7AD9uhrJuLwDhAqOPMK1p7j-wa83JSXkND0hYjB1l9TrFRc-EAhKOSFRM_d4tRGR29KZQ6sRow0Xmxw_oVhBRff5p_9pW8548g-I4EOh9VIhCz0tSk3e_sTXLninwfCAni6nH1l-EZOJWVUV0K4fvLVotGJi1l1xlYerKmsjr7kI5NN5_Vu84CJ0jOLoCRQ"
                alt="Emblem"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="font-display font-bold text-xs text-white uppercase tracking-wider">AGRIMARK</span>
            <span className="text-[9px] font-mono text-[#FCE196]">Sovereign Core</span>
          </div>

          {/* Orbiting Node 1: FARMERS (Top) */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 holo-glass p-3.5 rounded-2xl border border-white/10 hover:border-[#E5A93C] transition-all duration-300 w-48 text-center shadow-lg group hover:-translate-y-1">
            <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">👨‍🌾</div>
            <div className="font-display font-bold text-xs text-white">FARMERS</div>
            <p className="text-[10px] font-mono text-[#9BC7A2]">Guaranteed payouts &amp; field AI</p>
            <div className="text-[9px] font-mono text-[#E5A93C] mt-0.5">Throughput: 12.8K MT/mo</div>
          </div>

          {/* Orbiting Node 2: FPOs & CO-OPS (Top Right) */}
          <div className="absolute top-16 right-4 sm:right-10 holo-glass p-3.5 rounded-2xl border border-white/10 hover:border-[#E5A93C] transition-all duration-300 w-44 text-center shadow-lg group hover:-translate-y-1">
            <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">🤝</div>
            <div className="font-display font-bold text-xs text-white">FPOs &amp; CO-OPS</div>
            <p className="text-[10px] font-mono text-[#9BC7A2]">Input bulk buys &amp; aggregation</p>
            <div className="text-[9px] font-mono text-[#E5A93C] mt-0.5">142 FPO Hubs Active</div>
          </div>

          {/* Orbiting Node 3: BUYERS & EXPORTERS (Bottom Right) */}
          <div className="absolute bottom-16 right-4 sm:right-10 holo-glass p-3.5 rounded-2xl border border-white/10 hover:border-[#E5A93C] transition-all duration-300 w-44 text-center shadow-lg group hover:-translate-y-1">
            <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">🏪</div>
            <div className="font-display font-bold text-xs text-white">BUYERS &amp; EXPORTERS</div>
            <p className="text-[10px] font-mono text-[#9BC7A2]">Direct farm sourcing &amp; purity</p>
            <div className="text-[9px] font-mono text-[#E5A93C] mt-0.5">₹42Cr Monthly Trade</div>
          </div>

          {/* Orbiting Node 4: LOGISTICS (Bottom) */}
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 holo-glass p-3.5 rounded-2xl border border-white/10 hover:border-[#E5A93C] transition-all duration-300 w-48 text-center shadow-lg group hover:-translate-y-1">
            <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">🚛</div>
            <div className="font-display font-bold text-xs text-white">COLD LOGISTICS</div>
            <p className="text-[10px] font-mono text-[#9BC7A2]">Return load match &amp; reefer GPS</p>
            <div className="text-[9px] font-mono text-[#E5A93C] mt-0.5">420 Reefers Synced</div>
          </div>

          {/* Orbiting Node 5: MANDIS & APMC (Bottom Left) */}
          <div className="absolute bottom-16 left-4 sm:left-10 holo-glass p-3.5 rounded-2xl border border-white/10 hover:border-[#E5A93C] transition-all duration-300 w-44 text-center shadow-lg group hover:-translate-y-1">
            <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">🏛️</div>
            <div className="font-display font-bold text-xs text-white">MANDIS &amp; APMC</div>
            <p className="text-[10px] font-mono text-[#9BC7A2]">e-Auctions &amp; weighbridge sync</p>
            <div className="text-[9px] font-mono text-[#E5A93C] mt-0.5">48 APMC Mandis</div>
          </div>

          {/* Orbiting Node 6: AGRI-FINTECH (Top Left) */}
          <div className="absolute top-16 left-4 sm:left-10 holo-glass p-3.5 rounded-2xl border border-white/10 hover:border-[#E5A93C] transition-all duration-300 w-44 text-center shadow-lg group hover:-translate-y-1">
            <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">💳</div>
            <div className="font-display font-bold text-xs text-white">AGRI-FINTECH</div>
            <p className="text-[10px] font-mono text-[#9BC7A2]">Produce escrow &amp; crop credit</p>
            <div className="text-[9px] font-mono text-[#E5A93C] mt-0.5">T+0 Instant Disbursal</div>
          </div>
        </div>
      </div>
    </section>
  );
};
