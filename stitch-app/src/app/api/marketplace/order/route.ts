import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  const jar = cookies();
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!, {
    cookies: { getAll: () => jar.getAll(), setAll: (items) => items.forEach(({ name, value, options }) => jar.set(name, value, options)) }
  });
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: 'Sign in before placing an order.' }, { status: 401 });
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
  if (profile?.role !== 'buyer') return NextResponse.json({ error: 'Buyer account required.' }, { status: 403 });
  let body: any;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid request.' }, { status: 400 }); }
  const listingId = typeof body.listingId === 'string' ? body.listingId : '';
  const quantity = Number(body.quantityKg);
  const address = typeof body.deliveryAddress === 'string' ? body.deliveryAddress.trim() : '';
  const note = typeof body.note === 'string' ? body.note.trim().slice(0, 500) : '';
  if (!listingId || !Number.isFinite(quantity) || quantity <= 0 || !address || address.length > 1000) return NextResponse.json({ error: 'Enter a valid quantity and delivery address.' }, { status: 400 });
  const { data, error } = await supabase.rpc('create_marketplace_order', { p_listing_id: listingId, p_buyer_id: user.id, p_quantity_kg: quantity, p_delivery_address: { address }, p_buyer_note: note || null });
  if (error) return NextResponse.json({ error: 'Could not reserve the order. Refresh listing availability and try again.' }, { status: 409 });
  return NextResponse.json({ order: data }, { status: 201 });
}
