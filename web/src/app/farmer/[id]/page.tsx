'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { UserProfile, Listing } from '@/types';
import { SEED_PROFILES } from '@/lib/seed-data';
import { dataService } from '@/lib/data-service';
import { Sprout, MapPin, ShieldCheck, ArrowLeft, ShoppingCart, Award } from 'lucide-react';

export default function FarmerProfileDetailPage() {
  const { id } = useParams() as { id: string };
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);

  useEffect(() => {
    const found = SEED_PROFILES.find((p) => p.id === id) || SEED_PROFILES[0];
    setProfile(found);
    dataService.getListings().then((all) => {
      setListings(all.filter((l) => l.seller_id === found.id || l.seller_id === 'user-farmer-01'));
    });
  }, [id]);

  if (!profile) return null;

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
              <h1 className="text-2xl font-extrabold text-white">{profile.full_name}</h1>
              <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{profile.location || 'Thanjavur, Tamil Nadu'}</span>
              </div>
            </div>
          </div>

          <span className="px-3.5 py-1.5 bg-emerald-950/80 border border-emerald-800 text-emerald-400 text-xs font-mono font-bold rounded-full flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" /> Verified Progressive Farmer
          </span>
        </div>

        {/* Farm Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-[#0a0f0d] border border-[#1e2d26] rounded-2xl">
            <span className="text-[10px] uppercase font-mono text-gray-400">Total Farm Area</span>
            <p className="text-lg font-bold text-white mt-1">6.5 Acres</p>
          </div>
          <div className="p-4 bg-[#0a0f0d] border border-[#1e2d26] rounded-2xl">
            <span className="text-[10px] uppercase font-mono text-gray-400">Primary Soil</span>
            <p className="text-lg font-bold text-white mt-1">Clay Loam</p>
          </div>
          <div className="p-4 bg-[#0a0f0d] border border-[#1e2d26] rounded-2xl">
            <span className="text-[10px] uppercase font-mono text-gray-400">Irrigation</span>
            <p className="text-lg font-bold text-white mt-1">Canal & Drip</p>
          </div>
          <div className="p-4 bg-[#0a0f0d] border border-[#1e2d26] rounded-2xl">
            <span className="text-[10px] uppercase font-mono text-gray-400">Organic Practice</span>
            <p className="text-lg font-bold text-emerald-400 mt-1">Certified NPOP</p>
          </div>
        </div>
      </div>

      {/* Active Listings */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-emerald-400" /> Active Harvest Produce Lots ({listings.length})
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {listings.map((item) => (
            <div key={item.id} className="bg-[#121a16] border border-[#1e2d26] rounded-2xl p-5 space-y-3">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-base text-white">{item.title}</h3>
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800">
                  ₹{item.price_per_unit}/kg
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
      </div>
    </div>
  );
}
