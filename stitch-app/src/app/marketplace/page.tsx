'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/PageHeader';
import { CardPanel } from '@/components/ui/CardPanel';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button, Input } from '@/components/ui/InputControls';
import { Store, Search, Filter, ShieldCheck, MapPin, Tag, ArrowRight } from 'lucide-react';

export default function LiveMarketplacePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('all');

  const listings = [
    {
      id: 'LST-9921',
      crop: 'Red Onion (Bhima Super)',
      quantityKg: 10000,
      pricePerKg: 26,
      mandiRefPrice: 24.5,
      grade: 'Grade A',
      seller: 'Ramesh Patil (Ganesh Farm)',
      district: 'Nashik',
      state: 'Maharashtra',
      trustScore: 98,
      moisturePct: 11.5,
      photo: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=400',
    },
    {
      id: 'LST-8812',
      crop: 'Bhagwa Pomegranate',
      quantityKg: 3500,
      pricePerKg: 85,
      mandiRefPrice: 80,
      grade: 'Grade A',
      seller: 'Suresh More (Solapur Agro)',
      district: 'Solapur',
      state: 'Maharashtra',
      trustScore: 95,
      moisturePct: 14.0,
      photo: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400',
    },
    {
      id: 'LST-7714',
      crop: 'Sharbati Wheat',
      quantityKg: 25000,
      pricePerKg: 32,
      mandiRefPrice: 30.5,
      grade: 'Grade B',
      seller: 'Narmada Kisan FPO',
      district: 'Hoshangabad',
      state: 'Madhya Pradesh',
      trustScore: 92,
      moisturePct: 10.2,
      photo: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400',
    },
  ];

  const filteredListings = listings.filter((item) => {
    const matchesSearch = item.crop.toLowerCase().includes(searchTerm.toLowerCase()) || item.district.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade = selectedGrade === 'all' || item.grade === selectedGrade;
    return matchesSearch && matchesGrade;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="AgriMark Live Mandi Marketplace"
        subtitle="Direct trade of NABL assayed produce lots with Bharat Mandi Escrow protection."
        action={
          <Link href="/marketplace/new">
            <Button size="md">
              <Tag className="w-4 h-4" />
              <span>List Your Produce</span>
            </Button>
          </Link>
        }
      />

      {/* Search & Filter Bar */}
      <div className="bg-white border border-[#E7E5DC] p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search crop, variety, or district..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#F6F4ED] border border-[#E7E5DC] rounded-xl text-xs outline-none focus:border-[#1B4D3E]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-[#1B4D3E]" />
          <span className="text-xs font-bold text-[#19201D]">Grade:</span>
          {['all', 'Grade A', 'Grade B'].map((g) => (
            <button
              key={g}
              onClick={() => setSelectedGrade(g)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition capitalize ${
                selectedGrade === g
                  ? 'bg-[#1B4D3E] text-white'
                  : 'bg-[#F6F4ED] text-gray-600 hover:bg-gray-200'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Listings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredListings.map((item) => (
          <CardPanel key={item.id} className="hover:border-[#1B4D3E]/40 transition space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#1B4D3E]">{item.id}</span>
                <StatusBadge status={item.grade} />
              </div>

              <div>
                <h3 className="text-lg font-bold text-[#19201D]">{item.crop}</h3>
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-[#1B4D3E]" /> {item.district}, {item.state}
                </p>
              </div>

              <div className="p-3 bg-[#F6F4ED] rounded-xl space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Available Lot:</span>
                  <span className="font-mono font-extrabold text-[#19201D]">{item.quantityKg.toLocaleString()} kg</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-gray-500">Asking Price:</span>
                  <span className="font-mono font-extrabold text-base text-[#1B4D3E]">₹{item.pricePerKg} / kg</span>
                </div>
                <div className="flex justify-between text-[11px] text-gray-500 border-t border-[#E7E5DC] pt-1">
                  <span>Mandi Reference:</span>
                  <span className="font-mono font-bold text-emerald-700">₹{item.mandiRefPrice} / kg</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-gray-600 font-medium">{item.seller}</span>
                <span className="font-mono text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                  Trust: {item.trustScore}%
                </span>
              </div>
            </div>

            <Link href={`/marketplace/listing/${item.id}`} className="pt-2">
              <Button size="md" className="w-full">
                <span>Inspect Passport & Buy</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardPanel>
        ))}
      </div>
    </div>
  );
}
