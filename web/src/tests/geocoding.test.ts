/**
 * geocoding.test.ts
 *
 * Unit tests for the reverse geocoding abstraction.
 * These tests use the global fetch mock and do not make real HTTP calls.
 */

import { getAddressFromCoordinates, isValidCoordinate, debounce } from '../lib/geocoding';

// ─── isValidCoordinate ────────────────────────────────────────────────────────

describe('isValidCoordinate', () => {
  it('returns true for valid coordinates', () => {
    expect(isValidCoordinate(13.0827, 80.2707)).toBe(true);
    expect(isValidCoordinate(-33.8688, 151.2093)).toBe(true);
    expect(isValidCoordinate(0, 0)).toBe(true);
    expect(isValidCoordinate(90, 180)).toBe(true);
    expect(isValidCoordinate(-90, -180)).toBe(true);
  });

  it('returns false for NaN', () => {
    expect(isValidCoordinate(NaN, 80)).toBe(false);
    expect(isValidCoordinate(13, NaN)).toBe(false);
  });

  it('returns false for Infinity', () => {
    expect(isValidCoordinate(Infinity, 80)).toBe(false);
    expect(isValidCoordinate(13, -Infinity)).toBe(false);
  });

  it('returns false for out-of-range values', () => {
    expect(isValidCoordinate(91, 80)).toBe(false);
    expect(isValidCoordinate(-91, 80)).toBe(false);
    expect(isValidCoordinate(13, 181)).toBe(false);
    expect(isValidCoordinate(13, -181)).toBe(false);
  });

  it('returns false for non-number types', () => {
    // @ts-expect-error Testing runtime behavior
    expect(isValidCoordinate('13', 80)).toBe(false);
    // @ts-expect-error Testing runtime behavior
    expect(isValidCoordinate(null, 80)).toBe(false);
  });
});

// ─── getAddressFromCoordinates ────────────────────────────────────────────────

describe('getAddressFromCoordinates', () => {
  const mockFetch = jest.fn();
  global.fetch = mockFetch;

  beforeEach(() => {
    mockFetch.mockClear();
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns a well-structured address on success', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        address: {
          house_number: '42',
          road: 'Main Mandi Road',
          suburb: 'Anna Nagar',
          city: 'Chennai',
          state: 'Tamil Nadu',
          postcode: '600040',
        },
      }),
    });

    const result = await getAddressFromCoordinates(13.0827, 80.2707);

    expect(result.house_number).toBe('42');
    expect(result.street).toBe('Main Mandi Road');
    expect(result.area).toBe('Anna Nagar');
    expect(result.city).toBe('Chennai');
    expect(result.state).toBe('Tamil Nadu');
    expect(result.postal_code).toBe('600040');
    expect(result.latitude).toBe(13.0827);
    expect(result.longitude).toBe(80.2707);
    expect(result.formatted_address).toBeTruthy();
  });

  it('returns latitude/longitude even when geocoding returns empty fields', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ address: {} }),
    });

    const result = await getAddressFromCoordinates(20.0, 77.0);
    expect(result.latitude).toBe(20.0);
    expect(result.longitude).toBe(77.0);
    expect(result.city).toBe('');
  });

  it('returns empty scaffold on HTTP failure (never throws)', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 503 });

    const result = await getAddressFromCoordinates(13.0, 80.0);
    expect(result.latitude).toBe(13.0);
    expect(result.longitude).toBe(80.0);
    expect(result.city).toBe('');
  });

  it('returns empty scaffold on network error (never throws)', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const result = await getAddressFromCoordinates(13.0, 80.0);
    expect(result.latitude).toBe(13.0);
    expect(result.longitude).toBe(80.0);
    expect(result.formatted_address).toBe('');
  });

  it('returns empty scaffold for invalid coordinates', async () => {
    const result = await getAddressFromCoordinates(NaN, 80.0);
    expect(result.formatted_address).toBe('');
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('sends Accept-Language: en header', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ address: { city: 'Mumbai', state: 'Maharashtra', postcode: '400001' } }),
    });

    await getAddressFromCoordinates(19.076, 72.877);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [, options] = mockFetch.mock.calls[0];
    expect(options.headers['Accept-Language']).toBe('en');
  });

  it('uses town as city fallback', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        address: { town: 'Udhagamandalam', state: 'Tamil Nadu', postcode: '643001' },
      }),
    });

    const result = await getAddressFromCoordinates(11.4064, 76.6932);
    expect(result.city).toBe('Udhagamandalam');
  });
});

// ─── debounce ─────────────────────────────────────────────────────────────────

describe('debounce', () => {
  jest.useFakeTimers();

  afterEach(() => {
    jest.clearAllTimers();
  });

  it('delays function execution by the given delay', () => {
    const fn = jest.fn();
    const debounced = debounce(fn, 500);

    debounced('a');
    expect(fn).not.toHaveBeenCalled();

    jest.advanceTimersByTime(499);
    expect(fn).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('a');
  });

  it('only calls function once for rapid calls', () => {
    const fn = jest.fn();
    const debounced = debounce(fn, 300);

    debounced(1);
    debounced(2);
    debounced(3);

    jest.runAllTimers();
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(3);
  });
});
