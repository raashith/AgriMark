'use client';

import React from 'react';
import { LandingNav } from './LandingNav';
import { CinematicHero } from './CinematicHero';
import { WhyAgrimark } from './WhyAgrimark';
import { FarmerSection } from './FarmerSection';
import { MarketplaceFlow } from './MarketplaceFlow';
import { MarketIntelligence } from './MarketIntelligence';
import { TraceabilityTimeline } from './TraceabilityTimeline';
import { AIAgricultureSection } from './AIAgricultureSection';
import { EcosystemSection } from './EcosystemSection';
import { FinalCTA } from './FinalCTA';
import { LandingFooter } from './LandingFooter';

export const AgrimarkLanding: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0a0f0d] text-gray-100 font-sans selection:bg-emerald-500 selection:text-black">
      <LandingNav />
      <main>
        <CinematicHero />
        <WhyAgrimark />
        <FarmerSection />
        <MarketplaceFlow />
        <MarketIntelligence />
        <TraceabilityTimeline />
        <AIAgricultureSection />
        <EcosystemSection />
        <FinalCTA />
      </main>
      <LandingFooter />
    </div>
  );
};

export default AgrimarkLanding;
