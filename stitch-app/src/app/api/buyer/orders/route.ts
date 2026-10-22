import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET() {
  const jar = cookies();
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!, {
    cookies: { getAll: () => jar.getAll(), setAll: (items) => items.forEach(({ name, value, options }) => jar.set(name, value, options)) }
  });
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
  if (profile?.role !== 'buyer') return NextResponse.json({ error: 'Buyer access required.' }, { status: 403 });
  const { data, error: queryError } = await supabase.from('marketplace_orders').select('id,listing_id,seller_id,quantity_kg,total_price,currency,status,delivery_address,buyer_note,created_at,updated_at,listing:listings(title,price_per_unit,lot_id),seller:profiles!marketplace_orders_seller_id_fkey(full_name)').eq('buyer_id', user.id).order('created_at', { ascending: false });
  if (queryError) return NextResponse.json({ error: 'Unable to load orders.' }, { status: 500 });
  return NextResponse.json({ orders: data || [] });
}
