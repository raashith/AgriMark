'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DeliveryAddress } from '@/types';
import { getDeliveryAddresses, setDefaultAddress, deleteDeliveryAddress } from '@/lib/delivery-addresses';
import { MapPin, Check, Plus, Navigation, X, Home, Sprout, Building, Edit3, Trash2, AlertTriangle } from 'lucide-react';

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
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [addressToDelete, setAddressToDelete] = useState<DeliveryAddress | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      void fetchAddresses();
    }
  }, [isOpen]);

  const fetchAddresses = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const list = await getDeliveryAddresses();
      setAddresses(list);
    } catch (err: any) {
      setAddresses([]);
      setErrorMsg(err?.message || 'Failed to load saved delivery addresses.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (addr: DeliveryAddress) => {
    try {
      await setDefaultAddress(addr.id);
      onAddressSelect(addr);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to set default address.');
    }
  };

  const handleEdit = (addrId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
    router.push(`/auth/location/edit/${addrId}`);
  };

  const handleDeleteClick = (addr: DeliveryAddress, e: React.MouseEvent) => {
    e.stopPropagation();
    setAddressToDelete(addr);
  };

  const handleConfirmDelete = async () => {
    if (!addressToDelete) return;
    setDeletingId(addressToDelete.id);
    setErrorMsg('');
    try {
      await deleteDeliveryAddress(addressToDelete.id);
      setAddressToDelete(null);
      await fetchAddresses();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete address.');
    } finally {
      setDeletingId(null);
    }
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
              <p className="text-[11px] text-gray-400">Manage and select your delivery addresses</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-xl bg-[#0a0f0d] border border-[#1e2d26]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-950/80 border border-red-800 text-red-200 text-xs rounded-2xl flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

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
        <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
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
                  className={`p-3.5 rounded-2xl border transition flex flex-col gap-2.5 ${
                    isSelected
                      ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                      : 'bg-[#0a0f0d] border-[#1e2d26] text-gray-300 hover:border-emerald-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <div className="p-1.5 bg-[#121a16] border border-[#1e2d26] rounded-xl text-emerald-400 shrink-0 mt-0.5">
                        <IconComp className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5 text-xs">
                        <div className="flex items-center gap-2 font-bold text-white">
                          <span>{addr.label || 'Home'}</span>
                          <span className="text-[10px] text-gray-400 font-normal">({addr.full_name})</span>
                          {addr.is_default && (
                            <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 text-[9px] font-bold rounded-full border border-emerald-800">
                              Default
                            </span>
                          )}
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
                      <div className="p-1 bg-emerald-500 rounded-full text-black shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>

                  {/* Actions: Select / Edit / Delete */}
                  <div className="flex items-center justify-between border-t border-[#1e2d26]/80 pt-2 text-xs">
                    {!isSelected ? (
                      <button
                        onClick={() => handleSelect(addr)}
                        className="text-emerald-400 font-bold hover:underline text-[11px]"
                      >
                        Deliver here
                      </button>
                    ) : (
                      <span className="text-[11px] text-emerald-400 font-bold">✓ Active delivery location</span>
                    )}

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleEdit(addr.id, e)}
                        className="px-2.5 py-1 bg-[#121a16] hover:bg-[#18241f] border border-[#1e2d26] text-gray-300 hover:text-white rounded-xl text-[11px] font-semibold flex items-center gap-1 transition"
                      >
                        <Edit3 className="w-3 h-3 text-emerald-400" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={(e) => handleDeleteClick(addr, e)}
                        disabled={deletingId === addr.id}
                        className="px-2.5 py-1 bg-[#121a16] hover:bg-red-950/60 border border-[#1e2d26] hover:border-red-800 text-gray-400 hover:text-red-300 rounded-xl text-[11px] font-semibold flex items-center gap-1 transition disabled:opacity-50"
                      >
                        <Trash2 className="w-3 h-3 text-red-400" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
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
          <span>+ Add new address</span>
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {addressToDelete && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90">
          <div className="bg-[#121a16] border border-red-800/80 rounded-3xl max-w-xs w-full p-6 text-center space-y-4 shadow-2xl">
            <AlertTriangle className="w-10 h-10 text-red-400 mx-auto" />
            <h4 className="text-base font-bold text-white">Delete this delivery address?</h4>
            <p className="text-xs text-gray-400">
              {addressToDelete.house_number}, {addressToDelete.street}, {addressToDelete.city}
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setAddressToDelete(null)}
                className="flex-1 py-2.5 bg-[#0a0f0d] border border-[#1e2d26] text-gray-300 rounded-2xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deletingId === addressToDelete.id}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white rounded-2xl text-xs font-bold shadow"
              >
                {deletingId === addressToDelete.id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
