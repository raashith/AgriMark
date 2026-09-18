'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DeliveryAddress } from '@/types';
import { getDeliveryAddresses, setDefaultAddress } from '@/lib/delivery-addresses';
import { MapPin, Check, Plus, Navigation, X, Home, Sprout, Building } from 'lucide-react';

interface LocationSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAddress: DeliveryAddress | null;
  onAddressSelect: (addr: DeliveryAddress) => void;
}

export const LocationSelectorModal: React.FC<LocationSelectorModalProps> = ({
  isOpen,
  onClose,
  currentAddress,
  onAddressSelect,
}) => {
  const router = useRouter();
  const [addresses, setAddresses] = useState<DeliveryAddress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      void fetchAddresses();
    }
  }, [isOpen]);

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const list = await getDeliveryAddresses();
      setAddresses(list);
    } catch {
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (addr: DeliveryAddress) => {
    await setDefaultAddress(addr.id);
    onAddressSelect(addr);
    onClose();
  };

  const handleAddNew = () => {
    onClose();
    router.push('/auth/location');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#121a16] border border-[#1e2d26] rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 relative">
        <div className="flex justify-between items-center border-b border-[#1e2d26] pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-950 border border-emerald-800/60 rounded-xl text-emerald-400">
              <MapPin className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base">Select Delivery Location</h3>
              <p className="text-[11px] text-gray-400">Choose where to deliver your agricultural produce</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-xl bg-[#0a0f0d] border border-[#1e2d26]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Options */}
        <div className="space-y-2">
          <button
            onClick={handleAddNew}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-2xl text-xs flex items-center justify-center gap-2 shadow transition"
          >
            <Navigation className="w-4 h-4" />
            <span>Use Current Location / Add New Address</span>
          </button>
        </div>

        {/* Saved Addresses List */}
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          <span className="text-[10px] font-mono font-bold uppercase text-gray-400 block">Saved Delivery Addresses</span>
          {loading ? (
            <p className="text-xs text-gray-400 text-center py-4">Loading saved locations...</p>
          ) : addresses.length === 0 ? (
            <div className="p-4 bg-[#0a0f0d] border border-dashed border-[#1e2d26] rounded-2xl text-center text-xs text-gray-400">
              No saved delivery addresses found.
            </div>
          ) : (
            addresses.map((addr) => {
              const isSelected = currentAddress?.id === addr.id || addr.is_default;
              const IconComp = addr.label === 'Farm' ? Sprout : addr.label === 'Other' ? Building : Home;
              return (
                <div
                  key={addr.id}
                  onClick={() => handleSelect(addr)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-start justify-between gap-3 ${
                    isSelected
                      ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                      : 'bg-[#0a0f0d] border-[#1e2d26] text-gray-300 hover:border-emerald-800'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="p-1.5 bg-[#121a16] border border-[#1e2d26] rounded-xl text-emerald-400 shrink-0 mt-0.5">
                      <IconComp className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5 text-xs">
                      <div className="flex items-center gap-2 font-bold text-white">
                        <span>{addr.label || 'Home'}</span>
                        <span className="text-[10px] text-gray-400 font-normal">({addr.full_name})</span>
                      </div>
                      <p className="text-gray-300 leading-tight">
                        {addr.house_number}, {addr.street}, {addr.area}
                      </p>
                      <p className="text-[11px] text-gray-400 font-mono">
                        {addr.city}, {addr.state} - {addr.postal_code}
                      </p>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="p-1 bg-emerald-500 rounded-full text-black shrink-0 mt-1">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Add Address CTA Button */}
        <button
          onClick={handleAddNew}
          className="w-full py-2.5 px-3 bg-[#0a0f0d] hover:bg-[#18241f] border border-[#1e2d26] text-gray-300 font-semibold text-xs rounded-2xl transition flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4 text-emerald-400" />
          <span>Add another address</span>
        </button>
      </div>
    </div>
  );
};
