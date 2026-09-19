import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { forecastModalPrice } from '@/lib/mandi-forecast';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const commodity = params.get('commodity');
  const mandi = params.get('mandi');
  const days = Math.min(Math.max(Number(params.get('days') || 7), 1), 30);

  let query = supabase
    .from('national_market_price_observations')
    .select('commodity_code,commodity_name,mandi_code,mandi_name,state_code,district_code,observed_at,modal_price,arrival_quantity_mt')
    .eq('price_signal_type', 'OBSERVED_MANDI')
    .order('observed_at', { ascending: true })
    .limit(1000);

  if (commodity) query = query.eq('commodity_code', commodity);
  if (mandi) query = query.eq('mandi_code', mandi);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  const points = (data || []).map((row) => ({
    observation_date: String(row.observed_at).slice(0, 10),
    modal_price: Number(row.modal_price),
    arrival_quantity_mt: Number(row.arrival_quantity_mt || 0),
  }));

  const forecast = forecastModalPrice(points, days);
  const latest = data?.at(-1) || null;
  const previous = data?.at(-2) || null;
  const latestPrice = latest ? Number(latest.modal_price) : null;
  const previousPrice = previous ? Number(previous.modal_price) : null;
  const difference = latestPrice != null && previousPrice != null ? latestPrice - previousPrice : null;
  const pct = difference != null && previousPrice ? Number(((difference / previousPrice) * 100).toFixed(2)) : null;

  return NextResponse.json({
    ok: true,
    source: 'AGMARKNET',
    observed_count: data?.length || 0,
    latest: latest
      ? {
          commodity_code: latest.commodity_code,
          commodity_name: latest.commodity_name,
          mandi_code: latest.mandi_code,
          mandi_name: latest.mandi_name,
          state_code: latest.state_code,
          district_code: latest.district_code,
          observation_date: String(latest.observed_at).slice(0, 10),
          modal_price: latestPrice,
          arrival_quantity_mt: Number(latest.arrival_quantity_mt || 0),
        }
      : null,
    price_difference: difference,
    price_difference_pct: pct,
    forecast,
  });
}
