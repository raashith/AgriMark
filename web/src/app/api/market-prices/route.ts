import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const SUPABASE_URL = 'https://tsdjtlmrvbspyzgwmccg.supabase.co';
const DEFAULT_ROWS = 100;
const MAX_ROWS = 300;
const PAGE_SIZE = 1000;
const CANONICAL_SCAN_LIMIT = 1000;

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

async function queryTable(
  table: string,
  select: string,
  order: string,
  limit: number,
  extraParams: Record<string, string> = {},
) {
  const key = getApiKey();
  if (!key) throw new Error('Supabase API key is missing from the Vercel production environment.');

  const rows: any[] = [];
  for (let offset = 0; offset < limit; offset += PAGE_SIZE) {
    const pageLimit = Math.min(PAGE_SIZE, limit - offset);
    const url = new URL(`${SUPABASE_URL}/rest/v1/${table}`);
    url.searchParams.set('select', select);
    if (order) url.searchParams.set('order', order);
    url.searchParams.set('limit', String(pageLimit));
    url.searchParams.set('offset', String(offset));
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
    rows.push(...json as any[]);
    if (json.length < pageLimit) break;
  }
  return rows;
}

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    const rawCommodity = params.get('commodity')?.trim() || '';
    const rawState = params.get('state')?.trim() || '';
    const rawMandi = params.get('mandi')?.trim() || '';
    const search = norm(params.get('search'));
    const limit = Math.min(MAX_ROWS, Math.max(25, Number(params.get('limit')) || DEFAULT_ROWS));

    const [commodities, states, mandis] = await Promise.all([
      queryTable('national_commodities', 'code,name', 'name.asc', 500),
      queryTable('national_states', 'state_code,state_name', 'state_name.asc', 100),
      queryTable('national_mandis', 'mandi_code,mandi_name,state_code', 'mandi_name.asc', 1200),
    ]);

    const commodityNameByCode = new Map(commodities.map((r: any) => [String(r.code), String(r.name)]));
    const stateNameByCode = new Map(states.map((r: any) => [String(r.state_code), String(r.state_name)]));
    const mandiByCode = new Map(mandis.map((r: any) => [String(r.mandi_code), r]));

    // The market page intentionally reads ONLY normalized AGMARKNET observations.
    // public.agmarknet_csv_import_staging remains untouched and is not queried.
    const canonicalFilters: Record<string, string> = {};
    if (rawCommodity) canonicalFilters.commodity_code = `eq.${rawCommodity}`;
    if (rawState) canonicalFilters.state_code = `eq.${rawState}`;
    if (rawMandi) canonicalFilters.mandi_code = `eq.${rawMandi}`;

    // Read the newest canonical observations without pinning the page to a
    // hard-coded date. This lets the cards follow the latest date in Supabase.
    const canonicalRows = await queryTable(
      'national_market_price_observations',
      'id,commodity_code,mandi_code,state_code,observation_date,modal_price,min_price,max_price,arrival_quantity,source,variety,grade',
      'observation_date.desc,id.desc',
      CANONICAL_SCAN_LIMIT,
      canonicalFilters,
    );

    const canonical = canonicalRows.map((r: any) => ({
      ...r,
      modal_price: Number(r.modal_price) || 0,
      min_price: Number(r.min_price) || 0,
      max_price: Number(r.max_price) || 0,
      arrival_quantity: r.arrival_quantity == null ? null : Number(r.arrival_quantity),
      commodity_name: commodityNameByCode.get(String(r.commodity_code)) || String(r.commodity_code || ''),
      mandi_name: mandiByCode.get(String(r.mandi_code))?.mandi_name || String(r.mandi_code || 'Mandi unavailable'),
      state_name: stateNameByCode.get(String(r.state_code)) || String(r.state_code || 'India'),
    })).filter((row: any) =>
      Number.isFinite(row.modal_price) && row.modal_price > 0
      && (!search || [row.commodity_name, row.mandi_name, row.state_name, row.variety, row.grade].some((value: unknown) => norm(value).includes(search))),
    );

    const allMatching = canonical.sort((a: any, b: any) =>
      String(b.observation_date).localeCompare(String(a.observation_date))
      || Number(b.id) - Number(a.id),
    );
    const rows = allMatching.slice(0, limit);
    const latest = rows[0] ?? null;
    const observationDates = new Set(allMatching.map((row: any) => row.observation_date)).size;

    return NextResponse.json({
      ok: true,
      rows,
      commodities: commodities.map((r: any) => ({ code: String(r.code), name: String(r.name) })),
      states: states.map((r: any) => ({ code: String(r.state_code), name: String(r.state_name) })),
      mandis: mandis.map((r: any) => ({ code: String(r.mandi_code), name: String(r.mandi_name), state_code: String(r.state_code || '') })),
      summary: {
        latest,
        observedRecords: rows.length,
        observationDates: new Set(rows.map((row: any) => row.observation_date)).size,
      },
      warnings: [],
      count: allMatching.length,
      loaded_count: rows.length,
      primary_count: canonicalRows.length,
      imported_csv_count: 0,
      csv_staging_enabled: false,
      capped: allMatching.length > limit || canonicalRows.length >= CANONICAL_SCAN_LIMIT,
      latest_observation_date: latest?.observation_date ?? null,
      observation_dates_available: observationDates,
      source: 'Supabase public.national_market_price_observations · canonical only · CSV staging disabled',
      applied_filters: { commodity: rawCommodity || null, state: rawState || null, mandi: rawMandi || null, search: search || null },
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
