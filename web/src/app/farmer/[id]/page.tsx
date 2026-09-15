'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { UserProfile, Listing, Farm } from '@/types';
import { dataService } from '@/lib/data-service';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Sprout, MapPin, ShieldCheck, ArrowLeft, ShoppingCart } from 'lucide-react';

export default function FarmerProfileDetailPage() {
  const { id } = useParams() as { id: string };
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFarmerDetail() {
      if (!id) return;
      try {
        const [prof, farmerFarms, allListings] = await Promise.all([
          dataService.getProfile(id),
          dataService.getFarms(id),
          dataService.getListings({ sellerId: id }),
        ]);

        if (prof) setProfile(prof);
        setFarms(farmerFarms);
        setListings(allListings);
      } catch {
      } finally {
        setLoading(false);
      }
    }
    loadFarmerDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6 py-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-48 rounded-3xl" />
        <Skeleton className="h-64 rounded-3xl" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-5xl mx-auto py-12 space-y-4">
        <Link href="/farmers" className="inline-flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-emerald-400 transition">
          <ArrowLeft className="w-4 h-4" /> Back to Farmers Directory
        </Link>
        <EmptyState
          title="Farmer Profile Not Found"
          description="The requested farmer profile does not exist or has been removed."
        />
      </div>
    );
  }

  const totalAcres = farms.reduce((acc, f) => acc + (f.area_acres || 0), 0);

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4">
      <Link href="/farmers" className="inline-flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-emerald-400 transition">
        <ArrowLeft className="w-4 h-4" /> Back to Farmers Directory
      </Link>

      <div className="bg-[#121a16] border border-[#1e2d26] p-6 md:p-8 rounded-3xl space-y-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#1e2d26] pb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-emerald-950 border border-emerald-700 rounded-3xl flex items-center justify-center font-bold text-emerald-400 text-2xl shadow-inner">
              {profile.full_name ? profile.full_name[0] : 'F'}
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white">{profile.full_name || 'AgriMark Farmer'}</h1>
              <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{profile.location || 'Location Not Specified'}</span>
              </div>
            </div>
          </div>

          <span className="px-3.5 py-1.5 bg-emerald-950/80 border border-emerald-800 text-emerald-400 text-xs font-mono font-bold rounded-full flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" /> KYC {profile.kyc_status || 'unverified'}
          </span>
        </div>

        {/* Farm Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-[#0a0f0d] border border-[#1e2d26] rounded-2xl">
            <span className="text-[10px] uppercase font-mono text-gray-400">Total Farm Area</span>
            <p className="text-lg font-bold text-white mt-1">{totalAcres} Acres</p>
          </div>
          <div className="p-4 bg-[#0a0f0d] border border-[#1e2d26] rounded-2xl">
            <span className="text-[10px] uppercase font-mono text-gray-400">Registered Farms</span>
            <p className="text-lg font-bold text-white mt-1">{farms.length} Farms</p>
          </div>
          <div className="p-4 bg-[#0a0f0d] border border-[#1e2d26] rounded-2xl">
            <span className="text-[10px] uppercase font-mono text-gray-400">Role</span>
            <p className="text-lg font-bold text-emerald-400 mt-1 uppercase">{profile.role}</p>
          </div>
        </div>
      </div>

      {/* Active Listings */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-emerald-400" /> Active Produce Lots ({listings.length})
        </h2>

        {listings.length === 0 ? (
          <EmptyState
            title="No Active Listings"
            description="This farmer has not posted any active produce listings yet."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {listings.map((item) => (
              <div key={item.id} className="bg-[#121a16] border border-[#1e2d26] rounded-2xl p-5 space-y-3">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-base text-white">{item.title}</h3>
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800">
                    ₹{item.price_per_unit || item.price_per_kg}/kg
                  </span>
                </div>
                <p className="text-xs text-gray-400">{item.description}</p>
                <div className="pt-2 flex justify-between items-center">
                  <span className="text-[11px] text-gray-400">Available: {item.quantity_available_kg} kg</span>
                  <Link href={`/product/${item.id}`} className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition">
                    View Lot
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
