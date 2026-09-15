import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const cookieStore = cookies();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xrcqzpnstdbbtafhcwbb.supabase.co';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'ey...';

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: { get(name: string) { return cookieStore.get(name)?.value; } },
    });

    const { searchParams } = new URL(request.url);
    const district = searchParams.get('district');
    const state = searchParams.get('state');

    let query = supabase.from('fpos').select('*, fpo_members(count), fpo_aggregated_lots(*)');
    if (district) query = query.eq('district', district);
    if (state) query = query.eq('state', state);

    const { data: fpos, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, count: fpos?.length || 0, fpos });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xrcqzpnstdbbtafhcwbb.supabase.co';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'ey...';

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: { get(name: string) { return cookieStore.get(name)?.value; } },
    });

    const body = await request.json();
    const { action, fpo_id, title, crop_id, crop_name, quality_grade, asking_price_per_kg, member_sources } = body;

    if (action === 'aggregate_lot') {
      if (!fpo_id || !title || !crop_id || !member_sources || !Array.isArray(member_sources)) {
        return NextResponse.json({ error: 'Missing required lot aggregation parameters.' }, { status: 400 });
      }

      // Calculate total aggregated quantity from source farmer lots
      const totalQuantity = member_sources.reduce((sum: number, src: any) => sum + (Number(src.contributed_kg) || 0), 0);

      const { data: aggregatedLot, error: aggErr } = await supabase
        .from('fpo_aggregated_lots')
        .insert({
          fpo_id,
          title,
          crop_id,
          crop_name,
          total_quantity_kg: totalQuantity,
          available_quantity_kg: totalQuantity,
          quality_grade: quality_grade || 'Grade A',
          asking_price_per_kg: asking_price_per_kg || 0,
          member_sources: JSON.stringify(member_sources),
          status: 'active',
          created_at: new Date().toISOString(),
        })
        .select('*')
        .single();

      if (aggErr) {
        return NextResponse.json({ error: aggErr.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, aggregatedLot });
    }

    return NextResponse.json({ error: 'Invalid FPO action specified.' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}



