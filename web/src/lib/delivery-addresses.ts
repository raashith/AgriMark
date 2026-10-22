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
    if (!userId) {
      return getStoredAddressesLocally();
    }

    const { data, error } = await supabase
      .from('delivery_addresses')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[AgriMark Addresses] Supabase fetch warning:', error.message);
      return getStoredAddressesLocally();
    }

    const addresses = (data as DeliveryAddress[]) || [];
    const localAddresses = getStoredAddressesLocally();

    // If the remote table is empty (or an insert previously fell back to local storage),
    // keep locally saved addresses visible rather than replacing the list with an empty result.
    if (addresses.length === 0) {
      return localAddresses;
    }

    // Merge local-only addresses that are not yet present remotely; prefer remote rows by id.
    const remoteIds = new Set(addresses.map((address) => address.id));
    const merged = [...addresses, ...localAddresses.filter((address) => !remoteIds.has(address.id))];
    persistAddressesLocally(merged);
    return merged;
  } catch (err) {
    console.warn('[AgriMark Addresses] Fetch failed:', err);
    return getStoredAddressesLocally();
  }
}

export async function getDefaultAddress(): Promise<DeliveryAddress | null> {
  const addresses = await getDeliveryAddresses();
  if (addresses.length === 0) return null;
  const defaultAddr = addresses.find((a) => a.is_default) || addresses[0];
  if (defaultAddr && typeof window !== 'undefined') {
    localStorage.setItem(ADDRESS_STORAGE_KEY, JSON.stringify(defaultAddr));
  }
  return defaultAddr;
}

export async function saveDeliveryAddress(
  address: Omit<DeliveryAddress, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<DeliveryAddress> {
  const userId = getCurrentUserId();
  const now = new Date().toISOString();
  const newAddress: DeliveryAddress = {
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `addr_${Date.now()}`,
    user_id: userId || 'local_user',
    label: address.label || 'Home',
    full_name: address.full_name,
    phone: address.phone,
    house_number: address.house_number,
    street: address.street,
    area: address.area,
    landmark: address.landmark || null,
    city: address.city,
    state: address.state,
    postal_code: address.postal_code,
    latitude: address.latitude ?? null,
    longitude: address.longitude ?? null,
    location_accuracy: address.location_accuracy ?? null,
    is_default: address.is_default ?? true,
    delivery_instructions: address.delivery_instructions || null,
    created_at: now,
    updated_at: now,
  };

  // Guests/local demo users have no authenticated Supabase identity to satisfy RLS.
  if (!userId) {
    saveLocalAddress(newAddress);
    return newAddress;
  }

  // Do not silently report a local-only fallback as a successful database save.
  // A missing returned row is handled explicitly instead of PostgREST's .single() error.
  if (newAddress.is_default) {
    const { error: clearError } = await supabase
      .from('delivery_addresses')
      .update({ is_default: false })
      .eq('user_id', userId);
    if (clearError) throw new Error(`Could not update the default address: ${clearError.message}`);
  }

  const { data, error } = await supabase
    .from('delivery_addresses')
    .insert({
      user_id: userId,
      label: newAddress.label,
      full_name: newAddress.full_name,
      phone: newAddress.phone,
      house_number: newAddress.house_number,
      street: newAddress.street,
      area: newAddress.area,
      landmark: newAddress.landmark,
      city: newAddress.city,
      state: newAddress.state,
      postal_code: newAddress.postal_code,
      latitude: newAddress.latitude,
      longitude: newAddress.longitude,
      location_accuracy: newAddress.location_accuracy,
      is_default: newAddress.is_default,
      delivery_instructions: newAddress.delivery_instructions,
    })
    .select()
    .maybeSingle();

  if (error) throw new Error(`Supabase could not save this address: ${error.message}`);
  if (!data) throw new Error('Supabase did not return the saved address. Check the signed-in user and delivery_addresses INSERT policy.');

  const saved = data as DeliveryAddress;
  saveLocalAddress(saved);
  return saved;
}

export async function setDefaultAddress(addressId: string): Promise<void> {
  const userId = getCurrentUserId();

  const addresses = await getDeliveryAddresses();
  const target = addresses.find((a) => a.id === addressId);
  if (target && typeof window !== 'undefined') {
    localStorage.setItem(ADDRESS_STORAGE_KEY, JSON.stringify({ ...target, is_default: true }));
  }

  if (!userId) return;

  try {
    await supabase
      .from('delivery_addresses')
      .update({ is_default: false })
      .eq('user_id', userId);

    await supabase
      .from('delivery_addresses')
      .update({ is_default: true })
      .eq('id', addressId)
      .eq('user_id', userId);
  } catch (err) {
    console.warn('[AgriMark Addresses] Set default failed:', err);
  }
}

function saveLocalAddress(addr: DeliveryAddress) {
  if (typeof window === 'undefined') return;
  const existing = getStoredAddressesLocally();
  const updated = [addr, ...existing.filter((a) => a.id !== addr.id)];
  persistAddressesLocally(updated);
  if (addr.is_default) {
    localStorage.setItem(ADDRESS_STORAGE_KEY, JSON.stringify(addr));
  }
}

function getStoredAddressesLocally(): DeliveryAddress[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('agrimark_delivery_addresses');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persistAddressesLocally(addresses: DeliveryAddress[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('agrimark_delivery_addresses', JSON.stringify(addresses));
  } catch {}
}

export function getActiveSelectedAddressSync(): DeliveryAddress | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(ADDRESS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
    const list = getStoredAddressesLocally();
    return list.find((a) => a.is_default) || list[0] || null;
  } catch {
    return null;
  }
}


export async function updateDeliveryAddress(
  addressId: string,
  changes: Partial<Omit<DeliveryAddress, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<DeliveryAddress> {
  const userId = getCurrentUserId();
  const existing = await getDeliveryAddresses();
  const current = existing.find((addr) => addr.id === addressId);
  if (!current) throw new Error('Address not found.');

  const updated: DeliveryAddress = { ...current, ...changes, updated_at: new Date().toISOString() };
  if (!userId || current.user_id === 'local_user') {
    const next = existing.map((addr) => addr.id === addressId ? updated : addr);
    persistAddressesLocally(next);
    const selected = getActiveSelectedAddressSync();
    if (selected?.id === addressId) localStorage.setItem(ADDRESS_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  }

  const { data, error } = await supabase
    .from('delivery_addresses')
    .update({
      label: updated.label,
      full_name: updated.full_name,
      phone: updated.phone,
      house_number: updated.house_number,
      street: updated.street,
      area: updated.area,
      landmark: updated.landmark,
      city: updated.city,
      state: updated.state,
      postal_code: updated.postal_code,
      delivery_instructions: updated.delivery_instructions,
      updated_at: updated.updated_at,
    })
    .eq('id', addressId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  const saved = data as DeliveryAddress;
  persistAddressesLocally(existing.map((addr) => addr.id === addressId ? saved : addr));
  const selected = getActiveSelectedAddressSync();
  if (selected?.id === addressId) localStorage.setItem(ADDRESS_STORAGE_KEY, JSON.stringify(saved));
  return saved;
}

export async function deleteDeliveryAddress(addressId: string): Promise<void> {
  const userId = getCurrentUserId();
  const existing = await getDeliveryAddresses();
  const target = existing.find((addr) => addr.id === addressId);
  if (!target) return;

  if (userId && target.user_id !== 'local_user') {
    const { error } = await supabase
      .from('delivery_addresses')
      .delete()
      .eq('id', addressId)
      .eq('user_id', userId);
    if (error) throw new Error(error.message);
  }

  const remaining = existing.filter((addr) => addr.id !== addressId);
  persistAddressesLocally(remaining);
  const selected = getActiveSelectedAddressSync();
  if (selected?.id === addressId) {
    const next = remaining.find((addr) => addr.is_default) || remaining[0];
    if (next) {
      localStorage.setItem(ADDRESS_STORAGE_KEY, JSON.stringify(next));
    } else {
      localStorage.removeItem(ADDRESS_STORAGE_KEY);
    }
  }
}
