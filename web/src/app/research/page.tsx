import React from 'react';
import Link from 'next/link';

export default function ResearchCenterPage() {
  return (
    <div className="min-h-screen bg-[#F7F5EE] text-[#19201D] font-[#Plus_Jakarta_Sans]">
      <header className="bg-[#1B4D3E] text-white py-6 px-8 border-b border-[#3E7B54] flex justify-between items-center shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Research Center</h1>
          <p className="text-sm text-[#F7F5EE]/80 mt-1">Peer-Reviewed Papers, Field Trials, Research Datasets & Citation Integrity</p>
        </div>
        <Link href="/knowledge" className="bg-[#E5A93C] text-[#19201D] px-4 py-2 rounded-md font-semibold hover:bg-[#E5A93C]/90 transition">
          Knowledge Explorer &rarr;
        </Link>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white p-6 rounded-lg border border-[#3E7B54]/20 shadow-sm mb-6">
          <h2 className="text-lg font-bold text-[#1B4D3E] mb-2">Peer-Reviewed Research Repository</h2>
          <div className="space-y-4 mt-4">
            <div className="border border-[#3E7B54]/20 rounded p-4 bg-[#F7F5EE]/50">
              <span className="font-bold text-[#1B4D3E]">Evaluation of Alternate Wetting & Drying in Paddy Rice Cultivation</span>
              <p className="text-xs text-[#19201D]/70 mt-1">Authors: Dr. K. Ramanathan, ICAR-NRRI | DOI: 10.56093/ijas.v95i6.148201</p>
              <div className="mt-2 text-xs text-[#3E7B54]">Level: OFFICIAL_RESEARCH | Confidence: 0.95</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
