import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

async function getClient() {
  const jar = cookies();
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!, {
    cookies: { getAll: () => jar.getAll(), setAll: (items) => items.forEach(({ name, value, options }) => jar.set(name, value, options)) }
  });
  const { data: { user }, error } = await supabase.auth.getUser();
  return { supabase, user, error };
}

export async function GET() {
  const { supabase, user, error } = await getClient();
  if (error || !user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
  if (profile?.role !== 'buyer') return NextResponse.json({ error: 'Buyer access required.' }, { status: 403 });
  const { data: buyer } = await supabase.from('buyer_profiles').select('id').eq('user_id', user.id).maybeSingle();
  if (!buyer) return NextResponse.json({ rfqs: [] });
  const { data, error: queryError } = await supabase.from('buyer_rfqs').select('id,crop_id,quantity,unit,target_price,delivery_district,delivery_state,deadline,status,created_at,crops(name)').eq('buyer_id', buyer.id).order('created_at', { ascending: false });
  if (queryError) return NextResponse.json({ error: 'Unable to load RFQs.' }, { status: 500 });
  return NextResponse.json({ rfqs: data || [] });
}

export async function POST(request: Request) {
  const { supabase, user, error } = await getClient();
  if (error || !user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
  if (profile?.role !== 'buyer') return NextResponse.json({ error: 'Buyer access required.' }, { status: 403 });
  let body: any;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 }); }
  const cropName = typeof body.cropName === 'string' ? body.cropName.trim() : '';
  const quantity = Number(body.quantity);
  const targetPrice = body.targetPrice === '' || body.targetPrice == null ? null : Number(body.targetPrice);
  const district = typeof body.district === 'string' ? body.district.trim() : '';
  const state = typeof body.state === 'string' ? body.state.trim() : '';
  const deadline = typeof body.deadline === 'string' ? body.deadline : '';
  if (!cropName || cropName.length > 120 || !Number.isFinite(quantity) || quantity <= 0 || (targetPrice !== null && (!Number.isFinite(targetPrice) || targetPrice < 0)) || district.length > 120 || state.length > 120 || !deadline || Number.isNaN(Date.parse(deadline)) || new Date(deadline) <= new Date()) {
    return NextResponse.json({ error: 'Enter a crop, positive quantity, optional valid target price, and future deadline.' }, { status: 400 });
  }
  const { data: buyer, error: buyerError } = await supabase.from('buyer_profiles').select('id').eq('user_id', user.id).maybeSingle();
  if (buyerError) return NextResponse.json({ error: 'Unable to verify buyer profile.' }, { status: 500 });
  let buyerId = buyer?.id;
  if (!buyerId) {
    const { data: created, error: createError } = await supabase.from('buyer_profiles').insert({ user_id: user.id, buyer_type: 'individual' }).select('id').single();
    if (createError || !created) return NextResponse.json({ error: 'Complete your buyer profile before publishing an RFQ.' }, { status: 400 });
    buyerId = created.id;
  }
  const { data: crop } = await supabase.from('crops').select('id').ilike('name', cropName).limit(1).maybeSingle();
  if (!crop) return NextResponse.json({ error: 'Crop not found. Use a crop name from the AgriMark catalogue.' }, { status: 400 });
  const { data, error: insertError } = await supabase.from('buyer_rfqs').insert({ buyer_id: buyerId, crop_id: crop.id, quantity, unit: 'kg', target_price: targetPrice, delivery_district: district || null, delivery_state: state || null, deadline: new Date(deadline).toISOString(), status: 'open' }).select('id,crop_id,quantity,unit,target_price,delivery_district,delivery_state,deadline,status,created_at').single();
  if (insertError || !data) return NextResponse.json({ error: 'Could not publish RFQ. Check buyer profile permissions.' }, { status: 500 });
  return NextResponse.json({ rfq: data }, { status: 201 });
}
