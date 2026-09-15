'use client';

import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { SEED_PROFILES } from '@/lib/seed-data';
import { dataService } from '@/lib/data-service';
import { useToast } from '@/components/ui/Toast';
import { ShieldCheck, Users, ShoppingCart, FileText, Activity, CheckCircle2, XCircle } from 'lucide-react';

export default function AdminDashboardPage() {
  const { showSuccess } = useToast();
  const [users, setUsers] = useState(SEED_PROFILES);
  const [systemHealth, setSystemHealth] = useState('100% Operational');

  const handleApproveKYC = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, kyc_status: 'verified' } : u))
    );
    showSuccess('KYC Verified', 'User verification status updated to Verified.');
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="space-y-6">
        <div className="bg-[#121a16] border border-[#1e2d26] p-6 md:p-8 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-950/80 border border-purple-800/60 rounded-full text-xs font-mono font-bold text-purple-300">
              <ShieldCheck className="w-4 h-4 text-purple-400" /> Admin Command Center
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white">
              Platform Administration & Verification Portal
            </h1>
            <p className="text-xs text-gray-300 max-w-xl">
              Strictly protected administration console for user KYC verification, listing moderation, dispute resolution, and system audit logs.
            </p>
          </div>

          <span className="px-3.5 py-1.5 bg-emerald-950 border border-emerald-700 text-emerald-400 text-xs font-mono font-bold rounded-full flex items-center gap-1.5">
            <Activity className="w-4 h-4" /> System Health: {systemHealth}
          </span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-[#121a16] border border-[#1e2d26] rounded-2xl space-y-1">
            <span className="text-xs text-gray-400 font-mono">Registered Users</span>
            <p className="text-2xl font-black text-white">{users.length}</p>
          </div>
          <div className="p-4 bg-[#121a16] border border-[#1e2d26] rounded-2xl space-y-1">
            <span className="text-xs text-gray-400 font-mono">Verified Farmers</span>
            <p className="text-2xl font-black text-emerald-400">
              {users.filter((u) => u.role === 'farmer' && u.kyc_status === 'verified').length}
            </p>
          </div>
          <div className="p-4 bg-[#121a16] border border-[#1e2d26] rounded-2xl space-y-1">
            <span className="text-xs text-gray-400 font-mono">Active Listings</span>
            <p className="text-2xl font-black text-white">2</p>
          </div>
          <div className="p-4 bg-[#121a16] border border-[#1e2d26] rounded-2xl space-y-1">
            <span className="text-xs text-gray-400 font-mono">Total Order Vol</span>
            <p className="text-2xl font-black text-purple-400">₹3.62 L</p>
          </div>
        </div>

        {/* User Verification Queue */}
        <div className="bg-[#121a16] border border-[#1e2d26] rounded-3xl p-6 space-y-4 shadow-lg">
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" /> User Verification & Role Audit Queue
          </h3>

          <div className="space-y-3">
            {users.map((u) => (
              <div key={u.id} className="p-4 bg-[#0a0f0d] border border-[#1e2d26] rounded-2xl flex items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-sm text-white">{u.full_name}</h4>
                  <p className="text-xs text-gray-400 font-mono">{u.email || u.phone} • <span className="uppercase text-emerald-400">{u.role}</span></p>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase rounded-full border ${
                    u.kyc_status === 'verified'
                      ? 'bg-emerald-950 border-emerald-800 text-emerald-300'
                      : 'bg-amber-950 border-amber-800 text-amber-300'
                  }`}>
                    {u.kyc_status || 'unverified'}
                  </span>

                  {u.kyc_status !== 'verified' && (
                    <button
                      onClick={() => handleApproveKYC(u.id)}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Approve KYC
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
