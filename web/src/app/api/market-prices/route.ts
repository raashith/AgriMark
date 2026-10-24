import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const SUPABASE_URL = 'https://tsdjtlmrvbspyzgwmccg.supabase.co';

function getApiKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY
    || process.env.SUPABASE_SECRET_KEY
    || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    || '';
}

async function queryTable(
  table: string,
  select: string,
  order: string,
  limit: number,
  extraParams: Record<string, string> = {},
) {
  const key = getApiKey();
  if (!key) throw new Error('Supabase API key is missing from the Vercel production environment.');

  const url = new URL(`${SUPABASE_URL}/rest/v1/${table}`);
  url.searchParams.set('select', select);
  if (order) url.searchParams.set('order', order);
  url.searchParams.set('limit', String(limit));
  for (const [param, value] of Object.entries(extraParams)) url.searchParams.set(param, value);

  const response = await fetch(url, {
    headers: { apikey: key, Authorization: `Bearer ${key}`, Accept: 'application/json' },
    cache: 'no-store',
    signal: AbortSignal.timeout(12000),
  });
  if (!response.ok) {
    const detail = (await response.text()).slice(0, 400);
    throw new Error(`Supabase ${table} query failed (HTTP ${response.status}): ${detail}`);
  }
  const json: unknown = await response.json();
  if (!Array.isArray(json)) throw new Error(`Supabase returned an unexpected payload for ${table}.`);
  return json as any[];
}

async function queryRecentRows(
  table: string,
  select: string,
  order: string,
  pageSize = 1000,
  maxPages = 8,
) {
  const all: any[] = [];
  for (let page = 0; page < maxPages; page++) {
    const rows = await queryTable(table, select, order, pageSize, { offset: String(page * pageSize) });
    all.push(...rows);
    if (rows.length < pageSize) break;
  }
  return all;
}

export async function GET() {
  try {
    const observationSelect = 'id,commodity_code,mandi_code,state_code,observation_date,modal_price,min_price,max_price,arrival_quantity,source';
    const csvSelect = 'id,source_row_hash,observation_date,state_name,district_name,mandi_name,commodity_name,variety,grade,min_price,max_price,modal_price,source';

    const [observations, imported] = await Promise.all([
      queryRecentRows('national_market_price_observations', observationSelect, 'observation_date.desc,id.desc', 1000, 8),
      queryRecentRows('agmarknet_csv_import_staging', csvSelect, 'observation_date.desc,id.desc', 1000, 8),
    ]);

    const [commodities, states, mandis] = await Promise.allSettled([
      queryTable('national_commodities', 'code,name', 'name.asc', 5000),
      queryTable('national_states', 'state_code,state_name', 'state_name.asc', 1000),
      queryTable('national_mandis', 'mandi_code,mandi_name,state_code', 'mandi_name.asc', 5000),
    ]);
    const cs = commodities.status === 'fulfilled' ? commodities.value : [];
    const ss = states.status === 'fulfilled' ? states.value : [];
    const ms = mandis.status === 'fulfilled' ? mandis.value : [];

    const commodityNames = new Map(cs.map((r: any) => [String(r.code), String(r.name)]));
    const stateNames = new Map(ss.map((r: any) => [String(r.state_code), String(r.state_name)]));
    const mandiNames = new Map(ms.map((r: any) => [String(r.mandi_code), String(r.mandi_name)]));

    const storedRows = observations.map((r: any) => ({
      ...r,
      modal_price: Number(r.modal_price) || 0,
      min_price: Number(r.min_price) || 0,
      max_price: Number(r.max_price) || 0,
      arrival_quantity: r.arrival_quantity == null ? null : Number(r.arrival_quantity),
      commodity_name: commodityNames.get(String(r.commodity_code)) || r.commodity_code,
      mandi_name: mandiNames.get(String(r.mandi_code)) || r.mandi_code || 'Mandi unavailable',
      state_name: stateNames.get(String(r.state_code)) || r.state_code || 'India',
      imported_csv: false,
    }));

    const csvRows = imported.map((r: any) => ({
      id: -Number(r.id),
      commodity_code: `CSV_COMMODITY:${String(r.commodity_name || '').trim()}`,
      mandi_code: `CSV_MANDI:${String(r.mandi_name || '').trim()}|${String(r.state_name || '').trim()}`,
      state_code: `CSV_STATE:${String(r.state_name || '').trim()}`,
      observation_date: r.observation_date,
      modal_price: Number(r.modal_price) || 0,
      min_price: Number(r.min_price) || 0,
      max_price: Number(r.max_price) || 0,
      arrival_quantity: null,
      source: r.source || 'AGMARKNET',
      commodity_name: String(r.commodity_name || 'Unknown commodity').trim(),
      mandi_name: String(r.mandi_name || 'Mandi unavailable').trim(),
      state_name: String(r.state_name || 'India').trim(),
      district_name: r.district_name,
      variety: r.variety,
      grade: r.grade,
      imported_csv: true,
    }));

    const byRecordKey = new Map<string, any>();
    for (const row of [...storedRows, ...csvRows]) {
      if (!Number.isFinite(row.modal_price) || row.modal_price <= 0) continue;
      const key = [
        row.observation_date,
        row.commodity_name.toLocaleLowerCase('en-IN'),
        row.mandi_name.toLocaleLowerCase('en-IN'),
        row.state_name.toLocaleLowerCase('en-IN'),
        row.modal_price,
      ].join('|');
      if (!byRecordKey.has(key)) byRecordKey.set(key, row);
    }
    const rows = [...byRecordKey.values()].sort((a, b) =>
      String(b.observation_date).localeCompare(String(a.observation_date)) || Number(b.id) - Number(a.id)
    );

    const allCommodities = [
      ...cs,
      ...[...new Map(csvRows.map((r: any) => [r.commodity_code, { code: r.commodity_code, name: r.commodity_name }])).values()],
    ];
    const allStates = [
      ...ss,
      ...[...new Map(csvRows.map((r: any) => [r.state_code, { state_code: r.state_code, state_name: r.state_name }])).values()],
    ];
    const allMandis = [
      ...ms,
      ...[...new Map(csvRows.map((r: any) => [r.mandi_code, { mandi_code: r.mandi_code, mandi_name: r.mandi_name, state_code: r.state_code }])).values()],
    ];

    return NextResponse.json({
      ok: true,
      rows,
      commodities: allCommodities,
      states: allStates,
      mandis: allMandis,
      warnings: [
        commodities.status === 'rejected' ? 'Commodity names unavailable; displaying codes.' : null,
        states.status === 'rejected' ? 'State names unavailable; displaying codes.' : null,
        mandis.status === 'rejected' ? 'Mandi names unavailable; displaying codes.' : null,
      ].filter(Boolean),
      count: rows.length,
      primary_count: storedRows.length,
      imported_csv_count: csvRows.length,
      capped: observations.length >= 8000 || imported.length >= 8000,
      latest_observation_date: rows[0]?.observation_date ?? null,
      source: 'public.national_market_price_observations + public.agmarknet_csv_import_staging',
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
