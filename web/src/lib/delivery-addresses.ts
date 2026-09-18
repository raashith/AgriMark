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
      console.warn('[AgriMark Addresses] Supabase fetch error:', error.message);
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

  const payload: Partial<DeliveryAddress> = {
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
  };

  if (!userId) {
    const localAddr: DeliveryAddress = {
      id: tempId,
      user_id: 'local_user',
      ...payload,
      created_at: now,
      updated_at: now,
    } as DeliveryAddress;
    saveLocalAddress(localAddr);
    return localAddr;
  }

  if (payload.is_default) {
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
        ...payload,
      },
    ])
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to save delivery address: ${error.message}`);
  }

  const saved = data as DeliveryAddress;
  saveLocalAddress(saved);
  return saved;
}

export async function updateDeliveryAddress(
  id: string,
  address: Partial<Omit<DeliveryAddress, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<DeliveryAddress> {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user?.id;

  if (!userId) {
    const existing = getStoredAddressesLocally();
    const target = existing.find((a) => a.id === id);
    if (!target) throw new Error('Address not found.');
    const updated = { ...target, ...address, updated_at: new Date().toISOString() };
    saveLocalAddress(updated);
    return updated;
  }

  if (address.is_default) {
    await supabase
      .from('delivery_addresses')
      .update({ is_default: false })
      .eq('user_id', userId);
  }

  const { data, error } = await supabase
    .from('delivery_addresses')
    .update({ ...address, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update address: ${error.message}`);
  }

  const updated = data as DeliveryAddress;
  saveLocalAddress(updated);
  return updated;
}

export async function deleteDeliveryAddress(id: string): Promise<void> {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user?.id;

  if (!userId) {
    const existing = getStoredAddressesLocally();
    const updated = existing.filter((a) => a.id !== id);
    persistAddressesLocally(updated);
    if (updated.length > 0 && !updated.some((a) => a.is_default)) {
      updated[0].is_default = true;
      persistAddressesLocally(updated);
    }
    return;
  }

  // Check if target is default
  const addresses = await getDeliveryAddresses();
  const target = addresses.find((a) => a.id === id);

  const { error } = await supabase
    .from('delivery_addresses')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) {
    throw new Error(`Failed to delete address: ${error.message}`);
  }

  // If deleted address was default, promote remaining address
  const remaining = addresses.filter((a) => a.id !== id);
  if (target?.is_default && remaining.length > 0) {
    await setDefaultAddress(remaining[0].id);
  } else if (remaining.length === 0 && typeof window !== 'undefined') {
    localStorage.removeItem(ADDRESS_STORAGE_KEY);
    localStorage.removeItem('agrimark_delivery_addresses');
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

  await supabase
    .from('delivery_addresses')
    .update({ is_default: false })
    .eq('user_id', userId);

  const { error } = await supabase
    .from('delivery_addresses')
    .update({ is_default: true })
    .eq('id', addressId)
    .eq('user_id', userId);

  if (error) {
    throw new Error(`Failed to set default address: ${error.message}`);
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
