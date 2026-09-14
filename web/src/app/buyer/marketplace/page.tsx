'use client';

import React, { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n';
import { api } from '@/lib/api';
import { Listing, MarketPriceObservation } from '@/types';
import { ShoppingBag, Search, MapPin, CheckCircle2, AlertCircle } from 'lucide-react';

export default function MarketplacePage() {
  const { t } = useI18n();
  const [listings, setListings] = useState<Listing[]>([]);
  const [prices, setPrices] = useState<MarketPriceObservation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('All');
  const [loading, setLoading] = useState(true);
  const [activeListing, setActiveListing] = useState<Listing | null>(null);
  const [orderQty, setOrderQty] = useState('');
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [orderMessage, setOrderMessage] = useState('');

  useEffect(() => {
    fetchMarketplaceData();
  }, []);

  const fetchMarketplaceData = async () => {
    try {
      const [listingsRes, pricesRes] = await Promise.allSettled([
        api.getListings(),
        api.getMarketPrices(),
      ]);
      if (listingsRes.status === 'fulfilled') setListings(listingsRes.value);
      if (pricesRes.status === 'fulfilled') setPrices(pricesRes.value);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getCropName = (item: Listing) => item.crop_name || item.title || 'Produce';
  const getLocation = (item: Listing) => item.location || 'Location not set';
  const getMinOrder = (item: Listing) => item.min_order_quantity_kg ?? item.min_order_quantity ?? 0;
  const getAvailableQty = (item: Listing) => item.quantity_available_kg ?? 0;
  const getPricePerKg = (item: Listing) => item.price_per_kg ?? item.price_per_unit ?? 0;

  const filteredListings = listings.filter((item) => {
    const cropName = getCropName(item).toLowerCase();
    const location = getLocation(item).toLowerCase();
    const matchesSearch = cropName.includes(searchTerm.toLowerCase()) || location.includes(searchTerm.toLowerCase());
    const matchesCrop = selectedCrop === 'All' || cropName.includes(selectedCrop.toLowerCase());
    return matchesSearch && matchesCrop;
  });

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeListing) return;
    const minOrder = getMinOrder(activeListing);
    const availableQty = getAvailableQty(activeListing);
    const qty = parseFloat(orderQty);
    if (!qty || qty < minOrder) {
      setOrderMessage(`Error: Minimum order quantity is ${minOrder} KG.`);
      return;
    }
    if (qty > availableQty) {
      setOrderMessage(`Error: Requested quantity exceeds available inventory (${availableQty} KG).`);
      return;
    }
    setOrderSubmitting(true);
    setOrderMessage('');
    try {
      await api.placeOrder({
        listing_id: activeListing.id,
        quantity: qty,
        unit: 'kg',
      });
      setOrderMessage('Order placed successfully!');
      setTimeout(() => {
        setActiveListing(null);
        fetchMarketplaceData();
      }, 1200);
    } catch (err: any) {
      setOrderMessage(`Error: ${err.message}`);
    } finally {
      setOrderSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#121a16] border border-[#1e2d26] p-6 rounded-2xl shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-100 flex items-center gap-2"><ShoppingBag className="w-6 h-6 text-emerald-400" /> Direct Farm Marketplace</h1>
            <p className="text-sm text-gray-400">Buy fresh produce directly from verified farmers with transparent price signals.</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3.5 top-3 text-gray-500" />
            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search by crop, commodity, or location..." className="w-full pl-10 pr-4 py-2.5 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl text-sm text-white focus:border-emerald-500 focus:outline-none" />
          </div>
          <select value={selectedCrop} onChange={(e) => setSelectedCrop(e.target.value)} className="px-4 py-2.5 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl text-sm text-white focus:border-emerald-500 focus:outline-none">
            <option value="All">All Crops</option><option value="Tomato">Tomato</option><option value="Onion">Onion</option><option value="Potato">Potato</option><option value="Paddy">Paddy / Rice</option><option value="Banana">Banana</option>
          </select>
        </div>
      </div>

      {loading ? <p className="text-sm text-gray-400 text-center py-8">{t('loading')}</p> : filteredListings.length === 0 ? (
        <div className="p-8 bg-[#121a16] border border-dashed border-[#1e2d26] rounded-2xl text-center text-sm text-gray-400">No marketplace listings found matching your search.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map((item) => {
            const cropName = getCropName(item);
            const location = getLocation(item);
            const minOrder = getMinOrder(item);
            const availableQty = getAvailableQty(item);
            const pricePerKg = getPricePerKg(item);
            return (
              <div key={item.id} className="bg-[#121a16] border border-[#1e2d26] p-5 rounded-2xl shadow-md space-y-4 hover:border-emerald-800/60 transition flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex justify-between items-start"><div><h3 className="font-bold text-lg text-emerald-300">{cropName}</h3><p className="text-xs text-gray-400 flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-emerald-400" /> {location}</p></div><span className="text-xs px-2 py-1 bg-emerald-950 text-emerald-300 border border-emerald-800/40 rounded font-mono font-bold">{item.quality_grade || 'Quality verified'}</span></div>
                  <div className="p-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl text-xs space-y-1.5"><div className="flex justify-between items-center text-gray-300 font-semibold"><span>{t('askingPrice')}:</span><span className="text-base font-extrabold text-emerald-400">₹{pricePerKg} / KG</span></div><div className="pt-1 border-t border-[#1e2d26] flex justify-between text-[11px] text-gray-400"><span>{t('marketReference')}:</span><span className="font-mono text-amber-300">Live reference when available</span></div><div className="flex justify-between text-[11px] text-gray-400"><span>{t('aiIntelligence')}:</span><span className="font-mono text-purple-300">Decision support only</span></div></div>
                  <div className="text-xs text-gray-400 space-y-1 pt-1 font-mono"><p>Available Inventory: <strong>{availableQty} KG</strong></p><p>Min Order Qty: <strong>{minOrder} KG</strong></p><p className="text-gray-500">Seller: {item.seller_name || 'Verified Farmer'}</p></div>
                </div>
                <button onClick={() => { setActiveListing(item); setOrderQty(String(minOrder)); setOrderMessage(''); }} className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl shadow transition">{t('placeOrder')}</button>
              </div>
            );
          })}
        </div>
      )}

      {activeListing && (() => {
        const minOrder = getMinOrder(activeListing);
        const availableQty = getAvailableQty(activeListing);
        const pricePerKg = getPricePerKg(activeListing);
        return (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"><div className="bg-[#121a16] border border-[#1e2d26] p-6 rounded-2xl max-w-md w-full shadow-2xl space-y-4"><div className="flex justify-between items-center border-b border-[#1e2d26] pb-3"><h3 className="font-bold text-lg text-emerald-300">Place Wholesale Order</h3><button onClick={() => setActiveListing(null)} className="text-gray-400 hover:text-white">✕</button></div>
            {orderMessage && <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${orderMessage.startsWith('Error') ? 'bg-red-950/60 border border-red-800 text-red-300' : 'bg-emerald-950/60 border border-emerald-800 text-emerald-300'}`}>{orderMessage.startsWith('Error') ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}<span>{orderMessage}</span></div>}
            <div className="space-y-2 text-xs text-gray-300 font-mono bg-[#0a0f0d] p-3 rounded-xl border border-[#1e2d26]"><p><strong>Produce:</strong> {getCropName(activeListing)}</p><p><strong>Asking Price:</strong> ₹{pricePerKg} / KG</p><p><strong>Available Qty:</strong> {availableQty} KG</p><p><strong>Min Order Qty:</strong> {minOrder} KG</p></div>
            <form onSubmit={handlePlaceOrder} className="space-y-4"><div><label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Order Quantity (KG)</label><input type="number" required min={minOrder} max={availableQty} value={orderQty} onChange={(e) => setOrderQty(e.target.value)} className="w-full px-4 py-2.5 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl text-white focus:border-emerald-500 focus:outline-none" /></div><div className="p-3 bg-emerald-950/40 border border-emerald-800/40 rounded-xl flex justify-between items-center text-sm font-bold text-emerald-300"><span>Total Amount:</span><span>₹{((parseFloat(orderQty) || 0) * pricePerKg).toFixed(2)}</span></div><div className="flex gap-3"><button type="button" onClick={() => setActiveListing(null)} className="flex-1 py-2.5 bg-[#0a0f0d] border border-[#1e2d26] text-gray-300 font-semibold rounded-xl">Cancel</button><button type="submit" disabled={orderSubmitting} className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow transition">{orderSubmitting ? t('loading') : 'Confirm Order'}</button></div></form>
          </div></div>
        );
      })()}
    </div>
  );
}
