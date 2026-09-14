'use client';

import React from 'react';
import { Truck, MapPin, CheckCircle2 } from 'lucide-react';

export default function LogisticsDeliveriesPage() {
  return (
    <div className="space-y-6">
      <div className="bg-[#121a16] border border-[#1e2d26] p-6 rounded-2xl">
        <h1 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
          <Truck className="w-6 h-6 text-emerald-400" /> Logistics & Delivery Tracking
        </h1>
        <p className="text-sm text-gray-400">Accept produce pickup jobs, submit real-time GPS coordinates, and manage buyer delivery tracking.</p>
      </div>

      <div className="bg-[#121a16] border border-[#1e2d26] p-6 rounded-2xl space-y-4">
        <h2 className="text-lg font-bold text-gray-100">Active Delivery Jobs</h2>
        <div className="p-4 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl flex justify-between items-center text-xs font-mono text-gray-300">
          <div>
            <p className="font-bold text-emerald-300">Tomato Shipment (500 KG)</p>
            <p className="text-gray-400">Route: Dindigul Farm → Madurai Wholesale Market</p>
          </div>
          <span className="px-3 py-1 bg-amber-950 text-amber-300 border border-amber-800 rounded font-semibold">
            In Transit
          </span>
        </div>
      </div>
    </div>
  );
}
