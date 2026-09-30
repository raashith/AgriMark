import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, ShieldCheck, Tag, ArrowRight } from 'lucide-react';
import { StitchBadge } from '../common/StitchBadge';

export interface StitchListingCardProps {
  id: string;
  title: string;
  commodityName: string;
  pricePerKg: number;
  quantityKg: number;
  qualityGrade?: string;
  location?: string;
  sellerName?: string;
  verified?: boolean;
  imageUrl?: string;
  onOrder?: () => void;
  className?: string;
}

export const StitchListingCard: React.FC<StitchListingCardProps> = ({
  id,
  title,
  commodityName,
  pricePerKg,
  quantityKg,
  qualityGrade = 'Grade A',
  location = 'Kallakurichi, TN',
  sellerName = 'Verified Farmer',
  verified = true,
  imageUrl,
  onOrder,
  className = '',
}) => {
  const pricePerQuintal = (pricePerKg * 100).toLocaleString('en-IN');

  return (
    <div
      className={`group bg-[#121A16] border border-[#1E2D26] hover:border-[#E5A93C]/60 rounded-2xl p-4 shadow-xl transition-all duration-300 flex flex-col justify-between ${className}`}
    >
      <div>
        <div className="relative h-40 w-full mb-3 rounded-xl overflow-hidden bg-[#0A0F0D] border border-[#1E2D26]">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-emerald-950/20 text-emerald-400 font-mono text-xs">
              [AgriMark Verified Lot]
            </div>
          )}
          <div className="absolute top-2 left-2 flex items-center gap-1.5">
            <StitchBadge label={qualityGrade} variant="gold" size="sm" />
            {verified && <StitchBadge label="VERIFIED" variant="emerald" size="sm" icon={<ShieldCheck className="w-3 h-3" />} />}
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
              {commodityName}
            </span>
            <span className="text-xs font-mono text-gray-400 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-emerald-500 shrink-0" />
              <span className="truncate max-w-[110px]">{location}</span>
            </span>
          </div>

          <h4 className="text-base font-extrabold text-white group-hover:text-[#FCE196] transition-colors truncate">
            {title}
          </h4>

          <p className="text-xs text-gray-400 truncate">Seller: {sellerName}</p>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-[#1E2D26] space-y-3">
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-[9px] font-mono uppercase text-gray-400 block">Price / Quintal</span>
            <span className="text-lg font-black font-mono text-[#FCE196]">₹{pricePerQuintal}</span>
            <span className="text-[10px] font-mono text-gray-400 ml-1">(₹{pricePerKg}/kg)</span>
          </div>
          <div className="text-right">
            <span className="text-[9px] font-mono uppercase text-gray-400 block">Available</span>
            <span className="text-xs font-mono font-bold text-emerald-400">{quantityKg} kg</span>
          </div>
        </div>

        <Link
          href={`/product/${id}`}
          onClick={onOrder}
          className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5"
        >
          <span>View Lot & Place Order</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
