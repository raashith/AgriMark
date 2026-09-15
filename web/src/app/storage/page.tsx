'use client';

import React, { useState, useEffect } from 'react';
import { ColdStorage } from '@/types';
import { dataService } from '@/lib/data-service';
import { Building2, MapPin, Thermometer, Droplets, Phone } from 'lucide-react';

export default function StoragePage() {
  const [storages, setStorages] = useState<ColdStorage[]>([]);

  useEffect(() => {
    dataService.getColdStorage().then(setStorages);
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-[#121a16] border border-[#1e2d26] p-6 md:p-8 rounded-3xl space-y-2 shadow-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-950/80 border border-emerald-800/60 rounded-full text-xs font-mono font-bold text-emerald-400">
          <Building2 className="w-4 h-4" /> Cold Chain & Storage Network
        </div>
        <h1 className="text-2xl md:text-4xl font-extrabold text-white">
          Cold Storage & Warehouse Discovery
        </h1>
        <p className="text-sm text-gray-300 max-w-xl">
          Locate temperature-controlled cold storages and warehouses near your farm to prevent post-harvest spoilage.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {storages.map((cs) => (
          <div key={cs.id} className="bg-[#121a16] border border-[#1e2d26] rounded-3xl p-6 space-y-4 shadow-lg flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-extrabold text-lg text-white">{cs.name}</h3>
                  <p className="text-xs text-emerald-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5" /> {cs.district}, {cs.state}
                  </p>
                </div>
                <span className="px-3 py-1 bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs font-mono font-bold rounded-full">
                  ₹{cs.price_per_ton_day}/ton/day
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl">
                  <span className="text-gray-400 uppercase font-mono text-[10px]">Available Capacity</span>
                  <p className="font-bold text-white text-sm mt-0.5">{cs.available_capacity_tons} / {cs.total_capacity_tons} Tons</p>
                </div>

                <div className="p-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl">
                  <span className="text-gray-400 uppercase font-mono text-[10px]">Temp & Humidity</span>
                  <p className="font-bold text-emerald-300 text-xs mt-0.5">{cs.temp_range_c} • {cs.humidity_range_pct}</p>
                </div>
              </div>
            </div>

            <a
              href={`tel:${cs.contact_phone}`}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4" />
              <span>Contact Storage Manager ({cs.contact_phone})</span>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
