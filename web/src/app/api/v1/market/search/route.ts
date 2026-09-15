import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  try {
    const cookieStore = cookies();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xrcqzpnstdbbtafhcwbb.supabase.co';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'ey...';

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: { get(name: string) { return cookieStore.get(name)?.value; } },
    });

    const { searchParams } = new URL(request.url);
    const state = searchParams.get('state');
    const district = searchParams.get('district');
    const category = searchParams.get('category');
    const grade = searchParams.get('grade');
    const minPrice = searchParams.get('min_price');
    const maxPrice = searchParams.get('max_price');
    const sort = searchParams.get('sort') || 'newest';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get('page_size') || '20', 10)));

    let query = supabase.from('listings').select('*', { count: 'exact' }).eq('status', 'active');

    if (state && state !== 'All') query = query.eq('state', state);
    if (district && district !== 'All') query = query.eq('district', district);
    if (category && category !== 'All') query = query.eq('crop_category', category);
    if (grade && grade !== 'All') query = query.eq('quality_grade', grade);
    if (minPrice) query = query.gte('price_per_kg', parseFloat(minPrice));
    if (maxPrice) query = query.lte('price_per_kg', parseFloat(maxPrice));

    if (sort === 'price_asc') {
      query = query.order('price_per_kg', { ascending: true });
    } else if (sort === 'price_desc') {
      query = query.order('price_per_kg', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data: listings, count, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      page,
      pageSize,
      totalCount: count || 0,
      totalPages: Math.ceil((count || 0) / pageSize),
      listings: listings || [],
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}
