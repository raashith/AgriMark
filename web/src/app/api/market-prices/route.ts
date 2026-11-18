import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 100;
const METADATA_PAGE_SIZE = 1000;
const METADATA_REVALIDATE_SECONDS = 3600;
const DEFAULT_SUPABASE_URL = 'https://tsdjtlmrvbspyzgwmccg.supabase.co';

type DatabaseRow = Record<string, any>;

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
  return String(value ?? '')
    .trim()
    .toLocaleLowerCase('en-IN')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .replace(/\s+/g, ' ');
}

function safeSearch(value: string) {
  return value
    .slice(0, 80)
    .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
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
    cacheMetadata?: boolean;
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

  // Lookup tables change far less often than observations. Cache them in the
  // Next.js data cache so every page click does not repeat the same REST reads.
  const response = options.cacheMetadata
    ? await fetch(url, {
        headers,
        cache: 'force-cache',
        next: { revalidate: METADATA_REVALIDATE_SECONDS },
      })
    : await fetch(url, {
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
      cacheMetadata: true,
    });
    rows.push(...page.rows);
    if (page.rows.length < METADATA_PAGE_SIZE) break;
  }
  return rows;
}

type MappedObservation = DatabaseRow & {
  id: number;
  commodity_code: string;
  mandi_code: string;
  state_code: string;
  district_code: string | null;
  observation_date: string;
  modal_price: number;
  min_price: number;
  max_price: number;
  arrival_quantity: number | null;
  commodity_name: string;
  mandi_name: string;
  state_name: string;
  district_name: string;
};

function mapObservation(
  row: DatabaseRow,
  commodityNames: Map<string, string>,
  stateNames: Map<string, string>,
  districtNames: Map<string, string>,
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
    district_name: districtNames.get(String(row.district_code)) || String(row.district_code || 'District unavailable'),
  } as MappedObservation;
}

async function fetchSeriesDateCount(row: MappedObservation): Promise<number | null> {
  const key = getApiKey();
  if (!key) return null;

  const url = new URL(`${getSupabaseUrl()}/rest/v1/rpc/get_market_price_series_date_count`);
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      p_commodity_code: row.commodity_code,
      p_mandi_code: row.mandi_code,
      p_state_code: row.state_code,
      p_variety: row.variety ?? null,
      p_grade: row.grade ?? null,
    }),
    cache: 'no-store',
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    const detail = (await response.text()).slice(0, 300);
    throw new Error(`Market history summary failed (HTTP ${response.status}): ${detail}`);
  }

  const value: unknown = await response.json();
  const count = Number(value);
  return Number.isFinite(count) ? count : null;
}

function filterNullable(value: unknown) {
  return value == null ? 'is.null' : `eq.${String(value)}`;
}

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    const rawCommodity = params.get('commodity')?.trim() || '';
    const rawState = params.get('state')?.trim() || '';
    const rawDistrict = params.get('district')?.trim() || '';
    const rawMandi = params.get('mandi')?.trim() || '';
    const search = safeSearch(params.get('search') || '');
    const includeMetadata = params.get('includeMetadata') !== 'false';

    const parsedLimit = Number(params.get('limit'));
    const limit = Number.isFinite(parsedLimit) && parsedLimit > 0
      ? Math.min(MAX_PAGE_SIZE, Math.max(1, Math.floor(parsedLimit)))
      : DEFAULT_PAGE_SIZE;
    const parsedOffset = Number(params.get('offset'));
    const offset = Number.isSafeInteger(parsedOffset) && parsedOffset > 0
      ? parsedOffset
      : 0;

    const [commodities, states, districts, mandis] = await Promise.all([
      fetchAllMetadata('national_commodities', 'code,name', 'name.asc'),
      fetchAllMetadata('national_states', 'state_code,state_name', 'state_name.asc'),
      fetchAllMetadata('national_districts', 'district_code,district_name,state_code', 'district_name.asc'),
      fetchAllMetadata('national_mandis', 'mandi_code,mandi_name,state_code,district_code', 'mandi_name.asc'),
    ]);

    const commodityNames = new Map(commodities.map((r) => [String(r.code), String(r.name)]));
    const stateNames = new Map(states.map((r) => [String(r.state_code), String(r.state_name)]));
    const districtNames = new Map(districts.map((r) => [String(r.district_code), String(r.district_name)]));
    const mandiNames = new Map(mandis.map((r) => [String(r.mandi_code), String(r.mandi_name)]));

    // Only the canonical AGMARKNET table is queried. CSV staging remains disabled.
    const filters: Record<string, string> = { modal_price: 'gt.0' };
    if (rawCommodity) filters.commodity_code = `eq.${rawCommodity}`;
    if (rawState) filters.state_code = `eq.${rawState}`;
    if (rawDistrict) filters.district_code = `eq.${rawDistrict}`;
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
      const districtCodes = districts
        .filter((r) => normalize(r.district_name).includes(term))
        .map((r) => String(r.district_code));

      const clauses = [
        ...(commodityCodes.length ? [`commodity_code.in.(${commodityCodes.join(',')})`] : []),
        ...(mandiCodes.length ? [`mandi_code.in.(${mandiCodes.join(',')})`] : []),
        ...(stateCodes.length ? [`state_code.in.(${stateCodes.join(',')})`] : []),
        ...(districtCodes.length ? [`district_code.in.(${districtCodes.join(',')})`] : []),
        `variety.ilike.*${search}*`,
        `grade.ilike.*${search}*`,
      ];
      filters.or = `(${clauses.join(',')})`;
    }

    const select = 'id,commodity_code,mandi_code,state_code,district_code,observation_date,modal_price,min_price,max_price,arrival_quantity,source,variety,grade';
    const selected = await fetchRows('national_market_price_observations', select, {
      order: 'observation_date.desc,id.desc',
      limit,
      offset,
      filters,
      exactCount: true,
    });

    const count = selected.total ?? 0;
    const rawLatest = offset === 0
      ? selected.rows[0] ?? null
      : (await fetchRows('national_market_price_observations', select, {
          order: 'observation_date.desc,id.desc',
          limit: 1,
          filters,
        })).rows[0] ?? null;

    const rows = selected.rows.map((row) => mapObservation(row, commodityNames, stateNames, districtNames, mandiNames));
    const latest = rawLatest
      ? mapObservation(rawLatest, commodityNames, stateNames, districtNames, mandiNames)
      : null;

    let previous: MappedObservation | null = null;
    let historyDateCount: number | null = null;
    if (latest) {
      const previousFilters: Record<string, string> = {
        modal_price: 'gt.0',
        commodity_code: `eq.${latest.commodity_code}`,
        mandi_code: filterNullable(latest.mandi_code),
        state_code: filterNullable(latest.state_code),
        variety: filterNullable(latest.variety),
        grade: filterNullable(latest.grade),
        observation_date: `lt.${latest.observation_date}`,
      };
      const [previousResult, dateCountResult] = await Promise.all([
        fetchRows('national_market_price_observations', select, {
          order: 'observation_date.desc,id.desc',
          limit: 1,
          filters: previousFilters,
        }),
        fetchSeriesDateCount(latest).catch((error) => {
          console.error('[market-prices] history summary unavailable:', error);
          return null;
        }),
      ]);
      const previousRow = previousResult.rows[0] ?? null;
      previous = previousRow
        ? mapObservation(previousRow, commodityNames, stateNames, districtNames, mandiNames)
        : null;
      historyDateCount = dateCountResult;
    }

    const changeAmount = latest && previous
      ? Number((latest.modal_price - previous.modal_price).toFixed(2))
      : null;
    const changePercent = latest && previous && previous.modal_price !== 0
      ? Number((changeAmount! / previous.modal_price * 100).toFixed(2))
      : null;

    const totalPages = Math.ceil(count / limit);
    return NextResponse.json({
      ok: true,
      rows,
      ...(includeMetadata ? {
        commodities: commodities.map((r) => ({ code: String(r.code), name: String(r.name) })),
        states: states.map((r) => ({ code: String(r.state_code), name: String(r.state_name) })),
        districts: districts.map((r) => ({ code: String(r.district_code), name: String(r.district_name), state_code: String(r.state_code || '') })),
        mandis: mandis.map((r) => ({ code: String(r.mandi_code), name: String(r.mandi_name), state_code: String(r.state_code || ''), district_code: String(r.district_code || '') })),
      } : {}),
      summary: {
        latest,
        previous,
        changeAmount,
        changePercent,
        observedRecords: count,
        historyDateCount,
      },
      count,
      loaded_count: rows.length,
      imported_csv_count: 0,
      csv_staging_enabled: false,
      capped: false,
      latest_observation_date: latest?.observation_date ?? null,
      source: 'Supabase public.national_market_price_observations · exact count · CSV staging disabled',
      pagination: {
        limit,
        offset,
        total: count,
        page: Math.floor(offset / limit) + 1,
        totalPages,
        hasMore: offset + rows.length < count,
      },
      applied_filters: {
        commodity: rawCommodity || null,
        state: rawState || null,
        district: rawDistrict || null,
        mandi: rawMandi || null,
        search: search || null,
      },
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
