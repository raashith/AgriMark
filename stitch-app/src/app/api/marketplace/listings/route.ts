import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const jar = cookies();
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!, {
    cookies: { getAll: () => jar.getAll(), setAll: (items) => items.forEach(({ name, value, options }) => jar.set(name, value, options)) }
  });
  const { data: { user } } = await supabase.auth.getUser();
  const params = new URL(request.url).searchParams;
  const term = (params.get('search') || '').trim().slice(0, 100).replace(/[%,]/g, '');
  const grade = (params.get('grade') || '').trim();
  let query = supabase.from('listings').select('id,lot_id,seller_id,title,price_per_unit,currency,min_order_quantity,status,created_at,seller:profiles!listings_seller_id_fkey(full_name,role),lot:produce_lots!listings_lot_id_fkey(id,crop_id,quantity,available_quantity,quality_grade,status,is_listed,crops(name),farms(district,state))').eq('status', 'active').order('created_at', { ascending: false }).limit(100);
  if (term) query = query.ilike('title', '%' + term + '%');
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: 'Unable to load active listings.' }, { status: 500 });
  const listings = (data || []).filter((x: any) => (!grade || x.lot?.quality_grade === grade) && Number(x.lot?.available_quantity ?? x.lot?.quantity ?? 0) >= Number(x.min_order_quantity)).map((x: any) => ({
    id: x.id, title: x.title, pricePerUnit: Number(x.price_per_unit), currency: x.currency, minOrderQuantity: Number(x.min_order_quantity),
    availableKg: Number(x.lot?.available_quantity ?? x.lot?.quantity ?? 0), grade: x.lot?.quality_grade || 'Unspecified',
    sellerName: x.seller?.full_name || 'AgriMark seller', cropName: x.lot?.crops?.name || x.title, district: x.lot?.farms?.district || '', state: x.lot?.farms?.state || ''
  }));
  return NextResponse.json({ listings, authenticated: !!user });
}
