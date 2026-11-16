'use client';

import React, { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ShieldCheck, Users, Activity } from 'lucide-react';
import { api } from '@/lib/api';

type DocumentStatus = 'verified' | 'pending' | 'rejected' | 'not_submitted';

interface AdminDashboardUser {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: string;
  document_status: DocumentStatus;
}

interface AdminDashboardMetrics {
  registered_users: number;
  farmer_accounts: number;
  active_listings: number;
  order_volume_inr: number;
}

const documentStatusLabel: Record<DocumentStatus, string> = {
  verified: 'Documents verified',
  pending: 'Pending review',
  rejected: 'Needs resubmission',
  not_submitted: 'Not submitted',
};

const documentStatusStyle: Record<DocumentStatus, string> = {
  verified: 'bg-emerald-950 border-emerald-800 text-emerald-300',
  pending: 'bg-amber-950 border-amber-800 text-amber-300',
  rejected: 'bg-red-950 border-red-800 text-red-300',
  not_submitted: 'bg-slate-900 border-slate-700 text-slate-300',
};

export default function AdminDashboardPage() {
  const [users, setUsers] = useState<AdminDashboardUser[]>([]);
  const [stats, setStats] = useState<AdminDashboardMetrics>({
    registered_users: 0,
    farmer_accounts: 0,
    active_listings: 0,
    order_volume_inr: 0,
  });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [refreshVersion, setRefreshVersion] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadAdminData() {
      setLoading(true);
      setLoadError(null);
      try {
        const response = await api.getAdminDashboardSummary();
        if (!active) return;
        setStats({
          registered_users: response.summary.registered_users,
          farmer_accounts: response.summary.farmer_accounts,
          active_listings: response.summary.active_listings,
          order_volume_inr: response.summary.order_volume_inr,
        });
        setUsers(response.users);
      } catch (error) {
        console.error('[Admin dashboard] Failed to load administrator metrics:', error);
        if (active) {
          setLoadError(error instanceof Error
            ? error.message
            : 'Could not load platform metrics. Check your admin access and refresh.');
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadAdminData();
    return () => { active = false; };
  }, [refreshVersion]);

  return (
    <ProtectedRoute allowedRoles={['admin']} requireAuth>
      <div className="space-y-6">
        {loadError && (
          <div role="alert" className="rounded-xl border border-amber-700/50 bg-amber-950/30 px-4 py-3 text-sm text-amber-100">
            {loadError}
          </div>
        )}

        <div className="bg-[#121a16] border border-[#1e2d26] p-6 md:p-8 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-950/80 border border-purple-800/60 rounded-full text-xs font-mono font-bold text-purple-300">
              <ShieldCheck className="w-4 h-4 text-purple-400" /> Admin Command Center
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white">
              Platform Administration & Verification Portal
            </h1>
            <p className="text-xs text-gray-300 max-w-xl">
              Live platform-wide metrics from the protected AgriMark backend and current marketplace records.
            </p>
          </div>

          <span className="px-3.5 py-1.5 bg-emerald-950 border border-emerald-700 text-emerald-400 text-xs font-mono font-bold rounded-full flex items-center gap-1.5">
            <Activity className="w-4 h-4" /> Backend metrics connected
          </span>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setRefreshVersion((version) => version + 1)}
            disabled={loading}
            className="rounded-lg border border-emerald-800/70 px-3 py-2 text-xs font-semibold text-emerald-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Refreshing…' : 'Refresh dashboard'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-24 rounded-2xl" />
            ))
          ) : (
            <>
              <div className="p-4 bg-[#121a16] border border-[#1e2d26] rounded-2xl space-y-1">
                <span className="text-xs text-gray-400 font-mono">Registered Users</span>
                <p className="text-2xl font-black text-white">{stats.registered_users}</p>
              </div>
              <div className="p-4 bg-[#121a16] border border-[#1e2d26] rounded-2xl space-y-1">
                <span className="text-xs text-gray-400 font-mono">Farmer Accounts</span>
                <p className="text-2xl font-black text-emerald-400">{stats.farmer_accounts}</p>
              </div>
              <div className="p-4 bg-[#121a16] border border-[#1e2d26] rounded-2xl space-y-1">
                <span className="text-xs text-gray-400 font-mono">Active Listings</span>
                <p className="text-2xl font-black text-white">{stats.active_listings}</p>
              </div>
              <div className="p-4 bg-[#121a16] border border-[#1e2d26] rounded-2xl space-y-1">
                <span className="text-xs text-gray-400 font-mono">Marketplace Order Volume</span>
                <p className="text-2xl font-black text-purple-400">
                  ₹{stats.order_volume_inr.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </p>
              </div>
            </>
          )}
        </div>

        <div className="bg-[#121a16] border border-[#1e2d26] rounded-3xl p-6 space-y-4 shadow-lg">
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" /> User Directory & Document Status
          </h3>
          <p className="text-xs text-gray-400">
            Document status is derived from uploaded farmer documents. No KYC approval is recorded unless a document has an explicit verified status.
          </p>

          {loading ? (
            <Skeleton className="h-40 rounded-2xl" />
          ) : users.length === 0 ? (
            <EmptyState
              title="No Registered Users Found"
              description="Users will appear here after they register with AgriMark."
            />
          ) : (
            <div className="space-y-3">
              {users.map((user) => (
                <div key={user.id} className="p-4 bg-[#0a0f0d] border border-[#1e2d26] rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-sm text-white">{user.full_name || 'Anonymous User'}</h4>
                    <p className="text-xs text-gray-400 font-mono">
                      {user.phone || 'No phone number'} • <span className="uppercase text-emerald-400">{user.role}</span>
                    </p>
                  </div>
                  <span className={'self-start sm:self-auto px-2.5 py-1 text-[10px] font-mono font-bold uppercase rounded-full border ' + documentStatusStyle[user.document_status]}>
                    {documentStatusLabel[user.document_status]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
