'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { UserProfile } from '@/types';
import { supabase } from '@/lib/supabase';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Sprout, MapPin, ShieldCheck, ArrowRight } from 'lucide-react';

export default function FarmersDirectoryPage() {
  const [farmers, setFarmers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFarmers() {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .in('role', ['farmer', 'fpo']);
        if (!error && data) {
          setFarmers(data as UserProfile[]);
        }
      } catch {
      } finally {
        setLoading(false);
      }
    }
    loadFarmers();
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-[#121a16] border border-[#1e2d26] p-6 md:p-8 rounded-3xl space-y-2 shadow-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-950/80 border border-emerald-800/60 rounded-full text-xs font-mono font-bold text-emerald-400">
          <Sprout className="w-4 h-4" /> Verified Farmers & Producer Cooperatives
        </div>
        <h1 className="text-2xl md:text-4xl font-extrabold text-white">
          Verified AgriMark Farmers & FPOs
        </h1>
        <p className="text-sm text-gray-300 max-w-xl">
          Connect directly with progressive farmers, organic growers, and FPO cooperatives across India.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-56 rounded-3xl" />
          ))}
        </div>
      ) : farmers.length === 0 ? (
        <EmptyState
          title="No Registered Farmers Found"
          description="Verified farmers and producer cooperatives will appear here once registered."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {farmers.map((farmer) => (
            <div
              key={farmer.id}
              className="bg-[#121a16] border border-[#1e2d26] hover:border-emerald-800 rounded-3xl p-6 transition shadow-lg space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-emerald-950 border border-emerald-700 rounded-2xl flex items-center justify-center font-bold text-emerald-400 text-xl">
                    {farmer.full_name ? farmer.full_name[0] : 'F'}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-white">{farmer.full_name || 'AgriMark Farmer'}</h3>
                    <span className="text-[10px] font-mono font-bold uppercase text-emerald-400 px-2 py-0.5 bg-emerald-950 rounded-full border border-emerald-800/40">
                      {farmer.role}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{farmer.location || 'Location Not Specified'}</span>
                </div>

                <div className="p-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-2xl text-xs space-y-1">
                  <div className="flex justify-between text-gray-400">
                    <span>KYC Verification:</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> {farmer.kyc_status || 'unverified'}
                    </span>
                  </div>
                </div>
              </div>

              <Link
                href={`/farmer/${farmer.id}`}
                className="w-full py-2.5 bg-[#18241f] border border-[#2a3c33] hover:bg-emerald-600 text-gray-200 hover:text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2"
              >
                <span>View Farmer Profile & Lots</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
