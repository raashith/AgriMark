'use client';

import React from 'react';
import Link from 'next/link';
import { Listing } from '@/types';
import { StatusBadge } from './StatusBadge';
import { MapPin, ShieldCheck, ArrowRight, TrendingUp } from 'lucide-react';

export const ListingCard: React.FC<{ listing: Listing }> = ({ listing }) => {
  const price = listing.price_per_unit || listing.price_per_kg || 50;

  return (
    <div className="bg-[#121a16] border border-[#1e2d26] hover:border-emerald-700/80 rounded-3xl overflow-hidden transition-all duration-300 shadow-xl flex flex-col justify-between group">
      {/* Image & Header */}
      <div className="relative h-48 bg-[#0a0f0d] overflow-hidden">
        <img
          src={listing.images?.[0] || 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600'}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <StatusBadge status={listing.quality_grade || 'Grade A'} />
          <span className="px-2.5 py-0.5 bg-black/80 border border-white/10 text-white text-[10px] font-mono font-bold rounded-full backdrop-blur-md">
            {listing.crop_category || 'Produce'}
          </span>
        </div>

        <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-black/80 text-emerald-400 text-xs font-mono font-bold rounded-full flex items-center gap-1 backdrop-blur-md">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Verified Lot
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <h3 className="font-extrabold text-base text-white group-hover:text-emerald-300 transition line-clamp-2">
            {listing.title}
          </h3>

          <div className="flex items-center gap-2 text-xs text-gray-400">
            <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span className="truncate">{listing.location || 'Tamil Nadu'}</span>
          </div>

          <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
            {listing.description}
          </p>
        </div>

        {/* Pricing & CTA */}
        <div className="pt-3 border-t border-[#1e2d26] flex items-end justify-between">
          <div>
            <span className="text-[10px] uppercase font-mono text-gray-400">Asking Price</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-emerald-400">₹{price}</span>
              <span className="text-xs text-gray-400 font-mono">/ kg</span>
            </div>
            <span className="text-[10px] text-gray-500">Min Order: {listing.min_order_quantity_kg || 100} kg</span>
          </div>

          <Link
            href={`/product/${listing.id}`}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition"
          >
            <span>View Lot</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
