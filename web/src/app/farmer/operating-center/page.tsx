import React from 'react';
import Link from 'next/link';

export default function FarmerOperatingCenterPage() {
  return (
    <div className="min-h-screen bg-[#F7F5EE] text-[#19201D] font-[#Plus_Jakarta_Sans]">
      <header className="bg-[#1B4D3E] text-white py-6 px-8 border-b border-[#3E7B54] flex justify-between items-center shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Farmer Operating Center</h1>
          <p className="text-sm text-[#F7F5EE]/80 mt-1">Unified Farm Workspace: Weather, Crops, Prices, Schemes &amp; AI Assistant</p>
        </div>
        <Link href="/farmer/actions" className="bg-[#E5A93C] text-[#19201D] px-4 py-2 rounded-md font-semibold hover:bg-[#E5A93C]/90 transition">
          Farmer Action Center &rarr;
        </Link>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg border border-[#3E7B54]/20 shadow-sm">
            <span className="text-xs font-mono text-[#19201D]/60 uppercase">Farm Status</span>
            <h2 className="text-2xl font-bold text-[#1B4D3E] mt-2">Kaveri Delta Agro Farm</h2>
            <div className="text-xs text-[#3E7B54] mt-1">4.5 Hectares | Paddy Pusa Basmati 1121</div>
          </div>
          <div className="bg-white p-6 rounded-lg border border-[#3E7B54]/20 shadow-sm">
            <span className="text-xs font-mono text-[#19201D]/60 uppercase">Today&apos;s Weather</span>
            <h2 className="text-2xl font-bold text-[#1B4D3E] mt-2">29.5°C | Light Rain</h2>
            <div className="text-xs text-[#3E7B54] mt-1">12.0 mm Expected | Humidity 68%</div>
          </div>
          <div className="bg-white p-6 rounded-lg border border-[#3E7B54]/20 shadow-sm">
            <span className="text-xs font-mono text-[#19201D]/60 uppercase">Live Mandi Price</span>
            <h2 className="text-2xl font-bold text-[#1B4D3E] mt-2">₹2,180 / Qt</h2>
            <div className="text-xs text-[#E5A93C] font-semibold mt-1">Salem Regulated Mandi</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-[#3E7B54]/20 shadow-sm mb-6">
          <h3 className="text-lg font-bold text-[#1B4D3E] mb-2">Supervised AI Recommendation</h3>
          <p className="text-sm text-[#19201D]">
            Apply 2nd Nitrogen split dosage during early morning hours. Soil moisture levels are optimal following yesterday&apos;s 12mm rainfall.
          </p>
          <div className="mt-4 flex gap-3">
            <button className="bg-[#1B4D3E] text-white px-4 py-2 rounded text-xs font-semibold">Schedule Fertilizer Application</button>
            <button className="bg-[#F7F5EE] text-[#19201D] border border-[#3E7B54]/30 px-4 py-2 rounded text-xs font-semibold">Review Evidence &amp; Research</button>
          </div>
        </div>
      </main>
    </div>
  );
}
