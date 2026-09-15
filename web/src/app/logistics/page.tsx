'use client';

import React, { useState, useEffect } from 'react';
import { LogisticsRequest } from '@/types';
import { dataService } from '@/lib/data-service';
import { Truck, MapPin, PackageCheck, Phone, ShieldCheck } from 'lucide-react';

export default function LogisticsPage() {
  const [requests, setRequests] = useState<LogisticsRequest[]>([]);

  useEffect(() => {
    dataService.getLogisticsRequests().then(setRequests);
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-[#121a16] border border-[#1e2d26] p-6 md:p-8 rounded-3xl space-y-2 shadow-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-950/80 border border-emerald-800/60 rounded-full text-xs font-mono font-bold text-emerald-400">
          <Truck className="w-4 h-4" /> Transport & Fleet Dispatch OS
        </div>
        <h1 className="text-2xl md:text-4xl font-extrabold text-white">
          AgriMark Logistics & Transit Tracking
        </h1>
        <p className="text-sm text-gray-300 max-w-xl">
          Track farm-to-warehouse transport orders, refrigerated truck assignments, and real-time GPS locations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {requests.map((req) => (
          <div key={req.id} className="bg-[#121a16] border border-[#1e2d26] rounded-3xl p-6 space-y-4 shadow-lg">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-extrabold text-base text-white">{req.crop_name} Transport</h3>
                <p className="text-xs text-gray-400 font-mono">Tracking ID: {req.tracking_code}</p>
              </div>
              <span className="px-3 py-1 bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs font-mono font-bold uppercase rounded-full">
                {req.status}
              </span>
            </div>

            <div className="p-4 bg-[#0a0f0d] border border-[#1e2d26] rounded-2xl space-y-2 text-xs">
              <div className="flex items-center gap-2 text-gray-300">
                <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Pickup: <strong className="text-white">{req.pickup_location}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Destination: <strong className="text-white">{req.delivery_location}</strong></span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-[#1e2d26]">
              <span>Vehicle: {req.vehicle_type}</span>
              <span>Driver: {req.driver_name}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
