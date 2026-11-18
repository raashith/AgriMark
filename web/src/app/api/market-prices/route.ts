import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 100;
const MAX_OFFSET = 2_147_483_647;
const METADATA_PAGE_SIZE = 1000;
const METADATA_TTL_MS = 5 * 60 * 1000;
const DEFAULT_SUPABASE_URL = 'https://tsdjtlmrvbspyzgwmccg.supabase.co';

type DatabaseRow = Record<string, any>;
type MarketMetadata = {
  commodities: DatabaseRow[];
  states: DatabaseRow[];
  mandis: DatabaseRow[];
};

let metadataCache: { value: MarketMetadata; expiresAt: number } | null = null;
let metadataRequest: Promise<MarketMetadata> | null = null;

function getSupabaseUrl() {
  return (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL).replace(/\/$/, '');
}

function getApiKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY
    || process.env.SUPABASE_SECRET_KEY
    || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    || '';
}

function normalize(value: unknown) {
  return String(value ?? '').trim().toLocaleLowerCase('en-IN').replace(/\s+/g, ' ');
}

function safeSearch(value: string) {
  return value
    .slice(0, 80)
    .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function invalidQuery(message: string, status = 400) {
  return NextResponse.json({ ok: false, rows: [], error: message }, {
    status,
    headers: { 'Cache-Control': 'no-store, max-age=0' },
  });
}

async function fetchRows(
  table: string,
  select: string,
  options: {
    order?: string;
    limit: number;
    offset?: number;
    filters?: Record<string, string>;
    exactCount?: boolean;
  },
): Promise<{ rows: DatabaseRow[]; total: number | null }> {
  const key = getApiKey();
  if (!key) throw new Error('Supabase API key is missing from the Vercel environment.');

  const url = new URL(`${getSupabaseUrl()}/rest/v1/${table}`);
  url.searchParams.set('select', select);
  url.searchParams.set('limit', String(options.limit));
  if (options.offset) url.searchParams.set('offset', String(options.offset));
  if (options.order) url.searchParams.set('order', options.order);
  for (const [filter, value] of Object.entries(options.filters || {})) {
    url.searchParams.set(filter, value);
  }

  const headers: Record<string, string> = {
    apikey: key,
    Authorization: `Bearer ${key}`,
    Accept: 'application/json',
  };
  if (options.exactCount) headers.Prefer = 'count=exact';

  const response = await fetch(url, {
    headers,
    cache: 'no-store',
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok) {
    const detail = (await response.text()).slice(0, 400);
    throw new Error(`Supabase ${table} query failed (HTTP ${response.status}): ${detail}`);
  }

  const payload: unknown = await response.json();
  if (!Array.isArray(payload)) throw new Error(`Supabase returned an unexpected payload for ${table}.`);

  let total: number | null = null;
  if (options.exactCount) {
    const contentRange = response.headers.get('content-range') || '';
    const match = contentRange.match(/\/(\d+|\*)$/);
    if (!match || match[1] === '*') throw new Error(`Supabase did not return an exact row count for ${table}.`);
    total = Number(match[1]);
  }

  return { rows: payload as DatabaseRow[], total };
}

async function fetchAllMetadata(table: string, select: string, order: string) {
  const rows: DatabaseRow[] = [];
  for (let offset = 0; ; offset += METADATA_PAGE_SIZE) {
    const page = await fetchRows(table, select, {
      order,
      limit: METADATA_PAGE_SIZE,
      offset,
    });
    rows.push(...page.rows);
    if (page.rows.length < METADATA_PAGE_SIZE) break;
  }
  return rows;
}

async function getMarketMetadata(): Promise<MarketMetadata> {
  if (metadataCache && metadataCache.expiresAt > Date.now()) return metadataCache.value;
  if (metadataRequest) return metadataRequest;

  const pending = Promise.all([
    fetchAllMetadata('national_commodities', 'code,name', 'name.asc'),
    fetchAllMetadata('national_states', 'state_code,state_name', 'state_name.asc'),
    fetchAllMetadata('national_mandis', 'mandi_code,mandi_name,state_code', 'mandi_name.asc'),
  ]).then(([commodities, states, mandis]) => {
    const value = { commodities, states, mandis };
    metadataCache = { value, expiresAt: Date.now() + METADATA_TTL_MS };
    return value;
  });

  metadataRequest = pending;
  try {
    return await pending;
  } finally {
    if (metadataRequest === pending) metadataRequest = null;
  }
}

type MappedObservation = DatabaseRow & {
  id: number;
  commodity_code: string;
  mandi_code: string;
  state_code: string;
  observation_date: string;
  modal_price: number;
  min_price: number;
  max_price: number;
  arrival_quantity: number | null;
  commodity_name: string;
  mandi_name: string;
  state_name: string;
};

function mapObservation(
  row: DatabaseRow,
  commodityNames: Map<string, string>,
  stateNames: Map<string, string>,
  mandiNames: Map<string, string>,
): MappedObservation {
  return {
    ...row,
    modal_price: Number(row.modal_price),
    min_price: Number(row.min_price),
    max_price: Number(row.max_price),
    arrival_quantity: row.arrival_quantity == null ? null : Number(row.arrival_quantity),
    commodity_name: commodityNames.get(String(row.commodity_code)) || String(row.commodity_code || ''),
    mandi_name: mandiNames.get(String(row.mandi_code)) || String(row.mandi_code || 'Mandi unavailable'),
    state_name: stateNames.get(String(row.state_code)) || String(row.state_code || 'India'),
  } as MappedObservation;
}

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    const rawCommodity = params.get('commodity')?.trim() || '';
    const rawState = params.get('state')?.trim() || '';
    const rawMandi = params.get('mandi')?.trim() || '';
    const search = safeSearch(params.get('search') || '');

    const rawLimit = params.get('limit');
    const requestedLimit = rawLimit === null ? DEFAULT_PAGE_SIZE : Number(rawLimit);
    if (!Number.isSafeInteger(requestedLimit) || requestedLimit < 1) {
      return invalidQuery('The limit must be a positive whole number between 1 and 100.');
    }
    const limit = Math.min(MAX_PAGE_SIZE, requestedLimit);

    const rawOffset = params.get('offset');
    const requestedOffset = rawOffset === null ? 0 : Number(rawOffset);
    if (!Number.isSafeInteger(requestedOffset) || requestedOffset < 0 || requestedOffset > MAX_OFFSET) {
      return invalidQuery(`The offset must be a whole number between 0 and ${MAX_OFFSET.toLocaleString('en-IN')}.`);
    }
    const offset = requestedOffset;

    if (search && search.length < 2) {
      return invalidQuery('Enter at least two characters to search market prices.');
    }

    const { commodities, states, mandis } = await getMarketMetadata();
    const commodityNames = new Map(commodities.map((r) => [String(r.code), String(r.name)]));
    const stateNames = new Map(states.map((r) => [String(r.state_code), String(r.state_name)]));
    const mandiNames = new Map(mandis.map((r) => [String(r.mandi_code), String(r.mandi_name)]));

    const filters: Record<string, string> = { modal_price: 'gt.0' };
    if (rawCommodity) filters.commodity_code = `eq.${rawCommodity}`;
    if (rawState) filters.state_code = `eq.${rawState}`;
    if (rawMandi) filters.mandi_code = `eq.${rawMandi}`;

    if (search) {
      const term = normalize(search);
      const commodityCodes = commodities
        .filter((r) => normalize(r.name).includes(term))
        .map((r) => String(r.code));
      const mandiCodes = mandis
        .filter((r) => normalize(r.mandi_name).includes(term))
        .map((r) => String(r.mandi_code));
      const stateCodes = states
        .filter((r) => normalize(r.state_name).includes(term))
        .map((r) => String(r.state_code));

      const clauses = [
        ...(commodityCodes.length ? [`commodity_code.in.(${commodityCodes.join(',')})`] : []),
        ...(mandiCodes.length ? [`mandi_code.in.(${mandiCodes.join(',')})`] : []),
        ...(stateCodes.length ? [`state_code.in.(${stateCodes.join(',')})`] : []),
        `variety.ilike.*${search}*`,
        `grade.ilike.*${search}*`,
      ];
      const searchExpression = `(${clauses.join(',')})`;
      if (searchExpression.length > 7000) {
        return invalidQuery('This search is too broad. Add more letters or use the commodity, state, or mandi filters.');
      }
      filters.or = searchExpression;
    }

    // CSV staging is intentionally excluded. All counts and rows come from the
    // normalized official-observation table and are paged directly in Postgres.
    const selected = await fetchRows('national_market_price_observations',
      'id,commodity_code,mandi_code,state_code,district_code,observation_date,modal_price,min_price,max_price,arrival_quantity,source,variety,grade',
      {
        order: 'observation_date.desc,id.desc',
        limit,
        offset,
        filters,
        exactCount: true,
      });

    const count = selected.total ?? 0;
    if (offset > 0 && offset >= count) {
      return invalidQuery(count === 0
        ? 'No records match the selected filters.'
        : `The requested offset is outside the result set. The last available page starts at offset ${Math.floor((count - 1) / limit) * limit}.`, 416);
    }

    const rows = selected.rows.map((row) => mapObservation(row, commodityNames, stateNames, mandiNames));
    let summary: {
      latest: MappedObservation | null;
      previous: MappedObservation | null;
      changeAmount: number | null;
      changePercent: number | null;
      observedRecords: number;
    } | undefined;
    let latestObservationDate: string | null = null;

    // Summary cards are calculated once on page one. Later page requests only
    // retrieve their rows and exact count, avoiding two redundant price queries.
    if (offset === 0) {
      const rawLatest = selected.rows[0] ?? null;
      const latest = rawLatest ? mapObservation(rawLatest, commodityNames, stateNames, mandiNames) : null;
      let previous: MappedObservation | null = null;

      if (latest) {
        const previousFilters: Record<string, string> = {
          modal_price: 'gt.0',
          commodity_code: `eq.${latest.commodity_code}`,
          mandi_code: `eq.${latest.mandi_code}`,
          state_code: `eq.${latest.state_code}`,
          observation_date: `lt.${latest.observation_date}`,
        };
        if (latest.variety) previousFilters.variety = `eq.${latest.variety}`;
        if (latest.grade) previousFilters.grade = `eq.${latest.grade}`;
        if (latest.source) previousFilters.source = `eq.${latest.source}`;

        const previousRow = (await fetchRows('national_market_price_observations',
          'id,commodity_code,mandi_code,state_code,district_code,observation_date,modal_price,min_price,max_price,arrival_quantity,source,variety,grade',
          { order: 'observation_date.desc,id.desc', limit: 1, filters: previousFilters })).rows[0] ?? null;
        previous = previousRow ? mapObservation(previousRow, commodityNames, stateNames, mandiNames) : null;
      }

      const changeAmount = latest && previous
        ? Number((latest.modal_price - previous.modal_price).toFixed(2))
        : null;
      const changePercent = latest && previous && previous.modal_price !== 0
        ? Number((changeAmount! / previous.modal_price * 100).toFixed(2))
        : null;

      summary = {
        latest,
        previous,
        changeAmount,
        changePercent,
        observedRecords: count,
      };
      latestObservationDate = latest?.observation_date ?? null;
    }

    const totalPages = Math.ceil(count / limit);
    return NextResponse.json({
      ok: true,
      rows,
      commodities: commodities.map((r) => ({ code: String(r.code), name: String(r.name) })),
      states: states.map((r) => ({ code: String(r.state_code), name: String(r.state_name) })),
      mandis: mandis.map((r) => ({ code: String(r.mandi_code), name: String(r.mandi_name), state_code: String(r.state_code || '') })),
      summary,
      count,
      loaded_count: rows.length,
      imported_csv_count: 0,
      csv_staging_enabled: false,
      capped: false,
      latest_observation_date: latestObservationDate,
      source: 'Supabase public.national_market_price_observations · exact count · CSV staging disabled',
      metadata_cached_for_seconds: Math.max(0, Math.floor(((metadataCache?.expiresAt ?? Date.now()) - Date.now()) / 1000)),
      pagination: {
        limit,
        offset,
        total: count,
        page: Math.floor(offset / limit) + 1,
        totalPages,
        hasMore: offset + rows.length < count,
      },
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
