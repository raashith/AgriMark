'use client';

import React from 'react';
import { LandingNav } from './LandingNav';
import { CinematicHero } from './CinematicHero';
import { WhyAgrimark } from './WhyAgrimark';
import { FarmerSection } from './FarmerSection';
import { MarketplaceSection } from './MarketplaceSection';
import { MarketIntelligenceSection } from './MarketIntelligenceSection';
import { TraceabilityTimeline } from './TraceabilityTimeline';
import { AgriAISection } from './AgriAISection';
import { EcosystemSection } from './EcosystemSection';
import { FinalCTA } from './FinalCTA';
import { LandingFooter } from './LandingFooter';

export const AgrimarkLanding: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F7F5EE] text-[#19201D] overflow-x-hidden selection:bg-[#E5A93C]/30 selection:text-[#1B4D3E]">
      <LandingNav />
      <main>
        <CinematicHero />
        <WhyAgrimark />
        <FarmerSection />
        <MarketplaceSection />
        <MarketIntelligenceSection />
        <TraceabilityTimeline />
        <AgriAISection />
        <EcosystemSection />
        <FinalCTA />
      </main>
      <LandingFooter />
    </div>
  );
};
