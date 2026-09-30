'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Listing } from '@/types';
import { dataService } from '@/lib/data-service';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { Search, Filter, ShoppingCart, MapPin, Tag, ShieldCheck, ArrowRight, Star } from 'lucide-react';

import { StitchListingCard } from '@/components/stitch/marketplace/StitchListingCard';

export default function MarketplacePage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [district, setDistrict] = useState('All');
  const [grade, setGrade] = useState('All');
  const [sort, setSort] = useState('newest');

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      try {
        const data = await dataService.getListings({
          search,
          category,
          district,
          grade,
          sort,
        });
        setListings(data);
      } catch {
        setListings([]);
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, [search, category, district, grade, sort]);

  const categories = ['All', 'Cereals', 'Spices', 'Vegetables', 'Fruits', 'Pulses', 'Cash Crops'];
  const districts = ['All', 'Thanjavur', 'Erode', 'Guntur', 'Coimbatore', 'Bengaluru'];
  const grades = ['All', 'Grade A', 'Export Quality', 'Grade B'];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#121a16] border border-[#1e2d26] p-6 md:p-8 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-950/80 border border-emerald-800/60 rounded-full text-xs font-mono font-bold text-emerald-400">
            <ShoppingCart className="w-4 h-4" /> Direct Farm Produce Marketplace
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight">
            Discover Verified Farmer Produce Lots
          </h1>
          <p className="text-sm text-gray-300 max-w-xl">
            Direct trade from verified Indian farmers and FPOs with digital produce passports, quality assaying, and transparent prices.
          </p>
        </div>

        <Link
          href="/buyer/rfqs"
          className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg flex items-center gap-2 transition shrink-0"
        >
          <span>Post Bulk RFQ</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 bg-[#121a16] border border-[#1e2d26] rounded-2xl space-y-4 shadow-md">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by crop name (e.g. Turmeric, Paddy, Cotton), seller, or location..."
              className="w-full pl-11 pr-4 py-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none text-sm font-medium"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="px-3.5 py-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl text-white text-xs font-semibold focus:border-emerald-500 focus:outline-none"
            >
              <option value="All">All Regions</option>
              {districts.filter((d) => d !== 'All').map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="px-3.5 py-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl text-white text-xs font-semibold focus:border-emerald-500 focus:outline-none"
            >
              <option value="All">All Quality Grades</option>
              {grades.filter((g) => g !== 'All').map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-3.5 py-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl text-white text-xs font-semibold focus:border-emerald-500 focus:outline-none"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <span className="text-xs font-mono font-bold text-gray-400 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-emerald-400" /> Categories:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                category === cat
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-[#0a0f0d] border border-[#1e2d26] text-gray-300 hover:border-emerald-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product Listings Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : listings.length === 0 ? (
        <div className="p-12 text-center bg-[#121a16] border border-[#1e2d26] rounded-3xl space-y-3">
          <ShoppingCart className="w-12 h-12 text-gray-600 mx-auto" />
          <h3 className="text-lg font-bold text-gray-200">No Produce Listings Found</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            Try adjusting your search terms or filters to find available farmer produce lots.
          </p>
          <button
            onClick={() => { setSearch(''); setCategory('All'); setDistrict('All'); setGrade('All'); }}
            className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-500 transition"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((item) => (
            <StitchListingCard
              key={item.id}
              id={item.id}
              title={item.title}
              commodityName={item.crop_category || 'Produce'}
              pricePerKg={item.price_per_unit || item.price_per_kg || 40}
              quantityKg={item.quantity_available_kg || item.min_order_quantity_kg || 500}
              qualityGrade={item.quality_grade || 'Grade A'}
              location={item.location || 'Tamil Nadu'}
              sellerName="Verified Farmer"
              verified={true}
              imageUrl={item.images?.[0]}
            />
          ))}
        </div>
      )}
    </div>
  );
}
