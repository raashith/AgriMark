'use client';

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import {
  getDeliveryAddresses,
  updateDeliveryAddress,
} from '@/lib/delivery-addresses';
import { getAddressFromCoordinates, isValidCoordinate, debounce } from '@/lib/geocoding';
import {
  MapPin,
  Navigation,
  Check,
  AlertCircle,
  Home,
  Sprout,
  Building,
  Loader2,
  ArrowLeft,
} from 'lucide-react';

const AgriMarkLocationMap = dynamic(
  () => import('@/components/location/AgriMarkLocationMap').then((m) => m.AgriMarkLocationMap),
  {
    ssr: false,
    loading: () => (
      <div
        className="w-full rounded-2xl border border-[#1e2d26] bg-[#0a0f0d] flex items-center justify-center"
        style={{ minHeight: '200px' }}
        role="status"
        aria-label="Loading map..."
      >
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-gray-400 font-mono">Loading map...</span>
        </div>
      </div>
    ),
  }
);

const INDIA_CENTER = { lat: 20.5937, lng: 78.9629 };

export default function EditAddressPage() {
  const { user, refreshAddress } = useAuth();
  const router = useRouter();
  const params = useParams();
  const addressId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [geocodingInProgress, setGeocodingInProgress] = useState(false);
  const [addressPreview, setAddressPreview] = useState('');

  const [selectedPin, setSelectedPin] = useState<{ lat: number; lng: number } | null>(null);
  const [mapCenter, setMapCenter] = useState(INDIA_CENTER);
  const [showMap, setShowMap] = useState(false);

  const [label, setLabel] = useState<'Home' | 'Farm' | 'Other'>('Home');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [street, setStreet] = useState('');
  const [area, setArea] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');

  useEffect(() => {
    if (!addressId) { setNotFound(true); setLoading(false); return; }
    void (async () => {
      setLoading(true);
      try {
        const addresses = await getDeliveryAddresses();
        const found = addresses.find((a) => a.id === addressId);
        if (!found) { setNotFound(true); return; }
        const validLabels = ['Home', 'Farm', 'Other'] as const;
        setLabel(validLabels.includes(found.label as any) ? (found.label as 'Home' | 'Farm' | 'Other') : 'Other');
        setFullName(found.full_name || '');
        setPhone(found.phone || (user as any)?.phone || (user as any)?.phone_number || '');
        setHouseNumber(found.house_number || '');
        setStreet(found.street || '');
        setArea(found.area || '');
        setLandmark(found.landmark || '');
        setCity(found.city || '');
        setStateName(found.state || '');
        setPostalCode(found.postal_code || '');
        setDeliveryInstructions(found.delivery_instructions || '');
        if (found.latitude && found.longitude) {
          setSelectedPin({ lat: found.latitude, lng: found.longitude });
          setMapCenter({ lat: found.latitude, lng: found.longitude });
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [addressId, user]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedGeocode = useCallback(
    debounce(async (lat: number, lng: number) => {
      if (!isValidCoordinate(lat, lng)) return;
      setGeocodingInProgress(true);
      setAddressPreview('Finding address...');
      const result = await getAddressFromCoordinates(lat, lng);
      setGeocodingInProgress(false);
      setAddressPreview(result.formatted_address || [result.area, result.city, result.state].filter(Boolean).join(', '));
    }, 600),
    []
  );

  const handlePinChange = useCallback((lat: number, lng: number) => {
    setSelectedPin({ lat, lng });
    debouncedGeocode(lat, lng);
  }, [debouncedGeocode]);

  const handleApplyMapPin = async () => {
    if (!selectedPin || !isValidCoordinate(selectedPin.lat, selectedPin.lng)) return;
    setGeocodingInProgress(true);
    const g = await getAddressFromCoordinates(selectedPin.lat, selectedPin.lng);
    setGeocodingInProgress(false);
    if (g.house_number && !houseNumber) setHouseNumber(g.house_number);
    if (g.street) setStreet(g.street);
    if (g.area) setArea(g.area);
    if (g.city) setCity(g.city);
    if (g.state) setStateName(g.state);
    if (g.postal_code) setPostalCode(g.postal_code);
    setShowMap(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setFormError('');
    if (!fullName.trim()) { setFormError('Full name is required.'); return; }
    if (!houseNumber.trim()) { setFormError('House number is required.'); return; }
    if (!street.trim()) { setFormError('Street is required.'); return; }
    if (!area.trim()) { setFormError('Area is required.'); return; }
    if (!city.trim()) { setFormError('City is required.'); return; }
    if (!stateName.trim()) { setFormError('State is required.'); return; }
    if (!/^\d{6}$/.test(postalCode.trim())) { setFormError('PIN code must be 6 digits.'); return; }
    setSaving(true);
    try {
      await updateDeliveryAddress(addressId, {
        label,
        full_name: fullName.trim(),
        house_number: houseNumber.trim(),
        street: street.trim(),
        area: area.trim(),
        landmark: landmark.trim() || undefined,
        city: city.trim(),
        state: stateName.trim(),
        postal_code: postalCode.trim(),
        latitude: selectedPin?.lat ?? undefined,
        longitude: selectedPin?.lng ?? undefined,
        delivery_instructions: deliveryInstructions.trim() || undefined,
      });
      await refreshAddress();
      router.back();
    } catch (err: any) {
      setFormError(err.message || 'Unable to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#0a0f0d]" role="status" aria-label="Loading address">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-gray-400 font-mono">Loading address...</span>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-[#0a0f0d] gap-4 px-4">
        <AlertCircle className="w-10 h-10 text-red-400" aria-hidden="true" />
        <p className="text-lg font-bold text-white">Address not found</p>
        <p className="text-sm text-gray-400 text-center">This address may have been deleted or belongs to another account.</p>
        <button type="button" onClick={() => router.back()} className="mt-2 px-6 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-2xl text-sm font-bold">Go back</button>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center px-4 py-8 bg-[#0a0f0d]">
      <div className="w-full max-w-lg bg-[#121a16] border border-[#1e2d26] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
        <div className="flex items-center gap-3 pb-3 border-b border-[#1e2d26]">
          <button type="button" onClick={() => router.back()} aria-label="Go back"
            className="p-2 rounded-xl hover:bg-[#1e2d26] text-gray-400 hover:text-white transition focus:outline-none focus:ring-2 focus:ring-emerald-600">
            <ArrowLeft className="w-5 h-5" aria-hidden="true" />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-white">Edit Address</h1>
            <p className="text-xs text-gray-400">Update your delivery details</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4" noValidate>
          {formError && (
            <div role="alert" className="p-3.5 bg-red-950/70 border border-red-800/70 rounded-2xl text-red-200 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" aria-hidden="true" />
              <span>{formError}</span>
            </div>
          )}

          <fieldset>
            <legend className="block text-xs font-mono font-bold uppercase text-gray-400 mb-2">Address Type</legend>
            <div className="grid grid-cols-3 gap-2">
              {([['Home', Home], ['Farm', Sprout], ['Other', Building]] as const).map(([id, Icon]) => (
                <button key={id} type="button" onClick={() => setLabel(id)} aria-pressed={label === id}
                  className={`py-2.5 px-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition focus:outline-none focus:ring-2 focus:ring-emerald-500 ${label === id ? 'bg-emerald-950/90 border-emerald-500 text-emerald-300' : 'bg-[#0a0f0d] border-[#1e2d26] text-gray-400 hover:border-gray-700'}`}>
                  <Icon className="w-4 h-4 text-emerald-400" aria-hidden="true" />
                  <span>{id}</span>
                </button>
              ))}
            </div>
          </fieldset>

          <div>
            <label htmlFor="edit-full-name" className="block text-xs font-semibold uppercase text-gray-400 mb-1">Full Name <span aria-hidden="true" className="text-red-400">*</span></label>
            <input id="edit-full-name" type="text" required autoComplete="name" value={fullName} onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-2xl text-white focus:border-emerald-500 focus:outline-none text-sm" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="edit-house" className="block text-xs font-semibold uppercase text-gray-400 mb-1">House / Door No. <span aria-hidden="true" className="text-red-400">*</span></label>
              <input id="edit-house" type="text" required value={houseNumber} onChange={(e) => setHouseNumber(e.target.value)}
                className="w-full px-4 py-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-2xl text-white focus:border-emerald-500 focus:outline-none text-sm" />
            </div>
            <div>
              <label htmlFor="edit-street" className="block text-xs font-semibold uppercase text-gray-400 mb-1">Street <span aria-hidden="true" className="text-red-400">*</span></label>
              <input id="edit-street" type="text" required value={street} onChange={(e) => setStreet(e.target.value)}
                className="w-full px-4 py-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-2xl text-white focus:border-emerald-500 focus:outline-none text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="edit-area" className="block text-xs font-semibold uppercase text-gray-400 mb-1">Area <span aria-hidden="true" className="text-red-400">*</span></label>
              <input id="edit-area" type="text" required value={area} onChange={(e) => setArea(e.target.value)}
                className="w-full px-4 py-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-2xl text-white focus:border-emerald-500 focus:outline-none text-sm" />
            </div>
            <div>
              <label htmlFor="edit-landmark" className="block text-xs font-semibold uppercase text-gray-400 mb-1">Landmark</label>
              <input id="edit-landmark" type="text" value={landmark} onChange={(e) => setLandmark(e.target.value)}
                className="w-full px-4 py-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-2xl text-white focus:border-emerald-500 focus:outline-none text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label htmlFor="edit-city" className="block text-xs font-semibold uppercase text-gray-400 mb-1">City <span aria-hidden="true" className="text-red-400">*</span></label>
              <input id="edit-city" type="text" required value={city} onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-2xl text-white focus:border-emerald-500 focus:outline-none text-xs sm:text-sm" />
            </div>
            <div>
              <label htmlFor="edit-state" className="block text-xs font-semibold uppercase text-gray-400 mb-1">State <span aria-hidden="true" className="text-red-400">*</span></label>
              <input id="edit-state" type="text" required value={stateName} onChange={(e) => setStateName(e.target.value)}
                className="w-full px-3 py-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-2xl text-white focus:border-emerald-500 focus:outline-none text-xs sm:text-sm" />
            </div>
            <div>
              <label htmlFor="edit-postal" className="block text-xs font-semibold uppercase text-gray-400 mb-1">PIN <span aria-hidden="true" className="text-red-400">*</span></label>
              <input id="edit-postal" type="text" required maxLength={6} inputMode="numeric" pattern="\d{6}" value={postalCode}
                onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full px-3 py-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-2xl text-white font-mono font-bold focus:border-emerald-500 focus:outline-none text-xs sm:text-sm" />
            </div>
          </div>

          <div>
            <label htmlFor="edit-instructions" className="block text-xs font-semibold uppercase text-gray-400 mb-1">Delivery Instructions</label>
            <textarea id="edit-instructions" rows={2} value={deliveryInstructions} onChange={(e) => setDeliveryInstructions(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#0a0f0d] border border-[#1e2d26] rounded-2xl text-white text-xs focus:border-emerald-500 focus:outline-none" />
          </div>

          {/* Map re-pin toggle */}
          <div>
            <button type="button" onClick={() => setShowMap((v) => !v)}
              className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5 hover:text-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 rounded">
              <Navigation className="w-3.5 h-3.5" aria-hidden="true" />
              {showMap ? 'Hide map' : 'Adjust delivery pin on map'}
            </button>

            {showMap && (
              <div className="mt-3 space-y-2">
                {selectedPin && (
                  <div className="px-4 py-2.5 bg-[#0a0f0d] border border-[#1e2d26] rounded-2xl text-xs min-h-[38px] flex items-center gap-2" aria-live="polite">
                    {geocodingInProgress ? (
                      <><Loader2 className="w-3.5 h-3.5 text-emerald-400 animate-spin shrink-0" /><span className="text-gray-400 italic">Finding address...</span></>
                    ) : addressPreview ? (
                      <><MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" /><span className="text-gray-200">{addressPreview}</span></>
                    ) : (
                      <span className="text-gray-500">Drag pin to preview the address</span>
                    )}
                  </div>
                )}
                <AgriMarkLocationMap center={selectedPin ?? mapCenter} zoom={selectedPin ? 16 : 5} onPinChange={handlePinChange} className="h-52" />
                <button type="button" onClick={handleApplyMapPin} disabled={!selectedPin || geocodingInProgress}
                  className="w-full py-2.5 px-4 bg-emerald-700/70 hover:bg-emerald-600 disabled:opacity-60 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 transition">
                  <Check className="w-4 h-4" aria-hidden="true" />
                  Apply pin position
                </button>
              </div>
            )}
          </div>

          <button type="submit" id="btn-save-edited-address" disabled={saving} aria-busy={saving}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-extrabold rounded-2xl shadow-lg transition flex items-center justify-center gap-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-[#121a16]">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Saving...</span></> : 'Save changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
