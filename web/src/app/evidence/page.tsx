import React from 'react';
import Link from 'next/link';

export default function EvidenceViewerPage() {
  return (
    <div className="min-h-screen bg-[#F7F5EE] text-[#19201D] font-[#Plus_Jakarta_Sans]">
      <header className="bg-[#1B4D3E] text-white py-6 px-8 border-b border-[#3E7B54] flex justify-between items-center shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Evidence Viewer</h1>
          <p className="text-sm text-[#F7F5EE]/80 mt-1">Cross-Domain Evidence Provenance, Citation Verification & Conflict Detector</p>
        </div>
        <Link href="/research" className="text-sm text-[#E5A93C] underline hover:text-white transition">
          &larr; Back to Research Center
        </Link>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white p-6 rounded-lg border border-[#3E7B54]/20 shadow-sm mb-6">
          <h2 className="text-lg font-bold text-[#1B4D3E] mb-2">Verified Claims & Evidence Levels</h2>
          <div className="space-y-4 mt-4">
            <div className="border border-[#3E7B54]/20 rounded p-4 bg-[#F7F5EE]/50 flex justify-between items-center">
              <div>
                <span className="font-bold text-[#1B4D3E]">Neem-coated Urea reduces nitrogen leaching by 22% in wetland rice.</span>
                <p className="text-xs text-[#19201D]/70 mt-1">Source: ICAR Indian Agricultural Research Institute | Confidence: 0.94</p>
              </div>
              <span className="text-xs bg-[#3E7B54] text-white px-2.5 py-1 rounded font-mono font-bold">PRIMARY_RESEARCH</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
