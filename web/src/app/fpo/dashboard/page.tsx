'use client';

import React from 'react';
import { Users, Package, ShoppingBag } from 'lucide-react';
import { TelemetryCard } from '@/components/stitch/common/TelemetryCard';

export default function FPODashboard() {
  return (
    <div className="space-y-6">
      <div className="bg-[#121a16] border border-[#1e2d26] p-6 rounded-2xl">
        <h1 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
          <Users className="w-6 h-6 text-emerald-400" /> FPO & Co-operative Procurement Portal
        </h1>
        <p className="text-sm text-gray-400">Manage member farmer harvests, bulk crop procurement, seed distribution, and aggregated listings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TelemetryCard
          label="Member Farmers"
          value="128"
          unit="Active"
          change="+14 this month"
          trend="up"
          icon={Users}
        />
        <TelemetryCard
          label="Aggregated Lots"
          value="4,200"
          unit="KG"
          change="+850 kg pooled"
          trend="up"
          accentColor="amber"
          icon={Package}
        />
        <TelemetryCard
          label="Bulk Contracts"
          value="8"
          unit="Active"
          change="₹14.2L Escrow"
          trend="up"
          accentColor="gold"
          icon={ShoppingBag}
        />
      </div>
    </div>
  );
}
