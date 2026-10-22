import { supabase } from './supabase';
import { DeliveryAddress } from '@/types';

const ADDRESS_STORAGE_KEY = 'agrimark_selected_address';

function getCurrentUserId(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const rawUser = localStorage.getItem('agrimark_user');
    if (rawUser) {
      const parsed = JSON.parse(rawUser);
      if (parsed?.id) return parsed.id;
    }
  } catch {}
  return null;
}

export async function getDeliveryAddresses(): Promise<DeliveryAddress[]> {
  try {
    const userId = getCurrentUserId();
    if (!userId) return getStoredAddressesLocally();
    const { data, error } = await supabase.from('delivery_addresses').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    if (error) {
      console.warn('[AgriMark Addresses] Supabase fetch warning:', error.message);
      return getStoredAddressesLocally();
    }
    const addresses = (data as DeliveryAddress[]) || [];
    persistAddressesLocally(addresses);
    return addresses;
  } catch (err) {
    console.warn('[AgriMark Addresses] Fetch failed:', err);
    return getStoredAddressesLocally();
  }
}

export async function getDefaultAddress(): Promise<DeliveryAddress | null> {
  const addresses = await getDeliveryAddresses();
  if (addresses.length === 0) return null;
  const storedSelected = getActiveSelectedAddressSync();
  const selected = addresses.find(a => a.id === storedSelected?.id) || addresses.find(a => a.is_default) || addresses[0];
  if (typeof window !== 'undefined') localStorage.setItem(ADDRESS_STORAGE_KEY, JSON.stringify(selected));
  return selected;
}

export async function saveDeliveryAddress(
  address: Omit<DeliveryAddress, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<DeliveryAddress> {
  const userId = getCurrentUserId();
  const tempId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `addr_${Date.now()}`;
  const now = new Date().toISOString();
  const newAddress: DeliveryAddress = {
    id: tempId, user_id: userId || 'local_user', label: address.label || 'Home',
    full_name: address.full_name, phone: address.phone, house_number: address.house_number,
    street: address.street, area: address.area, landmark: address.landmark || null,
    city: address.city, state: address.state, postal_code: address.postal_code,
    latitude: address.latitude ?? null, longitude: address.longitude ?? null,
    location_accuracy: address.location_accuracy ?? null, is_default: address.is_default ?? true,
    delivery_instructions: address.delivery_instructions || null, created_at: now, updated_at: now,
  };

  if (!userId) {
    const existing = getStoredAddressesLocally();
    const makeDefault = newAddress.is_default || existing.length === 0;
    const updated = [...existing.map(a => ({ ...a, is_default: makeDefault ? false : a.is_default })), { ...newAddress, is_default: makeDefault }];
    persistAddressesLocally(updated);
    if (makeDefault) localStorage.setItem(ADDRESS_STORAGE_KEY, JSON.stringify({ ...newAddress, is_default: true }));
    return { ...newAddress, is_default: makeDefault };
  }

  try {
    const existing = await getDeliveryAddresses();
    const makeDefault = newAddress.is_default || existing.length === 0;
    if (makeDefault) {
      const { error: clearError } = await supabase.from('delivery_addresses').update({ is_default: false }).eq('user_id', userId);
      if (clearError) throw clearError;
    }
    const { data, error } = await supabase.from('delivery_addresses').insert([{
      user_id: userId, label: newAddress.label, full_name: newAddress.full_name, phone: newAddress.phone,
      house_number: newAddress.house_number, street: newAddress.street, area: newAddress.area,
      landmark: newAddress.landmark, city: newAddress.city, state: newAddress.state, postal_code: newAddress.postal_code,
      latitude: newAddress.latitude, longitude: newAddress.longitude, location_accuracy: newAddress.location_accuracy,
      is_default: makeDefault, delivery_instructions: newAddress.delivery_instructions,
    }]).select().single();
    if (error) throw error;
    const saved = data as DeliveryAddress;
    const updated = [...existing.map(a => ({ ...a, is_default: makeDefault ? false : a.is_default })), saved];
    persistAddressesLocally(updated);
    if (makeDefault) localStorage.setItem(ADDRESS_STORAGE_KEY, JSON.stringify(saved));
    return saved;
  } catch (err) {
    console.warn('[AgriMark Addresses] Remote save failed; saving locally:', err);
    const existing = getStoredAddressesLocally();
    const makeDefault = newAddress.is_default || existing.length === 0;
    const updated = [...existing.map(a => ({ ...a, is_default: makeDefault ? false : a.is_default })), { ...newAddress, is_default: makeDefault }];
    persistAddressesLocally(updated);
    if (makeDefault) localStorage.setItem(ADDRESS_STORAGE_KEY, JSON.stringify({ ...newAddress, is_default: true }));
    return { ...newAddress, is_default: makeDefault };
  }
}

export async function setDefaultAddress(addressId: string): Promise<void> {
  const userId = getCurrentUserId();
  const addresses = await getDeliveryAddresses();
  const target = addresses.find(a => a.id === addressId);
  if (!target) return;

  const updated = addresses.map(a => ({ ...a, is_default: a.id === addressId }));
  persistAddressesLocally(updated);
  if (typeof window !== 'undefined') localStorage.setItem(ADDRESS_STORAGE_KEY, JSON.stringify({ ...target, is_default: true }));
  if (!userId) return;

  const { error: clearError } = await supabase.from('delivery_addresses').update({ is_default: false }).eq('user_id', userId);
  if (clearError) throw clearError;
  const { error: setError } = await supabase.from('delivery_addresses').update({ is_default: true }).eq('id', addressId).eq('user_id', userId);
  if (setError) throw setError;
}

export async function updateDeliveryAddress(addressId: string, patch: Partial<DeliveryAddress>): Promise<DeliveryAddress> {
  const userId = getCurrentUserId();
  const allowed: Partial<DeliveryAddress> = {
    label: patch.label, full_name: patch.full_name, phone: patch.phone, house_number: patch.house_number,
    street: patch.street, area: patch.area, landmark: patch.landmark, city: patch.city, state: patch.state,
    postal_code: patch.postal_code, delivery_instructions: patch.delivery_instructions,
  };
  Object.keys(allowed).forEach(key => allowed[key as keyof DeliveryAddress] === undefined && delete allowed[key as keyof DeliveryAddress]);
  const addresses = await getDeliveryAddresses();
  const existing = addresses.find(a => a.id === addressId);
  if (!existing) throw new Error('Address not found.');
  let saved: DeliveryAddress = { ...existing, ...allowed, updated_at: new Date().toISOString() };
  if (userId && !addressId.startsWith('addr_')) {
    const { data, error } = await supabase.from('delivery_addresses').update(allowed).eq('id', addressId).eq('user_id', userId).select().single();
    if (error) throw error;
    saved = data as DeliveryAddress;
  }
  const updated = addresses.map(a => a.id === addressId ? saved : a);
  persistAddressesLocally(updated);
  if (getActiveSelectedAddressSync()?.id === addressId && typeof window !== 'undefined') {
    localStorage.setItem(ADDRESS_STORAGE_KEY, JSON.stringify(saved));
  }
  return saved;
}

export async function deleteDeliveryAddress(addressId: string): Promise<void> {
  const userId = getCurrentUserId();
  const addresses = await getDeliveryAddresses();
  const target = addresses.find(a => a.id === addressId);
  if (!target) return;
  if (userId && !addressId.startsWith('addr_')) {
    const { error } = await supabase.from('delivery_addresses').delete().eq('id', addressId).eq('user_id', userId);
    if (error) throw error;
  }
  const remaining = addresses.filter(a => a.id !== addressId);
  if (target.is_default && remaining.length > 0) {
    const next = remaining[0];
    await setDefaultAddress(next.id);
    const synced = remaining.map(a => ({ ...a, is_default: a.id === next.id }));
    persistAddressesLocally(synced);
    if (typeof window !== 'undefined') localStorage.setItem(ADDRESS_STORAGE_KEY, JSON.stringify({ ...next, is_default: true }));
  } else {
    persistAddressesLocally(remaining);
    if (typeof window !== 'undefined' && getActiveSelectedAddressSync()?.id === addressId) {
      if (remaining[0]) localStorage.setItem(ADDRESS_STORAGE_KEY, JSON.stringify(remaining[0]));
      else localStorage.removeItem(ADDRESS_STORAGE_KEY);
    }
  }
}

function saveLocalAddress(addr: DeliveryAddress) {
  const existing = getStoredAddressesLocally();
  const updated = [...existing.filter(a => a.id !== addr.id), addr];
  persistAddressesLocally(updated);
  if (addr.is_default && typeof window !== 'undefined') localStorage.setItem(ADDRESS_STORAGE_KEY, JSON.stringify(addr));
}

function getStoredAddressesLocally(): DeliveryAddress[] {
  if (typeof window === 'undefined') return [];
  try { const raw = localStorage.getItem('agrimark_delivery_addresses'); return raw ? JSON.parse(raw) : []; } catch { return []; }
}

function persistAddressesLocally(addresses: DeliveryAddress[]) {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem('agrimark_delivery_addresses', JSON.stringify(addresses)); } catch {}
}

export function getActiveSelectedAddressSync(): DeliveryAddress | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(ADDRESS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
    const list = getStoredAddressesLocally();
    return list.find(a => a.is_default) || list[0] || null;
  } catch { return null; }
}
