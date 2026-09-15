'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingCart, Building2, MapPin, ShieldCheck, ArrowRight } from 'lucide-react';

export default function BuyersDirectoryPage() {
  const buyers = [
    { name: 'FreshGro Supermarket Chain', type: 'Retail Chain', location: 'Bengaluru, KA', capacity: '100+ Tons/month', verification: 'Verified Enterprise' },
    { name: 'Spices Board Exporters Co.', type: 'Export House', location: 'Coimbatore, TN', capacity: '250 Tons/month', verification: 'APEDA Certified' },
    { name: 'Kaveri Rice & Flour Mills', type: 'Grain Processor', location: 'Thanjavur, TN', capacity: '500 Tons/month', verification: 'Verified Mill' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-[#121a16] border border-[#1e2d26] p-6 md:p-8 rounded-3xl space-y-2 shadow-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-950/80 border border-emerald-800/60 rounded-full text-xs font-mono font-bold text-emerald-400">
          <Building2 className="w-4 h-4" /> Enterprise Buyers & Processors
        </div>
        <h1 className="text-2xl md:text-4xl font-extrabold text-white">
          Verified Agricultural Buyers & Processors
        </h1>
        <p className="text-sm text-gray-300 max-w-xl">
          Verified institutional buyers, exporters, retail chains, and food processors procuring directly from farmers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {buyers.map((b, idx) => (
          <div key={idx} className="bg-[#121a16] border border-[#1e2d26] rounded-3xl p-6 space-y-4 shadow-lg flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-emerald-950 border border-emerald-700 rounded-2xl flex items-center justify-center text-emerald-400 font-bold">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">{b.name}</h3>
                  <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold">{b.type}</span>
                </div>
              </div>

              <div className="p-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-2xl text-xs space-y-1">
                <div className="flex justify-between text-gray-400">
                  <span>Location:</span>
                  <span className="text-white font-medium">{b.location}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Procurement Vol:</span>
                  <span className="text-emerald-400 font-bold">{b.capacity}</span>
                </div>
              </div>
            </div>

            <Link
              href="/buyer/rfqs"
              className="w-full py-2.5 bg-[#18241f] border border-[#2a3c33] hover:bg-emerald-600 text-gray-200 hover:text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2"
            >
              <span>View Buyer Demands</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
