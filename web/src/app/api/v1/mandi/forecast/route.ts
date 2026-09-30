import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { MandiForecastEngine, PriceObservationInput } from '@/lib/mandi-forecast';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const commodityCode = (searchParams.get('commodity_code') || '').toUpperCase();
    const stateCode = searchParams.get('state_code') || undefined;
    const districtCode = searchParams.get('district_code') || undefined;
    const mandiCode = searchParams.get('mandi_code') || undefined;
    const horizonDays = Math.min(30, Math.max(1, parseInt(searchParams.get('horizon_days') || '7', 10)));
    const baseDate = searchParams.get('base_date') || new Date().toISOString().split('T')[0];

    if (!commodityCode) {
      return NextResponse.json({ success: false, error: 'commodity_code is required.' }, { status: 400 });
    }

    const cookieStore = cookies();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xrcqzpnstdbbtafhcwbb.supabase.co';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    if (!supabaseKey) {
      return NextResponse.json({ success: false, error: 'Supabase server configuration is incomplete.' }, { status: 503 });
    }

    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll().map(({ name, value }) => ({ name, value }));
        },
      },
    });

    let query = supabase
      .from('national_market_price_observations')
      .select('commodity_code,state_code,district_code,mandi_code,modal_price,min_price,max_price,observed_at')
      .eq('commodity_code', commodityCode)
      .eq('price_signal_type', 'OBSERVED_MANDI')
      .eq('validation_status', 'VALIDATED')
      .eq('is_synthetic', false)
      .lte('observed_at', `${baseDate}T23:59:59.999Z`)
      .order('observed_at', { ascending: true })
      .limit(500);

    if (stateCode) query = query.eq('state_code', stateCode.toUpperCase());
    if (districtCode) query = query.eq('district_code', districtCode);
    if (mandiCode) query = query.eq('mandi_code', mandiCode);

    const { data: historyData, error } = await query;
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 502 });

    const observations: PriceObservationInput[] = (historyData || []).map((row) => ({
      commodity_code: row.commodity_code,
      state_code: row.state_code,
      district_code: row.district_code,
      mandi_code: row.mandi_code,
      modal_price: Number(row.modal_price),
      min_price: Number(row.min_price),
      max_price: Number(row.max_price),
      observed_at: row.observed_at,
    }));

    if (observations.length < 3) {
      return NextResponse.json({
        success: true,
        timestamp: new Date().toISOString(),
        reason: `Only ${observations.length} verified observed price point(s) are available. At least 3 are required for a projection.`,
        forecast: {
          commodity_code: commodityCode,
          state_code: stateCode,
          district_code: districtCode,
          model_name: 'AgriMark-ExponentialTrend-v1',
          model_version: '1.2.0',
          model_type: 'TIME_SERIES',
          base_date: baseDate,
          history_window_days: 30,
          historical_data_points: observations.length,
          predictions: [],
        },
      });
    }

    const forecastResult = MandiForecastEngine.generatePriceForecast(observations, commodityCode, horizonDays, baseDate, stateCode, districtCode);
    return NextResponse.json({ success: true, timestamp: new Date().toISOString(), forecast: forecastResult });
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : 'Server forecast error' }, { status: 500 });
  }
}
