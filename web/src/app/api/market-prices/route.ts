import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const SUPABASE_URL = 'https://tsdjtlmrvbspyzgwmccg.supabase.co';
const DEFAULT_ROWS = 3000;
const MAX_ROWS = 10000;

function getApiKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY
    || process.env.SUPABASE_SECRET_KEY
    || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    || '';
}

function norm(v: unknown) {
  return String(v ?? '').trim().toLocaleLowerCase('en-IN').replace(/\\s+/g, ' ');
}
function same(a: unknown, b: unknown) {
  return norm(a) === norm(b);
}
function matchesFilter(row: any, filter: string | null, fields: string[]) {
  if (!filter) return true;
  return fields.some(field => same(row[field], filter));
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
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) {
    const detail = (await response.text()).slice(0, 400);
    throw new Error(`Supabase ${table} query failed (HTTP ${response.status}): ${detail}`);
  }
  const json: unknown = await response.json();
  if (!Array.isArray(json)) throw new Error(`Supabase returned an unexpected payload for ${table}.`);
  return json as any[];
}

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    const commodityFilter = params.get('commodity')?.trim() || '';
    const stateFilter = params.get('state')?.trim() || '';
    const mandiFilter = params.get('mandi')?.trim() || '';
    const searchFilter = norm(params.get('search'));
    const limit = Math.min(MAX_ROWS, Math.max(100, Number(params.get('limit')) || DEFAULT_ROWS));

    const observationSelect = 'id,commodity_code,mandi_code,state_code,observation_date,modal_price,min_price,max_price,arrival_quantity,source,variety,grade';
    const csvSelect = 'id,source_row_hash,observation_date,state_name,district_name,mandi_name,commodity_name,variety,grade,min_price,max_price,modal_price,source';

    // Filter in Postgres before limiting so a crop/state selection isn't lost
    // merely because it falls outside a recent global page of records.
    const [commodities, states, mandis] = await Promise.all([
      queryTable('national_commodities', 'code,name', 'name.asc', 5000),
      queryTable('national_states', 'state_code,state_name', 'state_name.asc', 1000),
      queryTable('national_mandis', 'mandi_code,mandi_name,state_code', 'mandi_name.asc', 5000),
    ]);
    const commodityByCode = new Map(commodities.map((r: any) => [String(r.code), String(r.name)]));
    const commodityByName = new Map(commodities.map((r: any) => [norm(r.name), String(r.code)]));
    const stateByCode = new Map(states.map((r: any) => [String(r.state_code), String(r.state_name)]));
    const stateByName = new Map(states.map((r: any) => [norm(r.state_name), String(r.state_code)]));
    const mandiByCode = new Map(mandis.map((r: any) => [String(r.mandi_code), r]));

    const commodityName = commodityByCode.get(commodityFilter) || commodityFilter;
    const stateName = stateByCode.get(stateFilter) || stateFilter;
    const mandiRecord = mandiByCode.get(mandiFilter);
    const mandiName = mandiRecord?.mandi_name || mandiFilter;

    const primaryParams: Record<string, string> = {};
    if (commodityFilter) {
      const code = commodityByName.get(norm(commodityName)) || commodityFilter;
      primaryParams.commodity_code = `eq.${code}`;
    }
    if (stateFilter) {
      const code = stateByName.get(norm(stateName)) || stateFilter;
      primaryParams.state_code = `eq.${code}`;
    }
    if (mandiFilter) primaryParams.mandi_code = `eq.${mandiFilter}`;

    const csvParams: Record<string, string> = {};
    if (commodityFilter || commodityName) csvParams.commodity_name = `ilike.*${(commodityName || commodityFilter).replace(/[,*()]/g, '')}*`;
    if (stateFilter || stateName) csvParams.state_name = `ilike.*${(stateName || stateFilter).replace(/[,*()]/g, '')}*`;
    if (mandiFilter || mandiName) csvParams.mandi_name = `ilike.*${(mandiName || mandiFilter).replace(/[,*()]/g, '')}*`;

    const [stored, imported] = await Promise.all([
      queryTable('national_market_price_observations', observationSelect, 'observation_date.desc,id.desc', limit, primaryParams),
      queryTable('agmarknet_csv_import_staging', csvSelect, 'observation_date.desc,id.desc', limit, csvParams),
    ]);

    const storedRows = stored.map((r: any) => ({
      ...r,
      modal_price: Number(r.modal_price) || 0,
      min_price: Number(r.min_price) || 0,
      max_price: Number(r.max_price) || 0,
      arrival_quantity: r.arrival_quantity == null ? null : Number(r.arrival_quantity),
      commodity_name: commodityByCode.get(String(r.commodity_code)) || r.commodity_code,
      mandi_name: mandiByCode.get(String(r.mandi_code))?.mandi_name || r.mandi_code || 'Mandi unavailable',
      state_name: stateByCode.get(String(r.state_code)) || r.state_code || 'India',
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

    let combined = [...storedRows, ...csvRows].filter((row: any) =>
      Number.isFinite(row.modal_price) && row.modal_price > 0
      && matchesFilter(row, commodityFilter ? commodityName : null, ['commodity_name', 'commodity_code'])
      && matchesFilter(row, stateFilter ? stateName : null, ['state_name', 'state_code'])
      && matchesFilter(row, mandiFilter ? mandiName : null, ['mandi_name', 'mandi_code'])
      && (!searchFilter || [row.commodity_name, row.mandi_name, row.state_name].some((value: unknown) => norm(value).includes(searchFilter)))
    );

    // Deduplicate the overlapping canonical/imported CSV representations only when
    // date, named market, state, crop, and modal price are exactly the same.
    const byRecordKey = new Map<string, any>();
    for (const row of combined) {
      const key = [row.observation_date, norm(row.commodity_name), norm(row.mandi_name), norm(row.state_name), row.modal_price].join('|');
      if (!byRecordKey.has(key) || (!row.imported_csv && byRecordKey.get(key)?.imported_csv)) byRecordKey.set(key, row);
    }
    combined = [...byRecordKey.values()].sort((a, b) =>
      String(b.observation_date).localeCompare(String(a.observation_date)) || Number(b.id) - Number(a.id)
    );
    const rows = combined.slice(0, limit);

    const allCommodities = [
      ...commodities,
      ...[...new Map(csvRows.map((r: any) => [r.commodity_code, { code: r.commodity_code, name: r.commodity_name }])).values()],
    ];
    const allStates = [
      ...states,
      ...[...new Map(csvRows.map((r: any) => [r.state_code, { state_code: r.state_code, state_name: r.state_name }])).values()],
    ];
    const allMandis = [
      ...mandis,
      ...[...new Map(csvRows.map((r: any) => [r.mandi_code, { mandi_code: r.mandi_code, mandi_name: r.mandi_name, state_code: r.state_code }])).values()],
    ];

    return NextResponse.json({
      ok: true, rows, commodities: allCommodities, states: allStates, mandis: allMandis,
      warnings: [], count: rows.length, primary_count: storedRows.length, imported_csv_count: csvRows.length,
      capped: combined.length > limit, latest_observation_date: rows[0]?.observation_date ?? null,
      source: 'public.national_market_price_observations + public.agmarknet_csv_import_staging',
      applied_filters: { commodity: commodityFilter || null, state: stateFilter || null, mandi: mandiFilter || null, search: searchFilter || null },
    }, { headers: { 'Cache-Control': 'no-store, max-age=0' } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown market data request failure.';
    const status = message.includes('HTTP 401') || message.includes('HTTP 403') ? 502 : 500;
    return NextResponse.json({ ok: false, rows: [], error: message }, {
      status, headers: { 'Cache-Control': 'no-store, max-age=0' },
    });
  }
}
