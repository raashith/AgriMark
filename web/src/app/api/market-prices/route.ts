import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const SUPABASE_URL = 'https://tsdjtlmrvbspyzgwmccg.supabase.co';

function getApiKey() {
  return process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    || '';
}

async function queryTable(table: string, select: string, order: string, limit: number) {
  const key = getApiKey();
  if (!key) throw new Error('Supabase public key is missing from the Vercel production environment.');
  const url = new URL(`${SUPABASE_URL}/rest/v1/${table}`);
  url.searchParams.set('select', select);
  if (order) url.searchParams.set('order', order);
  url.searchParams.set('limit', String(limit));
  const response = await fetch(url, {
    headers: { apikey: key, Authorization: `Bearer ${key}`, Accept: 'application/json' },
    cache: 'no-store',
    signal: AbortSignal.timeout(12000),
  });
  if (!response.ok) {
    const detail = (await response.text()).slice(0, 500);
    throw new Error(`Supabase ${table} query failed (HTTP ${response.status}): ${detail}`);
  }
  return response.json();
}

export async function GET() {
  try {
    // Price observations are the source of truth. Lookup tables are optional
    // enrichments, so a lookup schema mismatch cannot blank the price dashboard.
    const observations = await queryTable(
      'national_market_price_observations',
      'id,commodity_code,mandi_code,state_code,observation_date,modal_price,min_price,max_price,arrival_quantity,source',
      'observation_date.desc,id.desc',
      1000,
    );
    if (!Array.isArray(observations)) throw new Error('Supabase returned an unexpected market observation payload.');
    if (observations.length === 0) {
      return NextResponse.json({
        ok: true, rows: [], commodities: [], states: [], mandis: [],
        error: 'The public database query returned zero market observations. Verify the production key and SELECT policy.',
      }, { headers: { 'Cache-Control': 'no-store' } });
    }

    const [commodities, states, mandis] = await Promise.allSettled([
      queryTable('national_commodities', 'code,name', 'name.asc', 1000),
      queryTable('national_states', 'state_code,state_name', 'state_name.asc', 100),
      queryTable('national_mandis', 'mandi_code,mandi_name,state_code', 'mandi_name.asc', 2000),
    ]);
    const cs = commodities.status === 'fulfilled' ? commodities.value : [];
    const ss = states.status === 'fulfilled' ? states.value : [];
    const ms = mandis.status === 'fulfilled' ? mandis.value : [];
    const commodityNames = new Map(cs.map((r: any) => [String(r.code), String(r.name)]));
    const stateNames = new Map(ss.map((r: any) => [String(r.state_code), String(r.state_name)]));
    const mandiNames = new Map(ms.map((r: any) => [String(r.mandi_code), String(r.mandi_name)]));
    const rows = observations.map((r: any) => ({
      ...r,
      modal_price: Number(r.modal_price) || 0,
      min_price: Number(r.min_price) || 0,
      max_price: Number(r.max_price) || 0,
      arrival_quantity: r.arrival_quantity == null ? null : Number(r.arrival_quantity),
      commodity_name: commodityNames.get(String(r.commodity_code)) || r.commodity_code,
      mandi_name: mandiNames.get(String(r.mandi_code)) || r.mandi_code || 'Mandi unavailable',
      state_name: stateNames.get(String(r.state_code)) || r.state_code || 'India',
    }));
    return NextResponse.json({
      ok: true, rows, commodities: cs, states: ss, mandis: ms,
      warnings: [
        commodities.status === 'rejected' ? 'Commodity names unavailable; displaying codes.' : null,
        states.status === 'rejected' ? 'State names unavailable; displaying codes.' : null,
        mandis.status === 'rejected' ? 'Mandi names unavailable; displaying codes.' : null,
      ].filter(Boolean),
      count: rows.length,
      source: 'public.national_market_price_observations',
    }, { headers: { 'Cache-Control': 'no-store, max-age=0' } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown market data request failure.';
    const status = message.includes('HTTP 401') || message.includes('HTTP 403') ? 502 : 500;
    return NextResponse.json({ ok: false, rows: [], error: message }, {
      status,
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    });
  }
}
