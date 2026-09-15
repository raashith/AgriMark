import React from 'react';
import Link from 'next/link';

export default function KnowledgeExplorerPage() {
  return (
    <div className="min-h-screen bg-[#F7F5EE] text-[#19201D] font-[#Plus_Jakarta_Sans]">
      <header className="bg-[#1B4D3E] text-white py-6 px-8 border-b border-[#3E7B54] flex justify-between items-center shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Knowledge Explorer</h1>
          <p className="text-sm text-[#F7F5EE]/80 mt-1">Canonical Grounded Agricultural Knowledge Graph & Entity Relationships</p>
        </div>
        <Link href="/evidence" className="bg-[#E5A93C] text-[#19201D] px-4 py-2 rounded-md font-semibold hover:bg-[#E5A93C]/90 transition">
          Evidence Viewer &rarr;
        </Link>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white p-6 rounded-lg border border-[#3E7B54]/20 shadow-sm mb-6">
          <h2 className="text-lg font-bold text-[#1B4D3E] mb-2">Canonical Knowledge Graph Browser</h2>
          <div className="h-64 bg-[#19201D]/5 rounded flex items-center justify-center border border-dashed border-[#3E7B54]/40 mt-4">
            <div className="text-center font-mono text-xs text-[#1B4D3E]">
              Entities: Crop (Paddy), Disease (Bacterial Blight), Practice (AWD), Soil (Alluvial Clay)
              <p className="text-[#19201D]/60 mt-1">Relationships grounded with mandatory research provenance</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
