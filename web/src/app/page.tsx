// AgriMark Production Web Application - 3D Digital Twin Landing Page
'use client';

import React from 'react';
import { Agrimark3DCanvas } from '@/components/landing/Agrimark3DCanvas';
import { ChapterHudRail } from '@/components/landing/ChapterHudRail';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { HeroScene } from '@/components/landing/HeroScene';
import { FieldIntelScene } from '@/components/landing/FieldIntelScene';
import { MarketPulseScene } from '@/components/landing/MarketPulseScene';
import { TraceabilityScene } from '@/components/landing/TraceabilityScene';
import { AgriAiScene } from '@/components/landing/AgriAiScene';
import { NetworkScene } from '@/components/landing/NetworkScene';
import { LogisticsScene } from '@/components/landing/LogisticsScene';
import { SmartTradeFinalScene } from '@/components/landing/SmartTradeFinalScene';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { ScrollRevealProvider } from '@/components/landing/ScrollRevealProvider';

export default function HomePage() {
  return (
    <div className="relative bg-[#04100B] text-[#F7F5EE] font-sans antialiased overflow-x-hidden selection:bg-[#E5A93C]/30 selection:text-[#FCE196]">
      {/* 1. WebGL 3D Procedural Background Canvas */}
      <Agrimark3DCanvas />

      {/* 2. Floating Persistent Right-Rail Chapter HUD */}
      <ChapterHudRail />

      {/* 3. Top Floating Glass Navigation Header */}
      <LandingHeader />

      {/* 4. 8-Scene Continuous World Journey */}
      <ScrollRevealProvider>
        <main className="relative z-10">
          <HeroScene />
          <FieldIntelScene />
          <MarketPulseScene />
          <TraceabilityScene />
          <AgriAiScene />
          <NetworkScene />
          <LogisticsScene />
          <SmartTradeFinalScene />
        </main>
      </ScrollRevealProvider>

      {/* 5. Footer */}
      <LandingFooter />
    </div>
  );
}
