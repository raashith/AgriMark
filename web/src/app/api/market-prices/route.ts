import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const SUPABASE_URL = 'https://tsdjtlmrvbspyzgwmccg.supabase.co';
const DEFAULT_ROWS = 100;
const MAX_ROWS = 300;
const PAGE_SIZE = 1000;

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
    const optionValue = (value: string, prefix: string) => value.startsWith(prefix) ? value.slice(prefix.length).trim() : '';
    const commodityName = optionValue(rawCommodity, 'CSV_COMMODITY:') || commodityNameByCode.get(rawCommodity) || rawCommodity;
    const stateName = optionValue(rawState, 'CSV_STATE:') || stateNameByCode.get(rawState) || rawState;

    let selectedMandiName = '';
    let selectedMandiState = '';
    if (rawMandi.startsWith('CSV_MANDI:')) {
      const pair = rawMandi.slice('CSV_MANDI:'.length).split('|');
      selectedMandiName = (pair[0] || '').trim();
      selectedMandiState = (pair[1] || '').trim();
    } else if (rawMandi) {
      const selected = mandiByCode.get(rawMandi);
      selectedMandiName = String(selected?.mandi_name || rawMandi);
      selectedMandiState = String(stateNameByCode.get(String(selected?.state_code || '')) || '');
    }
    const effectiveStateName = stateName || selectedMandiState;

    const extraCanonical: Record<string, string> = {};
    const extraImported: Record<string, string> = {};
    if (rawCommodity && !rawCommodity.startsWith('CSV_COMMODITY:')) extraCanonical.commodity_code = `eq.${rawCommodity}`;
    if (rawState && !rawState.startsWith('CSV_STATE:')) extraCanonical.state_code = `eq.${rawState}`;
    if (rawMandi && !rawMandi.startsWith('CSV_MANDI:')) extraCanonical.mandi_code = `eq.${rawMandi}`;

    // Resolve CSV option values to normalized codes so the two market sources
    // are queried consistently for the selected commodity/state/mandi.
    if (rawCommodity.startsWith('CSV_COMMODITY:')) {
      const canonicalCommodityCode = commodities.find((r: any) => norm(r.name) === norm(commodityName))?.code;
      if (canonicalCommodityCode) extraCanonical.commodity_code = `eq.${canonicalCommodityCode}`;
    }
    if (rawState.startsWith('CSV_STATE:') || rawMandi.startsWith('CSV_MANDI:')) {
      const canonicalStateCode = states.find((r: any) => norm(r.state_name) === norm(effectiveStateName))?.state_code;
      if (canonicalStateCode) extraCanonical.state_code = `eq.${canonicalStateCode}`;
    }

    if (rawCommodity) extraImported.commodity_name = `eq.${commodityName}`;
    if (effectiveStateName) extraImported.state_name = `eq.${effectiveStateName}`;
    if (selectedMandiName) extraImported.mandi_name = `eq.${selectedMandiName}`;

    const [canonicalRows, importedRows] = await Promise.all([
      queryTable('national_market_price_observations', 'id,commodity_code,mandi_code,state_code,observation_date,modal_price,min_price,max_price,arrival_quantity,source,variety,grade', 'observation_date.desc,id.desc', 30000, extraCanonical),
      queryTable('agmarknet_csv_import_staging', 'id,observation_date,state_name,district_name,mandi_name,commodity_name,variety,grade,min_price,max_price,modal_price,source', 'observation_date.desc,id.desc', 30000, extraImported),
    ]);

    const canonical = canonicalRows.map((r: any) => ({
      ...r,
      modal_price: Number(r.modal_price) || 0,
      min_price: Number(r.min_price) || 0,
      max_price: Number(r.max_price) || 0,
      arrival_quantity: r.arrival_quantity == null ? null : Number(r.arrival_quantity),
      commodity_name: commodityNameByCode.get(String(r.commodity_code)) || String(r.commodity_code || ''),
      mandi_name: mandiByCode.get(String(r.mandi_code))?.mandi_name || String(r.mandi_code || 'Mandi unavailable'),
      state_name: stateNameByCode.get(String(r.state_code)) || String(r.state_code || 'India'),
      imported_csv: false,
    }));

    const imported = importedRows.map((r: any) => ({
      ...r,
      id: 'csv-' + String(r.id),
      commodity_code: 'CSV_COMMODITY:' + String(r.commodity_name || '').trim(),
      state_code: 'CSV_STATE:' + String(r.state_name || '').trim(),
      mandi_code: 'CSV_MANDI:' + String(r.mandi_name || '').trim() + '|' + String(r.state_name || '').trim(),
      modal_price: Number(r.modal_price) || 0,
      min_price: Number(r.min_price) || 0,
      max_price: Number(r.max_price) || 0,
      arrival_quantity: null,
      commodity_name: String(r.commodity_name || '').trim(),
      mandi_name: String(r.mandi_name || '').trim(),
      state_name: String(r.state_name || '').trim(),
      source: r.source || 'AGMARKNET',
      imported_csv: true,
    }));

    const wantedCommodity = rawCommodity ? norm(commodityName) : '';
    const wantedState = (rawState || selectedMandiState) ? norm(effectiveStateName) : '';
    const wantedMandi = rawMandi ? norm(selectedMandiName) : '';

    const matches = (row: any) =>
      Number.isFinite(row.modal_price) && row.modal_price > 0
      && (!wantedCommodity || norm(row.commodity_name) === wantedCommodity)
      && (!wantedState || norm(row.state_name) === wantedState)
      && (!wantedMandi || norm(row.mandi_name) === wantedMandi)
      && (!search || [row.commodity_name, row.mandi_name, row.state_name, row.district_name].some((v: unknown) => norm(v).includes(search)));

    // Prefer canonical normalized rows for duplicates, but retain newer imported
    // observations. Neither source is replaced with synthetic/demo values.
    const merged = new Map<string, any>();
    for (const row of [...imported.filter(matches), ...canonical.filter(matches)]) {
      const key = [row.observation_date, norm(row.commodity_name), norm(row.mandi_name), norm(row.state_name), row.modal_price].join('|');
      const previous = merged.get(key);
      if (!previous || (!row.imported_csv && previous.imported_csv)) merged.set(key, row);
    }
    const allMatching = [...merged.values()].sort((a, b) =>
      String(b.observation_date).localeCompare(String(a.observation_date))
      || String(b.id).localeCompare(String(a.id), undefined, { numeric: true }),
    );
    const rows = allMatching.slice(0, limit);

    const commodityOptions = new Map<string, any>();
    for (const r of commodities) commodityOptions.set(String(r.code), { code: String(r.code), name: String(r.name) });
    for (const r of importedRows) {
      const name = String(r.commodity_name || '').trim();
      if (name) commodityOptions.set('CSV_COMMODITY:' + name, { code: 'CSV_COMMODITY:' + name, name });
    }
    const stateOptions = new Map<string, any>();
    for (const r of states) stateOptions.set(String(r.state_code), { state_code: String(r.state_code), state_name: String(r.state_name) });
    for (const r of importedRows) {
      const name = String(r.state_name || '').trim();
      if (name) stateOptions.set('CSV_STATE:' + name, { state_code: 'CSV_STATE:' + name, state_name: name });
    }
    const mandiOptions = new Map<string, any>();
    for (const r of mandis) mandiOptions.set(String(r.mandi_code), { mandi_code: String(r.mandi_code), mandi_name: String(r.mandi_name), state_code: String(r.state_code || '') });
    for (const r of importedRows) {
      const name = String(r.mandi_name || '').trim();
      const state = String(r.state_name || '').trim();
      if (name && state) {
        const code = 'CSV_MANDI:' + name + '|' + state;
        mandiOptions.set(code, { mandi_code: code, mandi_name: name, state_code: 'CSV_STATE:' + state });
      }
    }

    return NextResponse.json({
      ok: true,
      rows,
      commodities: [...commodityOptions.values()].sort((a, b) => a.name.localeCompare(b.name)),
      states: [...stateOptions.values()].sort((a, b) => a.state_name.localeCompare(b.state_name)),
      mandis: [...mandiOptions.values()].sort((a, b) => a.mandi_name.localeCompare(b.mandi_name)),
      warnings: [],
      count: rows.length,
      primary_count: canonicalRows.length,
      imported_csv_count: importedRows.length,
      capped: allMatching.length > limit,
      latest_observation_date: rows[0]?.observation_date ?? null,
      source: 'Supabase AGMARKNET canonical + imported observations',
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
