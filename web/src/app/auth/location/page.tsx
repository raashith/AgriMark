'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { saveDeliveryAddress } from '@/lib/delivery-addresses';
import { getAddressFromCoordinates, isValidCoordinate, debounce } from '@/lib/geocoding';
import {
  MapPin,
  Navigation,
  Map as MapIcon,
  Edit3,
  Check,
  AlertCircle,
  Home,
  Sprout,
  Building,
  Loader2,
  WifiOff,
  ShieldOff,
  Clock,
  RefreshCw,
} from 'lucide-react';

// Dynamic import — map is client-only (MapLibre GL)
const AgriMarkLocationMap = dynamic(
  () => import('@/components/location/AgriMarkLocationMap').then((m) => m.AgriMarkLocationMap),
  {
    ssr: false,
    loading: () => (
      <div
        className="w-full rounded-2xl border border-[#1e2d26] bg-[#0a0f0d] flex items-center justify-center"
        style={{ minHeight: '280px' }}
        role="status"
        aria-label="Loading map..."
      >
        <div className="flex flex-col items-center gap-3">
          <div className="w-7 h-7 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-gray-400 font-mono">Loading map...</span>
        </div>
      </div>
    ),
  }
);

// ─── GPS State Machine ───────────────────────────────────────────────────────

type GpsState =
  | 'idle'
  | 'requesting_permission'
  | 'locating'
  | 'located'
  | 'permission_denied'
  | 'timeout'
  | 'position_unavailable'
  | 'unsupported'
  | 'error';

// Neutral India center — no city bias
const INDIA_CENTER = { lat: 20.5937, lng: 78.9629 };
const DEFAULT_ZOOM = 5; // country view when no GPS
const GPS_ZOOM = 16;    // street-level view after GPS

// ─── Component ───────────────────────────────────────────────────────────────

export default function DeliveryLocationPage() {
  const { user, refreshAddress } = useAuth();
  const router = useRouter();

  // ── Wizard step ──────────────────────────────────────────────────────────
  const [step, setStep] = useState<'options' | 'map' | 'form'>('options');

  // ── GPS ──────────────────────────────────────────────────────────────────
  const [gpsState, setGpsState] = useState<GpsState>('idle');
  const [gpsError, setGpsError] = useState('');
  const [accuracy, setAccuracy] = useState<number | null>(null);

  // ── Map pin position ─────────────────────────────────────────────────────
  const [mapCenter, setMapCenter] = useState(INDIA_CENTER);
  const [mapZoom, setMapZoom] = useState(DEFAULT_ZOOM);
  const [selectedPin, setSelectedPin] = useState<{ lat: number; lng: number } | null>(null);

  // ── Reverse geocoding state ──────────────────────────────────────────────
  const [geocodingInProgress, setGeocodingInProgress] = useState(false);
  const [addressPreview, setAddressPreview] = useState('');

  // ── Address form fields ──────────────────────────────────────────────────
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [street, setStreet] = useState('');
  const [area, setArea] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [label, setLabel] = useState<'Home' | 'Farm' | 'Other'>('Home');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');

  // ── Save state ───────────────────────────────────────────────────────────
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // Sync user profile into form
  useEffect(() => {
    if (user?.full_name && !fullName) setFullName(user.full_name);
    const p = user?.phone || (user as any)?.phone_number || '';
    if (p && !phone) setPhone(p);
  }, [user, fullName, phone]);

  // ── Debounced reverse geocoder (called on pin drag) ──────────────────────
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedGeocode = useCallback(
    debounce(async (lat: number, lng: number) => {
      if (!isValidCoordinate(lat, lng)) return;
      setGeocodingInProgress(true);
      setAddressPreview('Finding address...');
      const result = await getAddressFromCoordinates(lat, lng);
      setGeocodingInProgress(false);
      if (result.formatted_address) {
        setAddressPreview(result.formatted_address);
      } else if (result.city) {
        setAddressPreview([result.area, result.city, result.state].filter(Boolean).join(', '));
      } else {
        setAddressPreview('');
      }
    }, 600),
    []
  );

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handlePinChange = useCallback(
    (lat: number, lng: number) => {
      setSelectedPin({ lat, lng });
      debouncedGeocode(lat, lng);
    },
    [debouncedGeocode]
  );

  /** Primary GPS CTA — only runs after user click */
  const handleUseCurrentLocation = () => {
    if (typeof window === 'undefined' || !navigator?.geolocation) {
      setGpsState('unsupported');
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }

    setGpsState('requesting_permission');
    setGpsError('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const acc = position.coords.accuracy;

        if (!isValidCoordinate(lat, lng)) {
          setGpsState('error');
          setGpsError('Received invalid GPS coordinates. Please select location on map or enter manually.');
          return;
        }

        setGpsState('located');
        setAccuracy(acc);
        setSelectedPin({ lat, lng });
        setMapCenter({ lat, lng });
        setMapZoom(GPS_ZOOM);

        if (acc > 150) {
          setGpsError(`Low GPS accuracy (±${Math.round(acc)} m). Move outdoors or adjust the pin.`);
        }

        // Reverse geocode and prefill form
        setGeocodingInProgress(true);
        setAddressPreview('Finding address...');
        const geocoded = await getAddressFromCoordinates(lat, lng);
        setGeocodingInProgress(false);

        if (geocoded.house_number) setHouseNumber(geocoded.house_number);
        if (geocoded.street) setStreet(geocoded.street);
        if (geocoded.area) setArea(geocoded.area);
        if (geocoded.city) setCity(geocoded.city);
        if (geocoded.state) setStateName(geocoded.state);
        if (geocoded.postal_code) setPostalCode(geocoded.postal_code);
        if (geocoded.formatted_address) setAddressPreview(geocoded.formatted_address);

        setStep('map');
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setGpsState('permission_denied');
          setGpsError('Location permission was denied. Select on map or enter address manually.');
        } else if (err.code === err.TIMEOUT) {
          setGpsState('timeout');
          setGpsError('Location request timed out. Please try again or select on map.');
        } else {
          setGpsState('position_unavailable');
          setGpsError('Unable to retrieve current location. Please enter address manually.');
        }
      },
      { timeout: 12000, enableHighAccuracy: true, maximumAge: 0 }
    );
  };

  const handleSelectMapLocation = () => {
    if (!selectedPin) {
      setSelectedPin(INDIA_CENTER);
      setMapCenter(INDIA_CENTER);
      setMapZoom(DEFAULT_ZOOM);
    } else {
      setMapCenter(selectedPin);
      setMapZoom(GPS_ZOOM);
    }
    setStep('map');
  };

  const handleConfirmMapPin = async () => {
    if (!selectedPin || !isValidCoordinate(selectedPin.lat, selectedPin.lng)) return;

    setGeocodingInProgress(true);
    const geocoded = await getAddressFromCoordinates(selectedPin.lat, selectedPin.lng);
    setGeocodingInProgress(false);

    if (geocoded.house_number && !houseNumber) setHouseNumber(geocoded.house_number);
    if (geocoded.street && !street) setStreet(geocoded.street);
    if (geocoded.area && !area) setArea(geocoded.area);
    if (geocoded.city && !city) setCity(geocoded.city);
    if (geocoded.state && !stateName) setStateName(geocoded.state);
    if (geocoded.postal_code && !postalCode) setPostalCode(geocoded.postal_code);

    setStep('form');
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setFormError('');

    if (!fullName.trim()) { setFormError('Please enter your full name.'); return; }
    if (!houseNumber.trim()) { setFormError('Please enter your house / door / flat number.'); return; }
    if (!street.trim()) { setFormError('Please enter the street or road name.'); return; }
    if (!area.trim()) { setFormError('Please enter the area or locality.'); return; }
    if (!city.trim()) { setFormError('Please enter the city.'); return; }
    if (!stateName.trim()) { setFormError('Please enter the state.'); return; }
    if (!postalCode.trim() || !/^\d{6}$/.test(postalCode.trim())) {
      setFormError('Please enter a valid 6-digit PIN code.');
      return;
    }

    setSaving(true);
    try {
      await saveDeliveryAddress({
        label,
        full_name: fullName.trim(),
        phone: phone.trim() || '',
        house_number: houseNumber.trim(),
        street: street.trim(),
        area: area.trim(),
        landmark: landmark.trim() || undefined,
        city: city.trim(),
        state: stateName.trim(),
        postal_code: postalCode.trim(),
        latitude: selectedPin?.lat ?? undefined,
        longitude: selectedPin?.lng ?? undefined,
        location_accuracy: accuracy ?? undefined,
        is_default: true,
        delivery_instructions: deliveryInstructions.trim() || undefined,
      });

      await refreshAddress();

      // Honour ?redirect param (must be relative and not double-slash)
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const redirect = params.get('redirect');
        if (redirect && redirect.startsWith('/') && !redirect.startsWith('//')) {
          router.push(redirect);
          return;
        }
      }

      const role = user?.role || 'buyer';
      const destinations: Record<string, string> = {
        farmer: '/farmer/dashboard',
        buyer: '/buyer/marketplace',
        fpo: '/fpo/dashboard',
        logistics: '/logistics/deliveries',
      };
      router.push(destinations[role] ?? '/buyer/marketplace');
    } catch (err: any) {
      setFormError(err.message || 'Unable to save address. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // ── GPS state → icon + message helpers ──────────────────────────────────

  const gpsLoading = gpsState === 'requesting_permission' || gpsState === 'locating';

  const gpsStatusBanner = (() => {
    if (gpsState === 'located' && accuracy && accuracy > 150) {
      return { type: 'warning' as const, message: gpsError };
    }
    if (['permission_denied', 'timeout', 'position_unavailable', 'unsupported', 'error'].includes(gpsState)) {
      return { type: 'error' as const, message: gpsError };
    }
    return null;
  })();

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center px-4 py-8 bg-[#0a0f0d]">
      <div className="w-full max-w-lg bg-[#121a16] border border-[#1e2d26] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">

        {/* ───────────────────── STEP 1: LOCATION OPTIONS ─────────────────── */}
        {step === 'options' && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex p-3.5 bg-emerald-950/80 border border-emerald-800/60 rounded-2xl text-emerald-400">
                <MapPin className="w-8 h-8 text-emerald-400" aria-hidden="true" />
              </div>
              <h1 className="text-2xl font-black text-white">Where should we deliver?</h1>
              <p className="text-xs text-gray-400 max-w-xs mx-auto">
                Use your location to find available AgriMark delivery areas and fresh farm produce.
              </p>
            </div>

            {/* GPS status banner */}
            {gpsStatusBanner && (
              <div
                role="alert"
                className={`p-3.5 rounded-2xl text-xs flex items-start gap-2.5 ${
                  gpsStatusBanner.type === 'warning'
                    ? 'bg-amber-950/70 border border-amber-800/70 text-amber-200'
                    : 'bg-red-950/70 border border-red-800/70 text-red-200'
                }`}
              >
                {gpsStatusBanner.type === 'warning' ? (
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" aria-hidden="true" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" aria-hidden="true" />
                )}
                <span>{gpsStatusBanner.message}</span>
              </div>
            )}

            {/* Unsupported browser — go straight to manual */}
            {gpsState === 'unsupported' && (
              <div role="alert" className="p-3.5 bg-amber-950/70 border border-amber-800/70 rounded-2xl text-amber-200 text-xs flex items-start gap-2.5">
                <WifiOff className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" aria-hidden="true" />
                <span>GPS is not available in this browser. Please enter your address manually.</span>
              </div>
            )}

            <div className="space-y-3">
              {/* Primary CTA — GPS */}
              {gpsState !== 'unsupported' && (
                <button
                  type="button"
                  id="btn-use-location"
                  onClick={handleUseCurrentLocation}
                  disabled={gpsLoading}
                  aria-busy={gpsLoading}
                  className="w-full py-4 px-5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-extrabold rounded-2xl shadow-lg transition flex items-center justify-center gap-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-[#121a16]"
                >
                  {gpsLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                      <span>Detecting your location...</span>
                    </>
                  ) : gpsState === 'permission_denied' ? (
                    <>
                      <ShieldOff className="w-5 h-5" aria-hidden="true" />
                      <span>Try again (enable location in browser)</span>
                    </>
                  ) : gpsState === 'timeout' ? (
                    <>
                      <RefreshCw className="w-5 h-5" aria-hidden="true" />
                      <span>Retry location detection</span>
                    </>
                  ) : (
                    <>
                      <Navigation className="w-5 h-5" aria-hidden="true" />
                      <span>Use my current location</span>
                    </>
                  )}
                </button>
              )}

              {/* Secondary CTA — Map picker */}
              <button
                type="button"
                id="btn-select-on-map"
                onClick={handleSelectMapLocation}
                disabled={gpsLoading}
                className="w-full py-3.5 px-5 bg-[#0a0f0d] hover:bg-[#18241f] border border-[#1e2d26] hover:border-emerald-800 text-gray-200 font-bold rounded-2xl transition flex items-center justify-center gap-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-2 focus:ring-offset-[#121a16]"
              >
                <MapIcon className="w-5 h-5 text-emerald-400" aria-hidden="true" />
                <span>Select location on map</span>
              </button>

              {/* Tertiary — Manual entry */}
              <button
                type="button"
                id="btn-manual-entry"
                onClick={() => setStep('form')}
                disabled={gpsLoading}
                className="w-full py-3 px-5 text-xs text-gray-400 hover:text-emerald-400 font-semibold text-center transition flex items-center justify-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-700 rounded-xl"
              >
                <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Enter address manually</span>
              </button>
            </div>
          </div>
        )}

        {/* ───────────────────── STEP 2: MAP PIN SELECTION ────────────────── */}
        {step === 'map' && (
          <div className="space-y-5">
            <div className="space-y-1 text-center">
              <h2 className="text-xl font-bold text-white">Move &amp; Select Delivery Pin</h2>
              <p className="text-xs text-gray-400">Drag the pin or tap the map to set your exact delivery point</p>
            </div>

            {/* Accuracy / low-accuracy warning */}
            {accuracy !== null && accuracy !== undefined && accuracy > 150 && (
              <div role="alert" className="p-3 bg-amber-950/70 border border-amber-800/70 rounded-2xl text-amber-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" aria-hidden="true" />
                <span>Low GPS accuracy (±{Math.round(accuracy)} m). Move outdoors for better signal.</span>
              </div>
            )}

            {/* Live address preview during drag */}
            {selectedPin && (
              <div className="px-4 py-2.5 bg-[#0a0f0d] border border-[#1e2d26] rounded-2xl text-xs min-h-[38px] flex items-center gap-2" aria-live="polite">
                {geocodingInProgress ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 text-emerald-400 animate-spin shrink-0" aria-hidden="true" />
                    <span className="text-gray-400 italic">Finding address...</span>
                  </>
                ) : addressPreview ? (
                  <>
                    <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" aria-hidden="true" />
                    <span className="text-gray-200">{addressPreview}</span>
                  </>
                ) : (
                  <span className="text-gray-500">Drag the pin to preview the address</span>
                )}
              </div>
            )}

            {/* Map */}
            <AgriMarkLocationMap
              center={mapCenter}
              zoom={mapZoom}
              onPinChange={handlePinChange}
              accuracy={accuracy}
              onLocateRequest={handleUseCurrentLocation}
              className="h-72"
            />

            {/* Coordinate display */}
            {selectedPin && (
              <div className="flex gap-3 text-[10px] font-mono text-gray-500">
                <span>Lat: {selectedPin.lat.toFixed(6)}</span>
                <span>Lng: {selectedPin.lng.toFixed(6)}</span>
                {accuracy !== null && accuracy !== undefined && (
                  <span className="ml-auto text-emerald-600">±{Math.round(accuracy)} m</span>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep('options')}
                className="flex-1 py-3 bg-[#0a0f0d] border border-[#1e2d26] text-gray-300 font-bold rounded-2xl text-xs hover:bg-[#18241f] transition focus:outline-none focus:ring-2 focus:ring-gray-600"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleConfirmMapPin}
                disabled={!selectedPin || geocodingInProgress}
                className="flex-[2] py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-extrabold rounded-2xl shadow-lg transition text-sm flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-[#121a16]"
              >
                {geocodingInProgress ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                    <span>Resolving address...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm location</span>
                    <Check className="w-4 h-4" aria-hidden="true" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ───────────────────── STEP 3: ADDRESS FORM ─────────────────────── */}
        {step === 'form' && (
          <form onSubmit={handleSaveAddress} className="space-y-4" noValidate>
            <div className="border-b border-[#1e2d26] pb-3 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-extrabold text-white">Add delivery details</h2>
                <p className="text-xs text-gray-400">Complete address for accurate farm delivery</p>
              </div>
              <button
                type="button"
                onClick={() => setStep('options')}
                className="text-xs text-gray-400 hover:text-white underline font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600 rounded"
              >
                Change mode
              </button>
            </div>

            {formError && (
              <div role="alert" className="p-3.5 bg-red-950/70 border border-red-800/70 rounded-2xl text-red-200 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" aria-hidden="true" />
                <span>{formError}</span>
              </div>
            )}

            {/* Address label selector */}
            <fieldset>
              <legend className="block text-xs font-mono font-bold uppercase text-gray-400 mb-2">
                Save Address As
              </legend>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'Home' as const, label: 'Home', Icon: Home },
                  { id: 'Farm' as const, label: 'Farm', Icon: Sprout },
                  { id: 'Other' as const, label: 'Other', Icon: Building },
                ].map(({ id, label: lbl, Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setLabel(id)}
                    aria-pressed={label === id}
                    className={`py-2.5 px-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      label === id
                        ? 'bg-emerald-950/90 border-emerald-500 text-emerald-300 shadow'
                        : 'bg-[#0a0f0d] border-[#1e2d26] text-gray-400 hover:border-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-emerald-400" aria-hidden="true" />
                    <span>{lbl}</span>
                  </button>
                ))}
              </div>
            </fieldset>

            {/* Name + Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="full-name" className="block text-xs font-semibold uppercase text-gray-400 mb-1">
                  Full Name <span aria-hidden="true" className="text-red-400">*</span>
                </label>
                <input
                  id="full-name"
                  type="text"
                  required
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-2xl text-white font-medium focus:border-emerald-500 focus:outline-none text-sm"
                  placeholder="Receiver's name"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-xs font-semibold uppercase text-gray-400 mb-1">
                  Mobile Number (Locked)
                </label>
                <input
                  id="phone"
                  type="tel"
                  readOnly
                  disabled
                  value={phone}
                  aria-describedby="phone-locked-hint"
                  className="w-full px-4 py-3 bg-[#18241f]/60 border border-[#2a3c33] rounded-2xl text-gray-300 font-mono text-sm cursor-not-allowed"
                />
                <span id="phone-locked-hint" className="sr-only">Phone number is locked to your verified mobile number</span>
              </div>
            </div>

            {/* House + Street */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="house-number" className="block text-xs font-semibold uppercase text-gray-400 mb-1">
                  House / Door / Flat No. <span aria-hidden="true" className="text-red-400">*</span>
                </label>
                <input
                  id="house-number"
                  type="text"
                  required
                  value={houseNumber}
                  onChange={(e) => setHouseNumber(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-2xl text-white font-medium focus:border-emerald-500 focus:outline-none text-sm"
                  placeholder="e.g. Door No. 42"
                />
              </div>

              <div>
                <label htmlFor="street" className="block text-xs font-semibold uppercase text-gray-400 mb-1">
                  Street / Road <span aria-hidden="true" className="text-red-400">*</span>
                </label>
                <input
                  id="street"
                  type="text"
                  required
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-2xl text-white font-medium focus:border-emerald-500 focus:outline-none text-sm"
                  placeholder="e.g. Main Mandi Road"
                />
              </div>
            </div>

            {/* Area + Landmark */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="area" className="block text-xs font-semibold uppercase text-gray-400 mb-1">
                  Area / Locality <span aria-hidden="true" className="text-red-400">*</span>
                </label>
                <input
                  id="area"
                  type="text"
                  required
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-2xl text-white font-medium focus:border-emerald-500 focus:outline-none text-sm"
                  placeholder="e.g. Anna Nagar / Sector 4"
                />
              </div>

              <div>
                <label htmlFor="landmark" className="block text-xs font-semibold uppercase text-gray-400 mb-1">
                  Landmark (Optional)
                </label>
                <input
                  id="landmark"
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-2xl text-white font-medium focus:border-emerald-500 focus:outline-none text-sm"
                  placeholder="e.g. Near Cold Storage"
                />
              </div>
            </div>

            {/* City + State + PIN */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <div>
                <label htmlFor="city" className="block text-xs font-semibold uppercase text-gray-400 mb-1">
                  City <span aria-hidden="true" className="text-red-400">*</span>
                </label>
                <input
                  id="city"
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-2xl text-white font-medium focus:border-emerald-500 focus:outline-none text-xs sm:text-sm"
                  placeholder="City"
                />
              </div>

              <div>
                <label htmlFor="state-name" className="block text-xs font-semibold uppercase text-gray-400 mb-1">
                  State <span aria-hidden="true" className="text-red-400">*</span>
                </label>
                <input
                  id="state-name"
                  type="text"
                  required
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                  className="w-full px-3 py-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-2xl text-white font-medium focus:border-emerald-500 focus:outline-none text-xs sm:text-sm"
                  placeholder="State"
                />
              </div>

              <div>
                <label htmlFor="postal-code" className="block text-xs font-semibold uppercase text-gray-400 mb-1">
                  PIN Code <span aria-hidden="true" className="text-red-400">*</span>
                </label>
                <input
                  id="postal-code"
                  type="text"
                  required
                  maxLength={6}
                  inputMode="numeric"
                  pattern="\d{6}"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-3 py-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-2xl text-white font-mono font-bold focus:border-emerald-500 focus:outline-none text-xs sm:text-sm"
                  placeholder="600040"
                />
              </div>
            </div>

            {/* GPS coordinates display (informational) */}
            {selectedPin && (
              <div className="flex gap-4 px-1 text-[10px] font-mono text-gray-500">
                <span>Lat: {selectedPin.lat.toFixed(6)}</span>
                <span>Lng: {selectedPin.lng.toFixed(6)}</span>
                {accuracy !== null && accuracy !== undefined && (
                  <span className="ml-auto">GPS ±{Math.round(accuracy)} m</span>
                )}
              </div>
            )}

            {/* Delivery instructions */}
            <div>
              <label htmlFor="delivery-instructions" className="block text-xs font-semibold uppercase text-gray-400 mb-1">
                Delivery Instructions (Optional)
              </label>
              <textarea
                id="delivery-instructions"
                rows={2}
                value={deliveryInstructions}
                onChange={(e) => setDeliveryInstructions(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#0a0f0d] border border-[#1e2d26] rounded-2xl text-white text-xs focus:border-emerald-500 focus:outline-none"
                placeholder="e.g. Call before delivery, unload near gate 2"
              />
            </div>

            <button
              type="submit"
              id="btn-save-address"
              disabled={saving}
              aria-busy={saving}
              className="w-full py-4 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-950 disabled:opacity-70 text-white font-extrabold rounded-2xl shadow-lg transition flex items-center justify-center gap-2 text-sm mt-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-[#121a16]"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  <span>Saving Delivery Address...</span>
                </>
              ) : (
                'Save address & Continue'
              )}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
