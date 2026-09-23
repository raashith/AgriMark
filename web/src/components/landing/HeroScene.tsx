'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';

export const HeroScene: React.FC = () => {
  const heroStageRef = useRef<HTMLDivElement | null>(null);
  const rigRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const stage = heroStageRef.current;
    const rig = rigRef.current;

    if (!stage || !rig || !window.matchMedia('(pointer: fine)').matches) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = stage.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      const rotX = 8 - y * 16;
      const rotY = -12 + x * 18;
      rig.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(35px)`;
    };

    const handleMouseLeave = () => {
      rig.style.transform = 'rotateX(8deg) rotateY(-12deg) translateZ(0px)';
    };

    stage.addEventListener('mousemove', handleMouseMove);
    stage.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      stage.removeEventListener('mousemove', handleMouseMove);
      stage.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <section
      id="scene-farm"
      className="scene-target relative min-h-screen w-full pt-32 pb-16 flex flex-col justify-between perspective-container"
    >
      <div
        ref={heroStageRef}
        id="interactive-hero-stage"
        className="relative z-20 max-w-7xl mx-auto px-4 sm:px-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-10 items-center my-auto"
      >
        {/* Left Hero Column */}
        <div className="lg:col-span-6 space-y-6 text-left">
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full holo-glass-subtle border border-[#E5A93C]/35 shadow-sm">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
            </span>
            <span className="font-mono text-[11px] font-bold tracking-wider text-[#FCE196] uppercase">
              LIVE AGRICULTURAL DIGITAL TWIN // SYS_STATUS: OPTIMAL
            </span>
          </div>

          {/* Display Headline */}
          <h1 className="font-display text-4xl sm:text-6xl xl:text-7xl font-bold tracking-tight text-white leading-[1.06]">
            FROM <span className="text-emerald-gold">SOIL</span>
            <br />
            TO <span className="text-gold-gradient drop-shadow-sm">SMART TRADE.</span>
          </h1>

          {/* Supporting message */}
          <p className="text-base sm:text-xl text-[#F7F5EE]/80 max-w-[620px] font-normal leading-relaxed">
            AgriMark connects farms, markets, intelligence, traceability and logistics in one agricultural operating layer.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href="/auth/register"
              className="group relative px-8 py-4 rounded-xl font-display font-bold text-sm tracking-wider text-[#07110D] overflow-hidden transition-all duration-300 hover:scale-[1.02] shadow-gold-glow bg-gradient-to-r from-[#E5A93C] via-[#FCE196] to-[#E5A93C]"
            >
              <span className="relative z-10 flex items-center gap-2">
                START FOR FREE
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </span>
            </Link>

            <a
              href="#scene-field"
              className="px-7 py-4 rounded-xl holo-glass font-display font-semibold text-sm text-[#F7F5EE] border border-white/20 hover:border-[#E5A93C]/60 hover:bg-white/5 transition-all duration-300"
            >
              EXPLORE AGRIMARK
            </a>
          </div>

          {/* Telemetry Stats Strip */}
          <div className="pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <div className="text-[10px] font-mono text-[#9BC7A2] uppercase">FARMS</div>
              <div className="font-display text-xl font-bold text-white">1,284</div>
              <div className="text-[10px] text-emerald-400 font-mono">▲ Active</div>
            </div>
            <div>
              <div className="text-[10px] font-mono text-[#9BC7A2] uppercase">MARKETS</div>
              <div className="font-display text-xl font-bold text-white">48</div>
              <div className="text-[10px] text-[#E5A93C] font-mono">Connected Mandis</div>
            </div>
            <div>
              <div className="text-[10px] font-mono text-[#9BC7A2] uppercase">LOTS</div>
              <div className="font-display text-xl font-bold text-white">12.6K</div>
              <div className="text-[10px] text-teal-300 font-mono">Verified Lots</div>
            </div>
            <div>
              <div className="text-[10px] font-mono text-[#9BC7A2] uppercase">DELIVERIES</div>
              <div className="font-display text-xl font-bold text-white">LIVE</div>
              <div className="text-[10px] text-emerald-400 font-mono">GPS Sync 99.4%</div>
            </div>
          </div>
        </div>

        {/* Right Column: 3D Holographic Command Rig */}
        <div className="lg:col-span-6 relative w-full h-[520px] sm:h-[580px] flex items-center justify-center">
          <div
            ref={rigRef}
            id="hologram-rig"
            className="relative w-full max-w-lg transform-3d transition-transform duration-300 ease-out"
            style={{ transform: 'rotateX(8deg) rotateY(-12deg)' }}
          >
            {/* Central Command Center Card */}
            <div className="holo-glass rounded-3xl p-6 sm:p-7 shadow-holo-card border border-[#E5A93C]/35 relative overflow-hidden backdrop-blur-2xl">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#FCE196]/70 to-transparent" />
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#1B4D3E] border border-[#E5A93C]/40 flex items-center justify-center text-[#E5A93C] font-mono text-sm font-bold">
                    ⌘
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-sm tracking-wide text-white uppercase">
                      AGRIMARK COMMAND
                    </h3>
                    <p className="text-[10px] font-mono text-[#9BC7A2]">Live agricultural intelligence</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-[#3E7B54]/40 text-[#6EE7B7] border border-[#3E7B54]">
                    NODE #402
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                </div>
              </div>

              {/* Real-time Commodity Sparkline */}
              <div className="bg-[#07110D]/85 rounded-xl p-3.5 border border-white/5 mb-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[9px] font-mono text-white/50 tracking-wider">MARKET PULSE</div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-display text-xl font-bold text-white">Tomato</span>
                      <span className="text-[11px] font-mono text-[#9BC7A2]">(Hybrid Grade A)</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block font-mono text-[10px] font-bold text-[#FCE196] bg-[#E5A93C]/15 px-1.5 py-0.5 rounded border border-[#E5A93C]/30">
                      +18.6%
                    </span>
                    <div className="font-display text-base font-bold text-[#F7F5EE]">
                      ₹ 4,860 <span className="text-[10px] font-normal text-white/60">/ qtl</span>
                    </div>
                  </div>
                </div>

                <div className="h-12 w-full pt-1">
                  <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 300 50">
                    <defs>
                      <linearGradient id="chartGradHero" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#E5A93C" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="#E5A93C" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path d="M0,40 Q45,34 85,36 T160,20 T230,14 T300,6 L300,50 L0,50 Z" fill="url(#chartGradHero)" />
                    <path d="M0,40 Q45,34 85,36 T160,20 T230,14 T300,6" fill="none" stroke="#E5A93C" strokeLinecap="round" strokeWidth="2.2" />
                    <circle cx="300" cy="6" r="3.5" fill="#FCE196" className="animate-ping" />
                    <circle cx="300" cy="6" r="2.5" fill="#E5A93C" />
                  </svg>
                </div>

                <div className="flex justify-between items-center text-[10px] font-mono text-[#9BC7A2] pt-1 border-t border-white/5">
                  <span>Basmati 1121: ₹3,920/qtl</span>
                  <span className="text-emerald-400">▲ +3.2%</span>
                </div>
              </div>

              {/* Parameters Grid */}
              <div className="grid grid-cols-2 gap-2.5 mb-4">
                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                  <div className="text-[9px] font-mono text-[#9BC7A2]">FIELD HEALTH</div>
                  <div className="font-display text-lg font-bold text-white flex items-baseline gap-1 mt-0.5">
                    92% <span className="text-[9px] font-mono text-emerald-400 font-normal">Vegetative VI</span>
                  </div>
                  <div className="w-full bg-black/40 h-1.5 rounded-full mt-1.5 overflow-hidden">
                    <div className="bg-gradient-to-r from-emerald-500 to-[#3E7B54] h-full rounded-full" style={{ width: '92%' }} />
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                  <div className="text-[9px] font-mono text-[#9BC7A2]">MARKET DEMAND</div>
                  <div className="font-display text-lg font-bold text-[#FCE196] flex items-baseline gap-1 mt-0.5">
                    HIGH <span className="text-[9px] font-mono text-white/50">Nashik / Delhi</span>
                  </div>
                  <div className="w-full bg-black/40 h-1.5 rounded-full mt-1.5 overflow-hidden">
                    <div className="bg-gradient-to-r from-[#E5A93C] to-amber-300 h-full rounded-full" style={{ width: '86%' }} />
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                  <div className="text-[9px] font-mono text-[#9BC7A2]">TRACEABILITY</div>
                  <div className="font-display text-lg font-bold text-teal-300 flex items-baseline gap-1 mt-0.5">
                    100% <span className="text-[9px] font-mono text-white/50">APEDA &amp; Mandi</span>
                  </div>
                  <div className="text-[9px] font-mono text-[#9BC7A2]/70 mt-0.5">Geo-fenced QR Seal</div>
                </div>

                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                  <div className="text-[9px] font-mono text-[#9BC7A2]">DISPATCH</div>
                  <div className="font-display text-lg font-bold text-emerald-300 flex items-center gap-1.5 mt-0.5">
                    ON ROUTE
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  </div>
                  <div className="text-[9px] font-mono text-[#9BC7A2]/70 mt-0.5">Cold Chain Reefer #12</div>
                </div>
              </div>

              {/* Card Bottom Bar */}
              <div className="pt-2.5 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-white/60">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E5A93C]" />
                  Supabase Realtime Stream
                </span>
                <span className="text-[#FCE196]">LATENCY: 28ms</span>
              </div>
            </div>

            {/* Floating Satellite HUD 1: Soil Signal */}
            <div
              className="absolute -top-6 -right-6 holo-glass rounded-2xl p-3 border border-[#3E7B54]/50 shadow-xl hidden sm:flex items-center gap-2.5 animate-float-hud"
              style={{ transform: 'translateZ(75px)' }}
            >
              <div className="w-8 h-8 rounded-lg bg-[#1B4D3E]/90 border border-[#3E7B54] flex items-center justify-center text-base">
                🌱
              </div>
              <div>
                <div className="text-[9px] font-mono text-[#9BC7A2]">SOIL SIGNAL</div>
                <div className="font-display text-xs font-bold text-white">OPTIMAL • NPK 14:12:10</div>
                <div className="text-[9px] font-mono text-[#E5A93C]">Moisture 28.4%</div>
              </div>
            </div>

            {/* Floating Satellite HUD 2: AI Confidence */}
            <div
              className="absolute -bottom-6 -left-6 holo-glass rounded-2xl p-3 border border-[#E5A93C]/40 shadow-xl hidden sm:flex items-center gap-2.5 animate-float-hud"
              style={{ transform: 'translateZ(85px)', animationDelay: '-2.5s' }}
            >
              <div className="w-8 h-8 rounded-lg bg-[#07110D] border border-[#E5A93C] flex items-center justify-center text-[#FCE196] font-bold font-mono text-xs">
                87%
              </div>
              <div>
                <div className="text-[9px] font-mono text-[#9BC7A2]">AI CONFIDENCE</div>
                <div className="font-display text-xs font-bold text-white">Harvest in 48 Hours</div>
                <div className="text-[9px] font-mono text-emerald-400">+14% Expected Realization</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Scene Controls Bar */}
      <div className="relative z-30 max-w-7xl mx-auto px-4 sm:px-8 w-full pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#9BC7A2]">SCENE CONTROLS:</span>
          <div className="inline-flex rounded-xl p-1 bg-[#07110D]/90 border border-white/10 backdrop-blur-md">
            <button
              onClick={() => document.getElementById('scene-field')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-3 py-1 rounded-lg text-xs font-mono font-bold bg-[#E5A93C] text-[#07110D] shadow-sm"
            >
              01 • FIELD INTEL
            </button>
            <button
              onClick={() => document.getElementById('scene-market')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-3 py-1 rounded-lg text-xs font-mono font-semibold text-white/60 hover:text-white transition-colors"
            >
              02 • MARKET PULSE
            </button>
            <button
              onClick={() => document.getElementById('scene-logistics')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-3 py-1 rounded-lg text-xs font-mono font-semibold text-white/60 hover:text-white transition-colors"
            >
              03 • LOGISTICS ROUTE
            </button>
          </div>
        </div>

        <div className="text-[10px] font-mono text-white/50 flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            MAHARASHTRA AGRI CLUSTER (19.9975° N, 73.7898° E)
          </span>
          <span className="text-white/20">|</span>
          <span className="text-[#E5A93C]">SCROLL TO NAVIGATE CONTINUOUS WORLD</span>
        </div>
      </div>
    </section>
  );
};
