/**
 * validate-address.ts
 *
 * Server-safe address ownership validation helper.
 *
 * Usage at checkout / order creation:
 *   const address = await validateAddressOwnership(addressId);
 *   // Throws if not found or not owned by current session user.
 *   // Returns the full DeliveryAddress if valid.
 *
 * This enforces defense-in-depth even if client-side checks are bypassed.
 * Supabase RLS is the primary guard — this is a secondary application-level check.
 */

import { supabase } from '@/lib/supabase';
import type { DeliveryAddress } from '@/types';

/**
 * Validate that the address identified by `addressId` belongs to the currently
 * authenticated user. Returns the address record if ownership is confirmed.
 *
 * @throws Error if no session exists, address is not found, or ownership fails.
 */
export async function validateAddressOwnership(addressId: string): Promise<DeliveryAddress> {
  if (!addressId || typeof addressId !== 'string') {
    throw new Error('Invalid address ID.');
  }


  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session?.user) {
    throw new Error('You must be signed in to use a delivery address.');
  }

  const userId = session.user.id;

  const { data, error } = await supabase
    .from('delivery_addresses')
    .select('*')
    .eq('id', addressId)
    .eq('user_id', userId) // application-level ownership check (RLS is primary guard)
    .single();

  if (error || !data) {
    throw new Error('Delivery address not found or access denied.');
  }

  return data as DeliveryAddress;
}

/**
 * Get the current user's default delivery address, validated server-side.
 * Returns null if no default exists (user has no addresses yet).
 *
 * @throws Error if no session exists.
 */
export async function getValidatedDefaultAddress(): Promise<DeliveryAddress | null> {

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session?.user) {
    throw new Error('You must be signed in to get a delivery address.');
  }

  const { data, error } = await supabase
    .from('delivery_addresses')
    .select('*')
    .eq('user_id', session.user.id)
    .eq('is_default', true)
    .single();

  if (error || !data) return null;

  return data as DeliveryAddress;
}
