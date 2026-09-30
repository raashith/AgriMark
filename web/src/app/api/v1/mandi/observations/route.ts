import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(5000, Math.max(1, Number.parseInt(searchParams.get('limit') || '2000', 10) || 2000));
    const commodityCode = searchParams.get('commodity_code') || '';
    const mandiCode = searchParams.get('mandi_code') || '';
    const stateCode = searchParams.get('state_code') || '';
    const districtCode = searchParams.get('district_code') || '';
    const from = searchParams.get('date_from') || '';
    const to = searchParams.get('date_to') || '';

    const cookieStore = cookies();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xrcqzpnstdbbtafhcwbb.supabase.co';
    const supabaseKey =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      '';

    if (!supabaseKey) {
      return NextResponse.json(
        { success: false, error: 'Supabase publishable key is not configured.' },
        { status: 503 },
      );
    }

    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    });

    let query = supabase
      .from('national_market_price_observations')
      .select(
        'commodity_code,commodity_name,mandi_code,mandi_name,state_code,district_code,observed_at,modal_price,min_price,max_price,arrival_quantity_mt,source,retrieved_at',
      )
      .eq('price_signal_type', 'OBSERVED_MANDI')
      .eq('validation_status', 'VALIDATED')
      .eq('is_synthetic', false)
      .order('observed_at', { ascending: false })
      .limit(limit);

    if (commodityCode) query = query.eq('commodity_code', commodityCode.toUpperCase());
    if (mandiCode) query = query.eq('mandi_code', mandiCode);
    if (stateCode) query = query.eq('state_code', stateCode.toUpperCase());
    if (districtCode) query = query.eq('district_code', districtCode);
    if (from) query = query.gte('observed_at', `${from}T00:00:00.000Z`);
    if (to) query = query.lte('observed_at', `${to}T23:59:59.999Z`);

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 502 });
    }

    const rows = (data || []).reverse();
    const retrievedAt =
      rows.map((row) => row.retrieved_at).filter(Boolean).sort().at(-1) || null;

    return NextResponse.json({
      success: true,
      source: 'AGMARKNET_OFFICIAL',
      rows,
      count: rows.length,
      retrieved_at: retrievedAt,
      filters: {
        commodity_code: commodityCode || null,
        mandi_code: mandiCode || null,
        state_code: stateCode || null,
        district_code: districtCode || null,
        date_from: from || null,
        date_to: to || null,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Market observations error' },
      { status: 500 },
    );
  }
}
