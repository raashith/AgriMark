'use client';

import React from 'react';
import { useI18n } from '@/lib/i18n';
import { Users, Sprout, ShoppingBag, Package } from 'lucide-react';

export default function FPODashboard() {
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      <div className="bg-[#121a16] border border-[#1e2d26] p-6 rounded-2xl">
        <h1 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
          <Users className="w-6 h-6 text-emerald-400" /> FPO & Co-operative Procurement Portal
        </h1>
        <p className="text-sm text-gray-400">Manage member farmer harvests, bulk crop procurement, seed distribution, and aggregated listings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 bg-[#121a16] border border-[#1e2d26] rounded-2xl space-y-2">
          <span className="text-xs uppercase font-mono text-gray-400">Member Farmers</span>
          <p className="text-2xl font-bold text-emerald-400">128 Active</p>
        </div>

        <div className="p-5 bg-[#121a16] border border-[#1e2d26] rounded-2xl space-y-2">
          <span className="text-xs uppercase font-mono text-gray-400">Aggregated Lots</span>
          <p className="text-2xl font-bold text-amber-400">4,200 KG</p>
        </div>

        <div className="p-5 bg-[#121a16] border border-[#1e2d26] rounded-2xl space-y-2">
          <span className="text-xs uppercase font-mono text-gray-400">Bulk Contracts</span>
          <p className="text-2xl font-bold text-purple-400">8 Active</p>
        </div>
      </div>
    </div>
  );
}
