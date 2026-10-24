import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const SUPABASE_URL = 'https://tsdjtlmrvbspyzgwmccg.supabase.co';
const DEFAULT_ROWS = 100;
const MAX_ROWS = 300;

function getApiKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY
    || process.env.SUPABASE_SECRET_KEY
    || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    || '';
}

function norm(value: unknown) {
  return String(value ?? '').trim().toLocaleLowerCase('en-IN').split(/ +/).filter(Boolean).join(' ');
}

function parseSynthetic(value: string, prefix: string) {
  return value.startsWith(prefix) ? value.slice(prefix.length).trim() : '';
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
  // Resume the canonical, date-filtered market feed. Queries below are restricted
  // to the verified 2026-10-16 snapshot and respect commodity/state/mandi filters.
  const MANDI_PRICE_API_PAUSED = false;
  if (MANDI_PRICE_API_PAUSED) {
    return NextResponse.json(
      {
        ok: false,
        paused: true,
        code: 'MANDI_PRICE_API_PAUSED',
        message: 'Mandi prices are temporarily paused while AgriMark maintenance is in progress. Please try again later.',
      },
      {
        status: 503,
        headers: {
          'Cache-Control': 'no-store',
          'Retry-After': '3600',
        },
      },
    );
  }

  try {
    const params = request.nextUrl.searchParams;
    const rawCommodity = params.get('commodity')?.trim() || '';
    const rawState = params.get('state')?.trim() || '';
    const rawMandi = params.get('mandi')?.trim() || '';
    const search = norm(params.get('search'));
    const limit = Math.min(MAX_ROWS, Math.max(25, Number(params.get('limit')) || DEFAULT_ROWS));

    const observationSelect = 'id,commodity_code,mandi_code,state_code,observation_date,modal_price,min_price,max_price,arrival_quantity,source,variety,grade';

    // Load reference labels first so UI codes can be resolved into the actual database keys/names.
    const [commodities, states, mandis] = await Promise.all([
      queryTable('national_commodities', 'code,name', 'name.asc', 2000),
      queryTable('national_states', 'state_code,state_name', 'state_name.asc', 1000),
      queryTable('national_mandis', 'mandi_code,mandi_name,state_code', 'mandi_name.asc', 1500),
    ]);

    const commodityNameByCode = new Map(commodities.map((r: any) => [String(r.code), String(r.name)]));
    const commodityCodeByName = new Map(commodities.map((r: any) => [norm(r.name), String(r.code)]));
    const stateNameByCode = new Map(states.map((r: any) => [String(r.state_code), String(r.state_name)]));
    const stateCodeByName = new Map(states.map((r: any) => [norm(r.state_name), String(r.state_code)]));
    const mandiByCode = new Map(mandis.map((r: any) => [String(r.mandi_code), r]));

    // Imported CSV options have synthetic values but the staging table stores plain names.
    const commodityName = parseSynthetic(rawCommodity, 'CSV_COMMODITY:')
      || commodityNameByCode.get(rawCommodity)
      || rawCommodity;
    const stateName = parseSynthetic(rawState, 'CSV_STATE:')
      || stateNameByCode.get(rawState)
      || rawState;

    let selectedMandiName = '';
    let selectedMandiState = '';
    if (rawMandi.startsWith('CSV_MANDI:')) {
      const pair = rawMandi.slice('CSV_MANDI:'.length).split('|');
      selectedMandiName = (pair[0] || '').trim();
      selectedMandiState = (pair[1] || '').trim();
    } else {
      const selected = mandiByCode.get(rawMandi);
      selectedMandiName = String(selected?.mandi_name || rawMandi);
      if (selected?.state_code) selectedMandiState = stateNameByCode.get(String(selected.state_code)) || '';
    }

    const effectiveStateName = stateName || selectedMandiState;
    const canonicalCommodityCode = commodityCodeByName.get(norm(commodityName))
      || (!rawCommodity.startsWith('CSV_COMMODITY:') && rawCommodity ? rawCommodity : '');
    const canonicalStateCode = stateCodeByName.get(norm(effectiveStateName))
      || (!rawState.startsWith('CSV_STATE:') && rawState ? rawState : '');

    const canonicalMandi = mandis.find((r: any) =>
      norm(r.mandi_name) === norm(selectedMandiName)
      && (!selectedMandiState || norm(stateNameByCode.get(String(r.state_code)) || '') === norm(selectedMandiState))
      && (!effectiveStateName || norm(stateNameByCode.get(String(r.state_code)) || '') === norm(effectiveStateName))
    );

    const primaryParams: Record<string, string> = {};
    if (rawCommodity && canonicalCommodityCode) primaryParams.commodity_code = `eq.${canonicalCommodityCode}`;
    if ((rawState || selectedMandiState) && canonicalStateCode) primaryParams.state_code = `eq.${canonicalStateCode}`;
    if (rawMandi && canonicalMandi?.mandi_code) primaryParams.mandi_code = `eq.${canonicalMandi.mandi_code}`;

    // This page intentionally reads only the canonical dataset imported on 16 Oct 2026.
    // Do not mix later staging rows into the selected commodity's displayed prices.
    const dateParams = { ...primaryParams, observation_date: 'eq.2026-10-16' };
    const stored = await queryTable(
      'national_market_price_observations',
      observationSelect,
      'observation_date.desc,id.desc',
      limit,
      dateParams,
    );
    const warnings: string[] = [];

    const storedRows = stored.map((r: any) => ({
      ...r,
      modal_price: Number(r.modal_price) || 0,
      min_price: Number(r.min_price) || 0,
      max_price: Number(r.max_price) || 0,
      arrival_quantity: r.arrival_quantity == null ? null : Number(r.arrival_quantity),
      commodity_name: commodityNameByCode.get(String(r.commodity_code)) || r.commodity_code,
      mandi_name: mandiByCode.get(String(r.mandi_code))?.mandi_name || r.mandi_code || 'Mandi unavailable',
      state_name: stateNameByCode.get(String(r.state_code)) || r.state_code || 'India',
      imported_csv: false,
    }));

    const wantedCommodity = rawCommodity ? norm(commodityName) : '';
    const wantedState = (rawState || selectedMandiState) ? norm(effectiveStateName) : '';
    const wantedMandi = rawMandi ? norm(selectedMandiName) : '';
    const rowsBeforeSearch = storedRows.filter((row: any) =>
      Number.isFinite(row.modal_price) && row.modal_price > 0
      && (!wantedCommodity || norm(row.commodity_name) === wantedCommodity)
      && (!wantedState || norm(row.state_name) === wantedState)
      && (!wantedMandi || norm(row.mandi_name) === wantedMandi)
    );

    const byRecordKey = new Map<string, any>();
    for (const row of rowsBeforeSearch) {
      const key = [row.observation_date, norm(row.commodity_name), norm(row.mandi_name), norm(row.state_name), row.modal_price].join('|');
      if (!byRecordKey.has(key) || (!row.imported_csv && byRecordKey.get(key)?.imported_csv)) {
        byRecordKey.set(key, row);
      }
    }

    const allMatching = [...byRecordKey.values()]
      .filter((row: any) => !search || [row.commodity_name, row.mandi_name, row.state_name].some((value: unknown) => norm(value).includes(search)))
      .sort((a, b) => String(b.observation_date).localeCompare(String(a.observation_date)) || Number(b.id) - Number(a.id));
    const rows = allMatching.slice(0, limit);

    const allCommodities = commodities;
    const allStates = states;
    const allMandis = mandis;

    return NextResponse.json({
      ok: true,
      rows,
      commodities: allCommodities,
      states: allStates,
      mandis: allMandis,
      warnings,
      count: rows.length,
      primary_count: storedRows.length,
      imported_csv_count: 0,
      capped: allMatching.length > limit,
      latest_observation_date: rows[0]?.observation_date ?? null,
      source: 'public.national_market_price_observations (2026-10-16)',
      applied_filters: { commodity: rawCommodity || null, state: rawState || null, mandi: rawMandi || null, search: search || null, observation_date: '2026-10-16' },
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
