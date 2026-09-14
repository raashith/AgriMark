'use client';

import React from 'react';
import { useAuth } from '@/lib/auth';
import { Shield, Users, ShoppingBag, Database, AlertCircle } from 'lucide-react';

export default function AdminDashboard() {
  const { user, role } = useAuth();

  if (role !== 'admin') {
    return (
      <div className="max-w-md mx-auto my-12 p-6 bg-red-950/40 border border-red-800 rounded-2xl text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
        <h2 className="text-xl font-bold text-red-200">Access Denied</h2>
        <p className="text-xs text-red-300">You must be an authenticated administrator to access the admin console.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-[#121a16] border border-[#1e2d26] p-6 rounded-2xl">
        <h1 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
          <Shield className="w-6 h-6 text-emerald-400" /> AgriMark System Administration
        </h1>
        <p className="text-sm text-gray-400">Platform overview, user management, audit logs, and data commons configuration.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-5 bg-[#121a16] border border-[#1e2d26] rounded-2xl space-y-2">
          <span className="text-xs uppercase font-mono text-gray-400">System Users</span>
          <p className="text-2xl font-bold text-emerald-400">1,420 Active</p>
        </div>

        <div className="p-5 bg-[#121a16] border border-[#1e2d26] rounded-2xl space-y-2">
          <span className="text-xs uppercase font-mono text-gray-400">Active Listings</span>
          <p className="text-2xl font-bold text-amber-400">312 Listings</p>
        </div>

        <div className="p-5 bg-[#121a16] border border-[#1e2d26] rounded-2xl space-y-2">
          <span className="text-xs uppercase font-mono text-gray-400">Completed Orders</span>
          <p className="text-2xl font-bold text-purple-400">894 Orders</p>
        </div>

        <div className="p-5 bg-[#121a16] border border-[#1e2d26] rounded-2xl space-y-2">
          <span className="text-xs uppercase font-mono text-gray-400">Database Status</span>
          <p className="text-2xl font-bold text-emerald-400">Healthy (Supabase)</p>
        </div>
      </div>
    </div>
  );
}
