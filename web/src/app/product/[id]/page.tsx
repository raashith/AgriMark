'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Listing } from '@/types';
import { dataService } from '@/lib/data-service';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  ShoppingCart,
  MapPin,
  ShieldCheck,
  Award,
  ArrowLeft,
  MessageSquare,
} from 'lucide-react';

export default function ProductDetailPage() {
  const { id } = useParams() as { id: string };
  const { user, isAuthenticated } = useAuth();
  const { showSuccess, showError } = useToast();
  const router = useRouter();

  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);

  // Order Modal
  const [isOrderOpen, setIsOrderOpen] = useState(false);
  const [orderQty, setOrderQty] = useState<number>(500);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchListing = async () => {
      setLoading(true);
      try {
        const item = await dataService.getListingById(id);
        setListing(item);
        if (item?.min_order_quantity_kg) setOrderQty(item.min_order_quantity_kg);
      } catch {
        setListing(null);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchListing();
  }, [id]);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!listing) return;
    if (!isAuthenticated || !user?.id) {
      router.push(`/auth/login?redirect=/product/${listing.id}`);
      return;
    }
    if (!deliveryAddress.trim()) {
      showError('Please enter a delivery address for logistics calculation.');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await dataService.createOrder({
        listing_id: listing.id,
        listing_title: listing.title,
        buyer_id: user.id,
        buyer_name: user.full_name || 'Buyer',
        seller_id: listing.seller_id,
        seller_name: listing.seller_name || 'Farmer',
        quantity_kg: Number(orderQty),
        unit_price: listing.price_per_unit || listing.price_per_kg || 50,
        delivery_address: deliveryAddress,
      });

      if (created) {
        showSuccess('Order Placed Successfully!', `Order for ${orderQty} kg of ${listing.crop_name} sent to seller.`);
        setIsOrderOpen(false);
        router.push('/buyer/orders');
      } else {
        showError('Order Submission Failed', 'Database reservation failed.');
      }
    } catch (err: any) {
      showError('Failed to place order', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6 py-6">
        <Skeleton className="h-8 w-40 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="h-96 w-full rounded-3xl" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="max-w-2xl mx-auto my-12 py-8 text-center space-y-4">
        <EmptyState
          title="Listing Not Found"
          description="The requested produce lot listing does not exist or may have been removed."
        />
        <Link href="/marketplace" className="inline-block px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl">
          Back to Marketplace
        </Link>
      </div>
    );
  }

  const pricePerKg = listing.price_per_unit || listing.price_per_kg || 50;
  const totalPrice = orderQty * pricePerKg;

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-4">
      {/* Back Button */}
      <Link href="/marketplace" className="inline-flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-emerald-400 transition">
        <ArrowLeft className="w-4 h-4" /> Back to All Listings
      </Link>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Image Gallery & Quality Details */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-[#121a16] border border-[#1e2d26] rounded-3xl overflow-hidden shadow-2xl relative">
            <img
              src={listing.images?.[0] || 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800'}
              alt={listing.title}
              className="w-full h-96 object-cover"
            />
            <div className="absolute top-4 left-4 flex gap-2">
              <span className="px-3 py-1 bg-emerald-950/90 border border-emerald-700/80 text-emerald-300 font-mono text-xs font-bold rounded-full backdrop-blur-md">
                {listing.quality_grade || 'Grade A'}
              </span>
              <span className="px-3 py-1 bg-black/80 text-white font-mono text-xs font-bold rounded-full backdrop-blur-md">
                {listing.crop_category || 'Produce'}
              </span>
            </div>
          </div>

          {/* Quality Assaying & Details */}
          <div className="bg-[#121a16] border border-[#1e2d26] p-6 rounded-3xl space-y-4 shadow-md">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-400" /> Produce Specification & Details
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-2xl">
                <span className="text-[10px] text-gray-400 uppercase font-mono">Quality Grade</span>
                <p className="font-bold text-sm text-emerald-300">{listing.quality_grade || 'Grade A'}</p>
              </div>

              <div className="p-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-2xl">
                <span className="text-[10px] text-gray-400 uppercase font-mono">Available Vol</span>
                <p className="font-bold text-sm text-white">{listing.quantity_available_kg} kg</p>
              </div>

              <div className="p-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-2xl">
                <span className="text-[10px] text-gray-400 uppercase font-mono">Min Order</span>
                <p className="font-bold text-sm text-white">{listing.min_order_quantity_kg || 100} kg</p>
              </div>
            </div>

            {listing.description && (
              <p className="text-xs text-gray-300 bg-[#0a0f0d] p-3.5 rounded-2xl border border-[#1e2d26]">
                {listing.description}
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Title, Farmer Bio, Price, CTA */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#121a16] border border-[#1e2d26] p-6 rounded-3xl space-y-6 shadow-2xl">
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold uppercase text-emerald-400 px-2.5 py-0.5 bg-emerald-950 rounded-full border border-emerald-800/40">
                Active Lot #{listing.id}
              </span>
              <h1 className="text-2xl font-extrabold text-white leading-tight">{listing.title}</h1>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{listing.location || 'Location Not Specified'}</span>
              </div>
            </div>

            {/* Price Box */}
            <div className="p-4 bg-[#0a0f0d] border border-[#1e2d26] rounded-2xl space-y-1">
              <span className="text-xs font-mono uppercase text-gray-400">Direct Producer Price</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-emerald-400">₹{pricePerKg}</span>
                <span className="text-sm text-gray-400 font-mono">per kg</span>
              </div>
            </div>

            {/* Seller Info */}
            <div className="p-4 bg-[#18241f] border border-[#2a3c33] rounded-2xl flex items-center gap-3">
              <div className="w-12 h-12 bg-emerald-950 border border-emerald-700 rounded-2xl flex items-center justify-center font-bold text-emerald-400 text-lg shrink-0">
                {listing.seller_name ? listing.seller_name[0] : 'F'}
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-sm text-white">{listing.seller_name || 'AgriMark Producer'}</h4>
                <p className="text-xs text-emerald-400 font-medium">Verified Producer</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <button
                onClick={() => setIsOrderOpen(true)}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-2xl shadow-lg flex items-center justify-center gap-2 transition"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>Place Order / Procure Lot</span>
              </button>

              <Link
                href="/buyer/rfqs"
                className="w-full py-3 bg-[#0a0f0d] border border-[#1e2d26] hover:bg-[#18241f] text-gray-200 font-bold text-xs rounded-2xl transition flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>Submit Counter Offer / RFQ</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Order Modal */}
      <Modal
        isOpen={isOrderOpen}
        onClose={() => setIsOrderOpen(false)}
        title="Procure Produce Lot"
        subtitle={`Order direct from ${listing.seller_name || 'Producer'}`}
      >
        <form onSubmit={handlePlaceOrder} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Quantity (in kg)</label>
            <input
              type="number"
              min={listing.min_order_quantity_kg || 100}
              max={listing.quantity_available_kg || 10000}
              value={orderQty}
              onChange={(e) => setOrderQty(Number(e.target.value))}
              className="w-full px-4 py-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl text-white font-bold text-lg focus:border-emerald-500 focus:outline-none"
            />
            <p className="text-[11px] text-gray-400 mt-1">Minimum order: {listing.min_order_quantity_kg || 100} kg</p>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Delivery Address</label>
            <textarea
              required
              rows={3}
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              className="w-full px-4 py-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl text-white text-xs focus:border-emerald-500 focus:outline-none"
              placeholder="Enter full delivery warehouse / mill address..."
            />
          </div>

          {/* Pricing Summary */}
          <div className="p-4 bg-[#0a0f0d] border border-[#1e2d26] rounded-2xl space-y-2">
            <div className="flex justify-between text-xs text-gray-400">
              <span>Unit Price</span>
              <span>₹{pricePerKg} / kg</span>
            </div>
            <div className="flex justify-between text-xs text-gray-400">
              <span>Selected Quantity</span>
              <span>{orderQty} kg</span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-white pt-2 border-t border-[#1e2d26]">
              <span>Total Procurement Amount</span>
              <span className="text-emerald-400">₹{totalPrice.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg transition"
          >
            {isSubmitting ? 'Confirming Order...' : 'Confirm Order & Reservation'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
