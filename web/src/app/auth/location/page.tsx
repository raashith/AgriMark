'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { saveDeliveryAddress } from '@/lib/delivery-addresses';
import { useI18n } from '@/lib/i18n';
import { MapPin, Navigation, Map as MapIcon, Edit3, Check, AlertCircle, Home, Sprout, Building } from 'lucide-react';

interface GeocodedAddress {
  house_number?: string;
  street?: string;
  area?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  latitude?: number;
  longitude?: number;
}

export default function DeliveryLocationPage() {
  const { user, refreshAddress } = useAuth();
  const { t } = useI18n();
  const router = useRouter();

  // Onboarding Step: 'options' | 'map' | 'form'
  const [step, setStep] = useState<'options' | 'map' | 'form'>('options');

  // Geolocation & reverse geocoding state
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState('');
  const [selectedPin, setSelectedPin] = useState<{ lat: number; lng: number } | null>(null);

  // Form Fields
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || user?.phone_number || '');
  const [houseNumber, setHouseNumber] = useState('');
  const [street, setStreet] = useState('');
  const [area, setArea] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [label, setLabel] = useState<'Home' | 'Farm' | 'Other'>('Home');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');

  // Submit states
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (user?.full_name && !fullName) setFullName(user.full_name);
    if ((user?.phone || user?.phone_number) && !phone) setPhone(user.phone || user.phone_number || '');
  }, [user, fullName, phone]);

  // Reverse Geocoding helper using OpenStreetMap Nominatim with fallback
  const reverseGeocode = async (lat: number, lng: number): Promise<GeocodedAddress> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
        { headers: { 'Accept-Language': 'en' } }
      );
      if (!response.ok) throw new Error('Geocoding service unavailable');
      const data = await response.json();
      const addr = data.address || {};

      return {
        house_number: addr.house_number || addr.building || '',
        street: addr.road || addr.street || addr.footway || '',
        area: addr.suburb || addr.neighbourhood || addr.residential || addr.village || addr.county || '',
        city: addr.city || addr.town || addr.district || addr.state_district || '',
        state: addr.state || '',
        postal_code: addr.postcode || '',
        latitude: lat,
        longitude: lng,
      };
    } catch {
      return {
        latitude: lat,
        longitude: lng,
      };
    }
  };

  // Primary Action: "Use my current location"
  const handleUseCurrentLocation = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser. Please enter address manually.');
      setStep('form');
      return;
    }

    setGeoLoading(true);
    setGeoError('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setSelectedPin({ lat, lng });

        const geocoded = await reverseGeocode(lat, lng);
        if (geocoded.house_number) setHouseNumber(geocoded.house_number);
        if (geocoded.street) setStreet(geocoded.street);
        if (geocoded.area) setArea(geocoded.area);
        if (geocoded.city) setCity(geocoded.city);
        if (geocoded.state) setState(geocoded.state);
        if (geocoded.postal_code) setPostalCode(geocoded.postal_code);

        setGeoLoading(false);
        setStep('form');
      },
      (err) => {
        setGeoLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGeoError('Location permission was denied. Please select your location on map or enter details manually.');
        } else {
          setGeoError('Unable to retrieve current location. Please enter address manually.');
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Secondary Action: "Select location on map"
  const handleSelectMapLocation = () => {
    // Default fallback to center of India (e.g., Chennai / South Mandi Region 13.0827, 80.2707)
    if (!selectedPin) {
      setSelectedPin({ lat: 13.0827, lng: 80.2707 });
    }
    setStep('map');
  };

  // Confirm pin on map
  const handleConfirmMapPin = async () => {
    if (!selectedPin) return;
    setGeoLoading(true);
    const geocoded = await reverseGeocode(selectedPin.lat, selectedPin.lng);
    if (geocoded.area) setArea(geocoded.area);
    if (geocoded.city) setCity(geocoded.city);
    if (geocoded.state) setState(geocoded.state);
    if (geocoded.postal_code) setPostalCode(geocoded.postal_code);
    setGeoLoading(false);
    setStep('form');
  };

  // Save address form
  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setFormError('');

    if (!fullName.trim()) {
      setFormError('Please enter full name.');
      return;
    }
    if (!houseNumber.trim()) {
      setFormError('Please enter house / door / flat number.');
      return;
    }
    if (!street.trim()) {
      setFormError('Please enter street or road details.');
      return;
    }
    if (!area.trim()) {
      setFormError('Please enter area or locality.');
      return;
    }
    if (!city.trim()) {
      setFormError('Please enter city.');
      return;
    }
    if (!state.trim()) {
      setFormError('Please enter state.');
      return;
    }
    if (!postalCode.trim() || !/^\d{6}$/.test(postalCode.trim())) {
      setFormError('Please enter a valid 6-digit PIN code.');
      return;
    }

    setSaving(true);
    try {
      await saveDeliveryAddress({
        label,
        full_name: fullName.trim(),
        phone: phone.trim() || user?.phone || '+919876543210',
        house_number: houseNumber.trim(),
        street: street.trim(),
        area: area.trim(),
        landmark: landmark.trim() || undefined,
        city: city.trim(),
        state: state.trim(),
        postal_code: postalCode.trim(),
        latitude: selectedPin?.lat ?? undefined,
        longitude: selectedPin?.lng ?? undefined,
        is_default: true,
        delivery_instructions: deliveryInstructions.trim() || undefined,
      });

      await refreshAddress();

      // Route user to appropriate experience
      const userRole = user?.role || 'buyer';
      if (userRole === 'farmer') router.push('/farmer/dashboard');
      else if (userRole === 'buyer') router.push('/buyer/marketplace');
      else if (userRole === 'fpo') router.push('/fpo/dashboard');
      else if (userRole === 'logistics') router.push('/logistics/deliveries');
      else router.push('/buyer/marketplace');
    } catch (err: any) {
      setFormError(err.message || 'Unable to save address. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center px-4 py-8 bg-[#0a0f0d]">
      <div className="w-full max-w-lg bg-[#121a16] border border-[#1e2d26] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">

        {/* STEP 1: LOCATION OPTION SELECTION */}
        {step === 'options' && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex p-3.5 bg-emerald-950/80 border border-emerald-800/60 rounded-2xl text-emerald-400">
                <MapPin className="w-8 h-8 text-emerald-400" />
              </div>
              <h1 className="text-2xl font-black text-white">Where should we deliver?</h1>
              <p className="text-xs text-gray-400 max-w-xs mx-auto">
                Use your location to find available AgriMark delivery areas and fresh farm produce.
              </p>
            </div>

            {geoError && (
              <div className="p-3.5 bg-red-950/70 border border-red-800/70 rounded-2xl text-red-200 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                <span>{geoError}</span>
              </div>
            )}

            <div className="space-y-3">
              {/* Primary CTA: Current Location */}
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={geoLoading}
                className="w-full py-4 px-5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-extrabold rounded-2xl shadow-lg transition flex items-center justify-center gap-3 text-sm"
              >
                <Navigation className="w-5 h-5 animate-bounce" />
                <span>{geoLoading ? 'Detecting your location...' : 'Use my current location'}</span>
              </button>

              {/* Secondary CTA: Map Selector */}
              <button
                type="button"
                onClick={handleSelectMapLocation}
                disabled={geoLoading}
                className="w-full py-3.5 px-5 bg-[#0a0f0d] hover:bg-[#18241f] border border-[#1e2d26] hover:border-emerald-800 text-gray-200 font-bold rounded-2xl transition flex items-center justify-center gap-3 text-sm"
              >
                <MapIcon className="w-5 h-5 text-emerald-400" />
                <span>Select location on map</span>
              </button>

              {/* Manual Entry Fallback */}
              <button
                type="button"
                onClick={() => setStep('form')}
                disabled={geoLoading}
                className="w-full py-3 px-5 text-xs text-gray-400 hover:text-emerald-400 font-semibold text-center transition flex items-center justify-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Enter address manually</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: MAP PIN SELECTION */}
        {step === 'map' && (
          <div className="space-y-6">
            <div className="space-y-1 text-center">
              <h2 className="text-xl font-bold text-white">Move &amp; Select Delivery Pin</h2>
              <p className="text-xs text-gray-400">Position the pin over your delivery area</p>
            </div>

            {/* Mobile Map Canvas Simulator */}
            <div className="relative h-64 w-full bg-[#0a0f0d] border border-[#1e2d26] rounded-2xl overflow-hidden flex items-center justify-center shadow-inner">
              <div
                className="absolute inset-0 opacity-40 bg-[radial-gradient(#3E7B54_1px,transparent_1px)]"
                style={{ backgroundSize: '16px 16px' }}
              />

              <div className="z-10 flex flex-col items-center space-y-1">
                <div className="p-2.5 bg-emerald-600 rounded-full text-white shadow-xl animate-bounce border-2 border-white">
                  <MapPin className="w-6 h-6" />
                </div>
                <div className="px-3 py-1 bg-black/80 text-emerald-400 font-mono text-[11px] font-bold rounded-full border border-emerald-800/60 backdrop-blur-sm">
                  {selectedPin ? `${selectedPin.lat.toFixed(4)}, ${selectedPin.lng.toFixed(4)}` : 'Chennai Region'}
                </div>
              </div>

              {/* Quick Pin Adjust Buttons */}
              <div className="absolute bottom-3 left-3 right-3 flex justify-between gap-2 z-20">
                <button
                  type="button"
                  onClick={() => setSelectedPin({ lat: 13.0827, lng: 80.2707 })}
                  className="px-3 py-1.5 bg-[#121a16]/90 border border-[#1e2d26] text-gray-300 text-[11px] font-semibold rounded-xl"
                >
                  Chennai
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPin({ lat: 12.9716, lng: 77.5946 })}
                  className="px-3 py-1.5 bg-[#121a16]/90 border border-[#1e2d26] text-gray-300 text-[11px] font-semibold rounded-xl"
                >
                  Bengaluru
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPin({ lat: 11.0168, lng: 76.9558 })}
                  className="px-3 py-1.5 bg-[#121a16]/90 border border-[#1e2d26] text-gray-300 text-[11px] font-semibold rounded-xl"
                >
                  Coimbatore
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep('options')}
                className="flex-1 py-3 bg-[#0a0f0d] border border-[#1e2d26] text-gray-300 font-bold rounded-2xl text-xs"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleConfirmMapPin}
                disabled={geoLoading}
                className="flex-2 py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-2xl shadow-lg transition text-sm flex items-center justify-center gap-2"
              >
                <span>{geoLoading ? 'Resolving...' : 'Confirm location'}</span>
                <Check className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: ADDRESS DETAILS FORM */}
        {step === 'form' && (
          <form onSubmit={handleSaveAddress} className="space-y-4">
            <div className="border-b border-[#1e2d26] pb-3 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-extrabold text-white">Add delivery details</h2>
                <p className="text-xs text-gray-400">Complete address for accurate farm delivery</p>
              </div>
              <button
                type="button"
                onClick={() => setStep('options')}
                className="text-xs text-gray-400 hover:text-white underline font-semibold"
              >
                Change mode
              </button>
            </div>

            {formError && (
              <div className="p-3.5 bg-red-950/70 border border-red-800/70 rounded-2xl text-red-200 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            {/* Address Type Selector */}
            <div>
              <label className="block text-xs font-mono font-bold uppercase text-gray-400 mb-2">
                Save Address As
              </label>
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
                          ? 'bg-emerald-950/90 border-emerald-500 text-emerald-300 shadow'
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
                  placeholder="Receiver's name"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">
                  Mobile Number (Locked)
                </label>
                <input
                  type="tel"
                  readOnly
                  disabled
                  value={phone}
                  className="w-full px-4 py-3 bg-[#18241f]/60 border border-[#2a3c33] rounded-2xl text-gray-300 font-mono text-sm cursor-not-allowed"
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
                  placeholder="e.g. Door No. 42 / Flat 3B"
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
                  placeholder="e.g. Main Mandi Road"
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
                  placeholder="e.g. Anna Nagar / Farm Sector 4"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Landmark (Optional)</label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-2xl text-white font-medium focus:border-emerald-500 focus:outline-none text-sm"
                  placeholder="e.g. Near Cold Storage Godown"
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
                  className="w-full px-3 py-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-2xl text-white font-medium focus:border-emerald-500 focus:outline-none text-xs sm:text-sm"
                  placeholder="Chennai"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">State</label>
                <input
                  type="text"
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-3 py-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-2xl text-white font-medium focus:border-emerald-500 focus:outline-none text-xs sm:text-sm"
                  placeholder="Tamil Nadu"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">PIN Code</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  inputMode="numeric"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-3 py-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-2xl text-white font-mono font-bold focus:border-emerald-500 focus:outline-none text-xs sm:text-sm"
                  placeholder="600040"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">
                Delivery Instructions (Optional)
              </label>
              <textarea
                rows={2}
                value={deliveryInstructions}
                onChange={(e) => setDeliveryInstructions(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#0a0f0d] border border-[#1e2d26] rounded-2xl text-white text-xs focus:border-emerald-500 focus:outline-none"
                placeholder="e.g. Call before delivery, unload near gate 2"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-4 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-950 text-white font-extrabold rounded-2xl shadow-lg transition flex items-center justify-center gap-2 text-sm mt-4"
            >
              {saving ? 'Saving Delivery Address...' : 'Save address & Continue'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
