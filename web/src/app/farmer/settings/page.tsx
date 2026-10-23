'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import type { Farm } from '@/types';
import { Skeleton } from '@/components/ui/Skeleton';
import { AlertCircle, ArrowLeft, Building2, CheckCircle2, ChevronRight, Sprout, UserRound } from 'lucide-react';

export default function FarmerSettingsPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [farmsLoading, setFarmsLoading] = useState(true);
  const [farmsError, setFarmsError] = useState('');

  useEffect(() => {
    let active = true;
    async function loadFarms() {
      if (!user?.id || user.role !== 'farmer') {
        setFarmsLoading(false);
        return;
      }
      try {
        const result = await api.getFarms(user.id);
        if (active) setFarms(Array.isArray(result) ? result : []);
      } catch (error) {
        if (active) setFarmsError(error instanceof Error ? error.message : 'Could not load your farms.');
      } finally {
        if (active) setFarmsLoading(false);
      }
    }
    void loadFarms();
    return () => { active = false; };
  }, [user?.id, user?.role]);

  if (isLoading) {
    return <main className="max-w-5xl mx-auto px-4 py-10 space-y-4"><Skeleton className="h-8 w-56" /><Skeleton className="h-48 rounded-3xl" /><Skeleton className="h-36 rounded-3xl" /></main>;
  }

  if (!isAuthenticated || !user) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-16">
        <section className="rounded-3xl border border-[#1e2d26] bg-[#121a16] p-8 text-center">
          <UserRound className="mx-auto mb-3 h-9 w-9 text-emerald-400" />
          <h1 className="text-xl font-bold text-white">Sign in to view your settings</h1>
          <p className="mt-2 text-sm text-gray-400">Your account and farm details are available after you sign in.</p>
          <Link href="/auth/login" className="mt-5 inline-flex rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-500">Sign in</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 md:py-10 space-y-6">
      <Link href={user.role === 'buyer' ? '/buyer/dashboard' : '/farmer/dashboard'} className="inline-flex items-center gap-2 text-sm font-semibold text-gray-400 transition hover:text-emerald-400">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Link>

      <header>
        <p className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-emerald-400">Account preferences</p>
        <h1 className="mt-2 text-3xl font-extrabold text-white">Account & Farm Settings</h1>
        <p className="mt-2 text-sm text-gray-400">Review your signed-in account and manage your farm workspace.</p>
      </header>

      <section className="rounded-3xl border border-[#1e2d26] bg-[#121a16] p-5 md:p-7">
        <div className="flex items-start gap-4">
          {user.avatar_url ? (
            <img src={user.avatar_url} alt={user.full_name ? `${user.full_name}'s profile photo` : 'Profile photo'} referrerPolicy="no-referrer" className="h-16 w-16 rounded-2xl border border-emerald-800 object-cover" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-800 bg-emerald-950 text-2xl font-bold text-emerald-400">{user.full_name?.trim()?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}</div>
          )}
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-bold text-white">{user.full_name?.trim() || 'AgriMark account'}</h2>
            <p className="mt-1 break-words text-sm text-gray-400">{user.email || 'No email address available'}</p>
            <span className="mt-3 inline-flex items-center rounded-full border border-emerald-800/60 bg-emerald-950/70 px-3 py-1 text-xs font-bold uppercase text-emerald-300">{user.role.replace('_', ' ')}</span>
          </div>
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" aria-label="Signed in" />
        </div>
        <div className="mt-6 grid gap-3 border-t border-[#1e2d26] pt-5 sm:grid-cols-2">
          <div className="rounded-2xl bg-[#0a0f0d] p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Phone</p>
            <p className="mt-1 text-sm font-semibold text-gray-200">{user.phone || user.phone_number || 'Not added'}</p>
          </div>
          <div className="rounded-2xl bg-[#0a0f0d] p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Account ID</p>
            <p className="mt-1 break-all font-mono text-xs text-gray-300">{user.id}</p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-[#1e2d26] bg-[#121a16] p-5 md:p-7">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-bold text-white"><Building2 className="h-5 w-5 text-emerald-400" /> Your farms</h2>
            <p className="mt-1 text-sm text-gray-400">Farm records linked to your signed-in account.</p>
          </div>
          <span className="rounded-full border border-[#2a3c33] bg-[#0a0f0d] px-3 py-1 text-xs font-bold text-gray-300">{farmsLoading ? 'Loading…' : `${farms.length} farm${farms.length === 1 ? '' : 's'}`}</span>
        </div>

        {farmsLoading ? (
          <div className="mt-5 space-y-3"><Skeleton className="h-16 rounded-2xl" /><Skeleton className="h-16 rounded-2xl" /></div>
        ) : farmsError ? (
          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-800/50 bg-amber-950/20 p-4 text-sm text-amber-200"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><p>{farmsError}</p></div>
        ) : farms.length ? (
          <div className="mt-5 space-y-3">
            {farms.map((farm) => (
              <div key={farm.id} className="flex items-center justify-between gap-4 rounded-2xl border border-[#1e2d26] bg-[#0a0f0d] p-4">
                <div className="flex min-w-0 items-center gap-3"><Sprout className="h-5 w-5 shrink-0 text-emerald-400" /><div className="min-w-0"><p className="truncate font-semibold text-white">{farm.name || 'Unnamed farm'}</p><p className="mt-1 truncate text-xs text-gray-400">{[farm.village, farm.district, farm.state].filter(Boolean).join(', ') || 'Location not added'} · {farm.area_acres ?? 0} acres</p></div></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-2xl border border-dashed border-[#2a3c33] p-5 text-center">
            <Sprout className="mx-auto h-7 w-7 text-emerald-500" />
            <p className="mt-2 font-semibold text-white">No farm records yet</p>
            <p className="mt-1 text-sm text-gray-400">Add a farm to start recording cultivations and harvests.</p>
          </div>
        )}

        <Link href="/farmer/farms" className="mt-5 flex items-center justify-between rounded-xl border border-emerald-800/60 bg-emerald-950/40 px-4 py-3 text-sm font-bold text-emerald-300 transition hover:bg-emerald-950">
          Open Farm Management <ChevronRight className="h-4 w-4" />
        </Link>
      </section>
    </main>
  );
}
