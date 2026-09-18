/**
 * Reverse geocoding abstraction for AgriMark.
 *
 * Provider is Nominatim (OpenStreetMap) by default — free, no API key required.
 * The abstraction allows swapping providers via NEXT_PUBLIC_GEOCODER env var
 * without touching the UI layer.
 *
 * SECURITY: No private API keys are used in client-side code.
 */

export interface GeocodedAddress {
  formatted_address: string;
  house_number: string;
  street: string;
  area: string;
  landmark: string;
  city: string;
  state: string;
  postal_code: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
}

/** Validate coordinates before geocoding */
export function isValidCoordinate(lat: number, lng: number): boolean {
  if (typeof lat !== 'number' || typeof lng !== 'number') return false;
  if (!isFinite(lat) || !isFinite(lng)) return false;
  if (isNaN(lat) || isNaN(lng)) return false;
  if (lat < -90 || lat > 90) return false;
  if (lng < -180 || lng > 180) return false;
  return true;
}

/** Empty address scaffold — returned on failure */
function emptyAddress(lat: number, lng: number): GeocodedAddress {
  return {
    formatted_address: '',
    house_number: '',
    street: '',
    area: '',
    landmark: '',
    city: '',
    state: '',
    postal_code: '',
    latitude: lat,
    longitude: lng,
  };
}

/** Nominatim (OpenStreetMap) reverse geocoder — free, no key */
async function nominatimReverseGeocode(lat: number, lng: number): Promise<GeocodedAddress> {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&addressdetails=1`;

  const response = await fetch(url, {
    headers: {
      'Accept-Language': 'en',
      'User-Agent': 'AgriMark/1.0 (agrimark.in)',
    },
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) {
    throw new Error(`Nominatim HTTP ${response.status}`);
  }

  const data = await response.json();
  const addr = data.address || {};

  const house_number = addr.house_number || addr.building || '';
  const street = addr.road || addr.street || addr.footway || addr.path || '';
  const area =
    addr.suburb ||
    addr.neighbourhood ||
    addr.residential ||
    addr.village ||
    addr.hamlet ||
    addr.county ||
    '';
  const city =
    addr.city ||
    addr.town ||
    addr.municipality ||
    addr.district ||
    addr.state_district ||
    '';
  const state = addr.state || '';
  const postal_code = addr.postcode || '';

  const parts = [house_number, street, area, city, state, postal_code].filter(Boolean);
  const formatted_address = parts.join(', ');

  return {
    formatted_address,
    house_number,
    street,
    area,
    landmark: '',
    city,
    state,
    postal_code,
    latitude: lat,
    longitude: lng,
  };
}

/**
 * Get a human-readable address from GPS coordinates.
 * Falls back to an empty address scaffold on any error.
 * Never throws — callers should always check returned city/state for empty strings.
 */
export async function getAddressFromCoordinates(
  lat: number,
  lng: number
): Promise<GeocodedAddress> {
  if (!isValidCoordinate(lat, lng)) {
    return emptyAddress(lat, lng);
  }

  try {
    // Future: check NEXT_PUBLIC_GEOCODER env var to swap provider
    return await nominatimReverseGeocode(lat, lng);
  } catch (err) {
    // Graceful degradation — return coordinates only
    console.warn('[AgriMark Geocoding] Reverse geocode failed:', err);
    return emptyAddress(lat, lng);
  }
}

/** Debounce helper — used to debounce geocoding during pin drag */
export function debounce<T extends (...args: Parameters<T>) => void>(
  fn: T,
  delayMs: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      timeoutId = null;
      fn(...args);
    }, delayMs);
  };
}
