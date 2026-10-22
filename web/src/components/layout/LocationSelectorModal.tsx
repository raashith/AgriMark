'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DeliveryAddress } from '@/types';
import { getDeliveryAddresses, setDefaultAddress, updateDeliveryAddress, deleteDeliveryAddress } from '@/lib/delivery-addresses';
import { MapPin, Check, Plus, Navigation, X, Home, Sprout, Building, Pencil, Trash2 } from 'lucide-react';

interface LocationSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAddress: DeliveryAddress | null;
  onAddressSelect: (addr: DeliveryAddress) => void;
}

type AddressDraft = Pick<DeliveryAddress,
  'label' | 'full_name' | 'phone' | 'house_number' | 'street' | 'area' | 'landmark' | 'city' | 'state' | 'postal_code' | 'delivery_instructions'
>;

const emptyDraft: AddressDraft = {
  label: 'Home', full_name: '', phone: '', house_number: '', street: '', area: '',
  landmark: null, city: '', state: '', postal_code: '', delivery_instructions: null,
};

export const LocationSelectorModal: React.FC<LocationSelectorModalProps> = ({
  isOpen,
  onClose,
  currentAddress,
  onAddressSelect,
}) => {
  const router = useRouter();
  const [addresses, setAddresses] = useState<DeliveryAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAddress, setEditingAddress] = useState<DeliveryAddress | null>(null);
  const [draft, setDraft] = useState<AddressDraft>(emptyDraft);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen) void fetchAddresses();
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
    const selected = { ...addr, is_default: true };
    setAddresses((prev) => prev.map((item) => ({ ...item, is_default: item.id === addr.id })));
    onAddressSelect(selected);
    onClose();
  };

  const handleAddNew = () => {
    onClose();
    router.push('/auth/location');
  };

  const beginEdit = (addr: DeliveryAddress) => {
    setEditingAddress(addr);
    setDraft({
      label: addr.label || 'Home', full_name: addr.full_name || '', phone: addr.phone || '',
      house_number: addr.house_number || '', street: addr.street || '', area: addr.area || '',
      landmark: addr.landmark || '', city: addr.city || '', state: addr.state || '',
      postal_code: addr.postal_code || '', delivery_instructions: addr.delivery_instructions || '',
    });
    setErrorMessage('');
  };

  const handleSaveEdit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingAddress) return;
    setSaving(true);
    setErrorMessage('');
    try {
      const updated = await updateDeliveryAddress(editingAddress.id, draft);
      setAddresses((prev) => prev.map((addr) => addr.id === updated.id ? updated : addr));
      if (currentAddress?.id === updated.id) onAddressSelect(updated);
      setEditingAddress(null);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not save this address. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (addr: DeliveryAddress) => {
    const confirmed = window.confirm(`Delete the ${addr.label || 'saved'} address at ${addr.house_number}, ${addr.street}, ${addr.city}?`);
    if (!confirmed) return;
    try {
      await deleteDeliveryAddress(addr.id);
      const remaining = addresses.filter((item) => item.id !== addr.id);
      setAddresses(remaining);
      if (currentAddress?.id === addr.id) {
        const next = remaining[0] || null;
        if (next) {
          await setDefaultAddress(next.id);
          onAddressSelect({ ...next, is_default: true });
        }
      }
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Could not delete this address.');
    }
  };

  const updateDraft = (key: keyof AddressDraft, value: string) => {
    setDraft((previous) => ({ ...previous, [key]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#121a16] border border-[#1e2d26] rounded-3xl max-w-md w-full p-5 shadow-2xl space-y-4 relative">
        <div className="flex justify-between items-center border-b border-[#1e2d26] pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-950 border border-emerald-800/60 rounded-xl text-emerald-400">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base">Select Delivery Location</h3>
              <p className="text-[11px] text-gray-400">Choose where to deliver your agricultural produce</p>
            </div>
          </div>
          <button type="button" aria-label="Close delivery locations" onClick={onClose} className="p-1.5 text-gray-400 hover:text-white rounded-xl bg-[#0a0f0d] border border-[#1e2d26]">
            <X className="w-4 h-4" />
          </button>
        </div>

        <button type="button" onClick={handleAddNew} className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-2xl text-xs flex items-center justify-center gap-2 shadow transition">
          <Navigation className="w-4 h-4" />
          <span>Use Current Location / Add New Address</span>
        </button>

        {editingAddress ? (
          <form onSubmit={handleSaveEdit} className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-white">Edit delivery address</span>
              <button type="button" onClick={() => setEditingAddress(null)} className="text-xs text-gray-400 hover:text-white">Cancel</button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {([
                ['label', 'Address label'], ['full_name', 'Full name'], ['phone', 'Phone'],
                ['house_number', 'House / Door no.'], ['street', 'Street'], ['area', 'Area'],
                ['city', 'City / Town'], ['state', 'State'], ['postal_code', 'PIN code'],
                ['landmark', 'Landmark'],
              ] as [keyof AddressDraft, string][]).map(([key, label]) => (
                <label key={key} className="space-y-1 text-[11px] text-gray-400">
                  <span>{label}</span>
                  <input
                    value={String(draft[key] ?? '')}
                    onChange={(event) => updateDraft(key, event.target.value)}
                    required={!['landmark'].includes(key)}
                    className="w-full rounded-xl border border-[#294338] bg-[#0a0f0d] px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
                  />
                </label>
              ))}
              <label className="col-span-2 space-y-1 text-[11px] text-gray-400">
                <span>Delivery instructions (optional)</span>
                <textarea value={String(draft.delivery_instructions ?? '')} onChange={(event) => updateDraft('delivery_instructions', event.target.value)} className="w-full rounded-xl border border-[#294338] bg-[#0a0f0d] px-3 py-2 text-xs text-white outline-none focus:border-emerald-500" rows={2} />
              </label>
            </div>
            {errorMessage && <p role="alert" className="text-xs text-red-300">{errorMessage}</p>}
            <button type="submit" disabled={saving} className="w-full rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white disabled:opacity-60">
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </form>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            <span className="text-[10px] font-mono font-bold uppercase text-gray-400 block">Saved Delivery Addresses</span>
            {loading ? (
              <p className="text-xs text-gray-400 text-center py-4">Loading saved locations...</p>
            ) : addresses.length === 0 ? (
              <div className="p-4 bg-[#0a0f0d] border border-dashed border-[#1e2d26] rounded-2xl text-center text-xs text-gray-400">No saved delivery addresses found.</div>
            ) : addresses.map((addr) => {
              const isSelected = currentAddress ? currentAddress.id === addr.id : addresses.find((item) => item.is_default)?.id === addr.id || (!addresses.some((item) => item.is_default) && addresses[0]?.id === addr.id);
              const IconComp = addr.label === 'Farm' ? Sprout : addr.label === 'Other' ? Building : Home;
              return (
                <div key={addr.id} className={`p-3.5 rounded-2xl border transition flex items-start justify-between gap-2 ${isSelected ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300' : 'bg-[#0a0f0d] border-[#1e2d26] text-gray-300'}`}>
                  <button type="button" onClick={() => void handleSelect(addr)} aria-pressed={isSelected} className="flex min-w-0 flex-1 items-start gap-2.5 text-left">
                    <div className="p-1.5 bg-[#121a16] border border-[#1e2d26] rounded-xl text-emerald-400 shrink-0 mt-0.5"><IconComp className="w-4 h-4" /></div>
                    <div className="space-y-0.5 text-xs min-w-0">
                      <div className="flex flex-wrap items-center gap-2 font-bold text-white">
                        <span>{addr.label || 'Home'}</span>
                        <span className="text-[10px] text-gray-400 font-normal">({addr.full_name})</span>
                        {isSelected && <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[9px] uppercase tracking-wide text-emerald-300">Selected</span>}
                      </div>
                      <p className="text-gray-300 leading-tight">{addr.house_number}, {addr.street}, {addr.area}</p>
                      <p className="text-[11px] text-gray-400 font-mono">{addr.city}, {addr.state} - {addr.postal_code}</p>
                    </div>
                  </button>
                  <div className="flex shrink-0 items-center gap-1">
                    {isSelected && <span className="p-1 bg-emerald-500 rounded-full text-black"><Check className="w-3.5 h-3.5" /></span>}
                    <button type="button" aria-label={`Edit ${addr.label || 'saved'} address`} title="Edit address" onClick={() => beginEdit(addr)} className="rounded-lg p-1.5 text-gray-400 hover:bg-emerald-950 hover:text-emerald-300"><Pencil className="w-3.5 h-3.5" /></button>
                    <button type="button" aria-label={`Delete ${addr.label || 'saved'} address`} title="Delete address" onClick={() => void handleDelete(addr)} className="rounded-lg p-1.5 text-gray-400 hover:bg-red-950 hover:text-red-300"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!editingAddress && (
          <button type="button" onClick={handleAddNew} className="w-full py-2.5 px-3 bg-[#0a0f0d] hover:bg-[#18241f] border border-[#1e2d26] text-gray-300 font-semibold text-xs rounded-2xl transition flex items-center justify-center gap-2">
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>Add another address</span>
          </button>
        )}
      </div>
    </div>
  );
};
