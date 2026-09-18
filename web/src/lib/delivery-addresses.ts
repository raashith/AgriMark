import { supabase } from './supabase';
import { DeliveryAddress } from '@/types';

const ADDRESS_STORAGE_KEY = 'agrimark_selected_address';

export async function getDeliveryAddresses(): Promise<DeliveryAddress[]> {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id;
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
    if (addresses.length > 0) {
      persistAddressesLocally(addresses);
    }
    return addresses;
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
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user?.id;

  const tempId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `addr_${Date.now()}`;
  const now = new Date().toISOString();

  const newAddress: DeliveryAddress = {
    id: tempId,
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

  if (!userId) {
    saveLocalAddress(newAddress);
    return newAddress;
  }

  try {
    if (newAddress.is_default) {
      await supabase
        .from('delivery_addresses')
        .update({ is_default: false })
        .eq('user_id', userId);
    }

    const { data, error } = await supabase
      .from('delivery_addresses')
      .insert([
        {
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
        },
      ])
      .select()
      .single();

    if (error) {
      console.warn('[AgriMark Addresses] Insert fallback to local due to error:', error.message);
      saveLocalAddress(newAddress);
      return newAddress;
    }

    const saved = data as DeliveryAddress;
    saveLocalAddress(saved);
    return saved;
  } catch (err) {
    console.warn('[AgriMark Addresses] Remote save error:', err);
    saveLocalAddress(newAddress);
    return newAddress;
  }
}

export async function setDefaultAddress(addressId: string): Promise<void> {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user?.id;

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
