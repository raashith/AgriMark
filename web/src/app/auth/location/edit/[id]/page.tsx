'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { DeliveryAddress } from '@/types';
import { getDeliveryAddresses, updateDeliveryAddress } from '@/lib/delivery-addresses';
import { MapPin, Check, AlertCircle, Home, Sprout, Building, ArrowLeft } from 'lucide-react';
import { RealGpsMap } from '@/components/location/RealGpsMap';

export default function EditDeliveryAddressPage() {
  const { user, refreshAddress } = useAuth();
  const router = useRouter();
  const params = useParams();
  const addressId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  // Mode: 'form' | 'map'
  const [mode, setMode] = useState<'form' | 'map'>('form');

  // Address fields
  const [label, setLabel] = useState<'Home' | 'Farm' | 'Other'>('Home');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [street, setStreet] = useState('');
  const [area, setArea] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [selectedPin, setSelectedPin] = useState<{ lat: number; lng: number } | null>(null);

  // Submit states
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    async function loadAddress() {
      if (!addressId) return;
      try {
        setLoading(true);
        setLoadError('');
        const addresses = await getDeliveryAddresses();
        const target = addresses.find((a) => a.id === addressId);
        if (!target) {
          setLoadError('Address not found.');
          return;
        }

        setLabel(target.label as any || 'Home');
        setFullName(target.full_name || '');
        setPhone(target.phone || '');
        setHouseNumber(target.house_number || '');
        setStreet(target.street || '');
        setArea(target.area || '');
        setLandmark(target.landmark || '');
        setCity(target.city || '');
        setState(target.state || '');
        setPostalCode(target.postal_code || '');
        setDeliveryInstructions(target.delivery_instructions || '');
        setIsDefault(!!target.is_default);
        if (target.latitude && target.longitude) {
          setSelectedPin({ lat: target.latitude, lng: target.longitude });
        }
      } catch (err: any) {
        setLoadError(err.message || 'Failed to load address.');
      } finally {
        setLoading(false);
      }
    }

    loadAddress();
  }, [addressId]);

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
        { headers: { 'Accept-Language': 'en' } }
      );
      if (!response.ok) return;
      const data = await response.json();
      const addr = data.address || {};
      if (addr.suburb || addr.neighbourhood || addr.village) setArea(addr.suburb || addr.neighbourhood || addr.village || '');
      if (addr.city || addr.town || addr.district) setCity(addr.city || addr.town || addr.district || '');
      if (addr.state) setState(addr.state || '');
      if (addr.postcode) setPostalCode(addr.postcode || '');
    } catch {
      // Ignore geocoding errors
    }
  };

  const handleConfirmMapPin = async () => {
    if (selectedPin) {
      await reverseGeocode(selectedPin.lat, selectedPin.lng);
    }
    setMode('form');
  };

  const handleUpdateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setFormError('');

    if (!fullName.trim()) return setFormError('Please enter full name.');
    if (!houseNumber.trim()) return setFormError('Please enter house / door / flat number.');
    if (!street.trim()) return setFormError('Please enter street or road.');
    if (!area.trim()) return setFormError('Please enter area or locality.');
    if (!city.trim()) return setFormError('Please enter city.');
    if (!state.trim()) return setFormError('Please enter state.');
    if (!postalCode.trim() || !/^\d{6}$/.test(postalCode.trim())) {
      return setFormError('Please enter a valid 6-digit PIN code.');
    }

    setSaving(true);
    try {
      await updateDeliveryAddress(addressId, {
        label,
        full_name: fullName.trim(),
        phone: phone.trim(),
        house_number: houseNumber.trim(),
        street: street.trim(),
        area: area.trim(),
        landmark: landmark.trim() || undefined,
        city: city.trim(),
        state: state.trim(),
        postal_code: postalCode.trim(),
        latitude: selectedPin?.lat ?? undefined,
        longitude: selectedPin?.lng ?? undefined,
        is_default: isDefault,
        delivery_instructions: deliveryInstructions.trim() || undefined,
      });

      await refreshAddress();
      router.back();
    } catch (err: any) {
      setFormError(err.message || 'Failed to update address.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center bg-[#0a0f0d] text-gray-400">
        <p className="text-sm font-semibold animate-pulse">Loading address details...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-[85vh] flex flex-col items-center justify-center p-4 bg-[#0a0f0d]">
        <div className="p-6 bg-[#121a16] border border-red-800/70 rounded-3xl text-center space-y-4 max-w-sm">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
          <h2 className="text-lg font-bold text-white">{loadError}</h2>
          <button
            onClick={() => router.back()}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl text-xs"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center px-4 py-8 bg-[#0a0f0d]">
      <div className="w-full max-w-lg bg-[#121a16] border border-[#1e2d26] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">

        <div className="flex items-center gap-3 border-b border-[#1e2d26] pb-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="p-2 bg-[#0a0f0d] border border-[#1e2d26] text-gray-400 hover:text-white rounded-xl transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-white">Edit Delivery Address</h1>
            <p className="text-xs text-gray-400">Update your saved location details</p>
          </div>
        </div>

        {mode === 'map' ? (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-gray-200">Adjust Location on Map</h2>
            <RealGpsMap
              center={selectedPin || { lat: 13.0827, lng: 80.2707 }}
              onPinChange={(lat, lng) => setSelectedPin({ lat, lng })}
            />
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setMode('form')}
                className="flex-1 py-3 bg-[#0a0f0d] border border-[#1e2d26] text-gray-300 font-bold rounded-2xl text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmMapPin}
                className="flex-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2"
              >
                <span>Confirm Pin Position</span>
                <Check className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleUpdateAddress} className="space-y-4">
            {formError && (
              <div className="p-3.5 bg-red-950/70 border border-red-800/70 rounded-2xl text-red-200 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <div className="flex justify-between items-center bg-[#0a0f0d] p-3 rounded-2xl border border-[#1e2d26]">
              <span className="text-xs font-semibold text-gray-300">
                {selectedPin ? `Pinned: ${selectedPin.lat.toFixed(4)}, ${selectedPin.lng.toFixed(4)}` : 'No map pin set'}
              </span>
              <button
                type="button"
                onClick={() => setMode('map')}
                className="px-3 py-1.5 bg-emerald-950 border border-emerald-800 text-emerald-400 font-bold text-xs rounded-xl hover:bg-emerald-900 transition flex items-center gap-1.5"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Adjust on map</span>
              </button>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase text-gray-400 mb-2">Label</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'Home', label: 'Home', icon: Home },
                  { id: 'Farm', label: 'Farm', icon: Sprout },
                  { id: 'Other', label: 'Other', icon: Building },
                ].map((item) => {
                  const IconComp = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setLabel(item.id as any)}
                      className={`py-2.5 px-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                        label === item.id
                          ? 'bg-emerald-950/90 border-emerald-500 text-emerald-300'
                          : 'bg-[#0a0f0d] border-[#1e2d26] text-gray-400 hover:border-gray-700'
                      }`}
                    >
                      <IconComp className="w-4 h-4 text-emerald-400" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-2xl text-white font-medium focus:border-emerald-500 focus:outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Phone</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-2xl text-white font-mono text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">House / Door / Flat No.</label>
                <input
                  type="text"
                  required
                  value={houseNumber}
                  onChange={(e) => setHouseNumber(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-2xl text-white font-medium focus:border-emerald-500 focus:outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Street / Road</label>
                <input
                  type="text"
                  required
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-2xl text-white font-medium focus:border-emerald-500 focus:outline-none text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Area / Locality</label>
                <input
                  type="text"
                  required
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-2xl text-white font-medium focus:border-emerald-500 focus:outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Landmark (Optional)</label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-2xl text-white font-medium focus:border-emerald-500 focus:outline-none text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">City</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-2xl text-white text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">State</label>
                <input
                  type="text"
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-3 py-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-2xl text-white text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">PIN Code</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-3 py-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-2xl text-white font-mono font-bold text-xs sm:text-sm"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-[#0a0f0d] rounded-2xl border border-[#1e2d26]">
              <input
                type="checkbox"
                id="isDefault"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
              />
              <label htmlFor="isDefault" className="text-xs font-semibold text-gray-200 cursor-pointer">
                Set as default delivery address
              </label>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-4 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-extrabold rounded-2xl shadow-lg transition text-sm mt-4"
            >
              {saving ? 'Updating Address...' : 'Update Address'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
