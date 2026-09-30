import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const OGD_RESOURCE_ID = '35985678-0d79-46b4-9ed6-6f13308a1d24';
const OGD_BASE_URL = 'https://api.data.gov.in/resource/';
const PAGE_SIZE = 100;
const ALLOWED_CATEGORIES = new Set([
  'CEREALS',
  'PULSES',
  'OILSEEDS',
  'VEGETABLES',
  'FRUITS',
  'SPICES',
  'COMMERCIAL_CROPS',
  'FIBER',
]);

const STATE_CODES: Record<string, string> = {
  'TAMIL NADU': 'TN',
  MAHARASHTRA: 'MH',
  KARNATAKA: 'KA',
  'UTTAR PRADESH': 'UP',
  PUNJAB: 'PB',
  HARYANA: 'HR',
  'MADHYA PRADESH': 'MP',
  GUJARAT: 'GJ',
  'WEST BENGAL': 'WB',
  'ANDHRA PRADESH': 'AP',
  TELANGANA: 'TS',
  RAJASTHAN: 'RJ',
  BIHAR: 'BR',
  KERALA: 'KL',
  ODISHA: 'OD',
  ASSAM: 'AS',
  CHHATTISGARH: 'CG',
  JHARKHAND: 'JH',
  'HIMACHAL PRADESH': 'HP',
  UTTARAKHAND: 'UK',
  GOA: 'GA',
  DELHI: 'DL',
};

const REGIONS: Record<string, string> = {
  TN: 'SOUTH',
  KA: 'SOUTH',
  AP: 'SOUTH',
  TS: 'SOUTH',
  KL: 'SOUTH',
  MH: 'WEST',
  GJ: 'WEST',
  GA: 'WEST',
  RJ: 'WEST',
  UP: 'NORTH',
  PB: 'NORTH',
  HR: 'NORTH',
  HP: 'NORTH',
  UK: 'NORTH',
  DL: 'NORTH',
  MP: 'CENTRAL',
  CG: 'CENTRAL',
  WB: 'EAST',
  BR: 'EAST',
  OD: 'EAST',
  JH: 'EAST',
  AS: 'NORTHEAST',
};

function slugify(value: unknown): string {
  return String(value ?? '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function parseDate(value: unknown): string | null {
  const raw = String(value ?? '').trim();
  if (!raw) return null;
  const dmy = raw.split('/');
  if (dmy.length === 3 && dmy[2].length === 4) {
    return `${dmy[2]}-${dmy[1].padStart(2, '0')}-${dmy[0].padStart(2, '0')}`;
  }
  if (/^\\d{4}-\\d{2}-\\d{2}$/.test(raw)) return raw;
  return null;
}

function categoryFor(value: unknown): string {
  const raw = String(value ?? '').trim().toUpperCase();
  if (ALLOWED_CATEGORIES.has(raw)) return raw;
  if (raw.includes('CEREAL')) return 'CEREALS';
  if (raw.includes('PULSE')) return 'PULSES';
  if (raw.includes('OIL')) return 'OILSEEDS';
  if (raw.includes('FRUIT')) return 'FRUITS';
  if (raw.includes('SPICE')) return 'SPICES';
  if (raw.includes('FIBER') || raw.includes('FIBRE')) return 'FIBER';
  if (raw.includes('COMMERCIAL')) return 'COMMERCIAL_CROPS';
  return 'VEGETABLES';
}

function isAuthorized(request: Request): boolean {
  const cronSecret = process.env.CRON_SECRET;
  const authorization = request.headers.get('authorization');
  return Boolean(cronSecret && authorization === `Bearer ${cronSecret}`);
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const apiKey = process.env.DATA_GOV_IN_API_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!apiKey || !supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Mandi ingestion is not configured. Required server secrets: DATA_GOV_IN_API_KEY, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, CRON_SECRET.',
      },
      { status: 503 },
    );
  }

  const { searchParams } = new URL(request.url);
  const arrivalDate = searchParams.get('date') || new Date().toISOString().slice(0, 10);
  const maxPages = Math.min(10, Math.max(1, Number.parseInt(searchParams.get('pages') || '10', 10) || 10));

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const runInsert = await supabase
    .from('mandi_data_ingestion_runs')
    .insert({
      source: 'AGMARKNET_OFFICIAL',
      resource_id: OGD_RESOURCE_ID,
      requested_date: arrivalDate,
      status: 'RUNNING',
    })
    .select('id')
    .single();

  if (runInsert.error || !runInsert.data?.id) {
    return NextResponse.json(
      { ok: false, error: runInsert.error?.message || 'Could not create ingestion run.' },
      { status: 500 },
    );
  }

  const runId = runInsert.data.id;
  let recordsSeen = 0;
  let recordsIngested = 0;
  let recordsSkipped = 0;
  let recordsFailed = 0;

  try {
    for (let page = 0; page < maxPages; page += 1) {
      const offset = page * PAGE_SIZE;
      const apiUrl =
        `${OGD_BASE_URL}${OGD_RESOURCE_ID}?api-key=${encodeURIComponent(apiKey)}&format=json&offset=${offset}&limit=${PAGE_SIZE}&filters[Arrival_Date]=${encodeURIComponent(arrivalDate)}`;

      const upstream = await fetch(apiUrl, { cache: 'no-store' });
      if (!upstream.ok) {
        throw new Error(`Government OGD returned HTTP ${upstream.status}.`);
      }

      const payload = await upstream.json();
      const records = Array.isArray(payload?.records) ? payload.records : [];
      recordsSeen += records.length;

      for (const record of records) {
        const state = String(record?.State ?? record?.state ?? '').trim();
        const district = String(record?.District ?? record?.district ?? '').trim();
        const market = String(record?.Market ?? record?.market ?? '').trim();
        const commodity = String(record?.Commodity ?? record?.commodity ?? '').trim();
        const variety = String(record?.Variety ?? record?.variety ?? 'Standard').trim() || 'Standard';
        const grade = String(record?.Grade ?? record?.grade ?? 'STANDARD').trim() || 'STANDARD';
        const modal = Number(record?.['Modal Price'] ?? record?.modal_price);
        const minPriceRaw = Number(record?.['Min Price'] ?? record?.min_price);
        const maxPriceRaw = Number(record?.['Max Price'] ?? record?.max_price);
        const obsDate = parseDate(record?.Arrival_Date ?? record?.arrival_date);

        if (!state || !district || !market || !commodity || !obsDate || !Number.isFinite(modal) || modal <= 0) {
          recordsSkipped += 1;
          continue;
        }

        const minPrice = Number.isFinite(minPriceRaw) && minPriceRaw > 0 ? minPriceRaw : modal;
        const maxPrice = Number.isFinite(maxPriceRaw) && maxPriceRaw >= minPrice ? maxPriceRaw : modal;
        const stateCode = STATE_CODES[state.toUpperCase()] || slugify(state).slice(0, 10) || 'IN';
        const districtCode = `${stateCode}_${slugify(district)}`;
        const mandiCode = `${districtCode}_${slugify(market)}`;
        const commodityCode = slugify(commodity);
        const variantCode = `${commodityCode}_${slugify(variety) || 'STANDARD'}`;

        try {
          const dims = await Promise.all([
            supabase.from('national_states').upsert(
              { state_code: stateCode, name: state, region: REGIONS[stateCode] || 'CENTRAL' },
              { onConflict: 'state_code' },
            ),
            supabase.from('national_districts').upsert(
              { state_code: stateCode, district_code: districtCode, name: district },
              { onConflict: 'district_code' },
            ),
            supabase.from('national_mandis').upsert(
              { district_code: districtCode, mandi_code: mandiCode, name: market },
              { onConflict: 'mandi_code' },
            ),
            supabase.from('national_commodities').upsert(
              {
                code: commodityCode,
                name: commodity,
                category: categoryFor(commodity),
                standard_unit: 'QUINTAL',
              },
              { onConflict: 'code' },
            ),
            supabase.from('national_commodity_variants').upsert(
              { variant_code: variantCode, variant_name: variety, grade },
              { onConflict: 'variant_code' },
            ),
          ]);

          const dimError = dims.find((result) => result.error)?.error;
          if (dimError) throw dimError;

          const observation = await supabase.from('national_market_price_observations').upsert(
            {
              commodity_code: commodityCode,
              variant_code: variantCode,
              mandi_code: mandiCode,
              district_code: districtCode,
              state_code: stateCode,
              price_signal_type: 'OBSERVED_MANDI',
              min_price: minPrice,
              max_price: maxPrice,
              modal_price: modal,
              arrival_quantity_mt: Number(record?.['Arrival Quantity'] ?? record?.arrival_quantity_mt ?? 0) || 0,
              observed_at: `${obsDate}T00:00:00.000Z`,
              source: 'AGMARKNET_OFFICIAL',
              source_url: `https://www.data.gov.in/resource/current-daily-price-various-commodities-various-markets-mandi`,
              retrieved_at: new Date().toISOString(),
              published_at: `${obsDate}T00:00:00.000Z`,
              license: 'OPEN_GOVERNMENT_DATA',
              coverage_start: obsDate,
              coverage_end: obsDate,
              geography: `${district}, ${state}`,
              unit: 'INR_PER_QUINTAL',
              schema_version: 'v1.0',
              quality_score: 0.95,
              validation_status: 'VALIDATED',
              data_layer: 'CANONICAL',
              is_synthetic: false,
              commodity_name: commodity,
              variety_name: variety,
              grade_name: grade,
              mandi_name: market,
              raw_payload: record,
            },
            { onConflict: 'commodity_code,variant_code,mandi_code,observed_at,source' },
          );

          if (observation.error) throw observation.error;
          recordsIngested += 1;
        } catch {
          recordsFailed += 1;
        }
      }

      if (records.length < PAGE_SIZE) break;
    }

    await supabase
      .from('mandi_data_ingestion_runs')
      .update({
        status: 'SUCCEEDED',
        finished_at: new Date().toISOString(),
        records_seen: recordsSeen,
        records_ingested: recordsIngested,
        records_skipped: recordsSkipped,
        records_failed: recordsFailed,
      })
      .eq('id', runId);

    return NextResponse.json({
      ok: true,
      source: 'AGMARKNET_OFFICIAL',
      resource_id: OGD_RESOURCE_ID,
      requested_date: arrivalDate,
      records_seen: recordsSeen,
      records_ingested: recordsIngested,
      records_skipped: recordsSkipped,
      records_failed: recordsFailed,
      run_id: runId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Mandi ingestion failed.';
    await supabase
      .from('mandi_data_ingestion_runs')
      .update({
        status: 'FAILED',
        finished_at: new Date().toISOString(),
        records_seen: recordsSeen,
        records_ingested: recordsIngested,
        records_skipped: recordsSkipped,
        records_failed: recordsFailed,
        error_message: message,
      })
      .eq('id', runId);

    return NextResponse.json({ ok: false, error: message, run_id: runId }, { status: 502 });
  }
}
