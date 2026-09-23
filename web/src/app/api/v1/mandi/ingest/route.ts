import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const OGD_URL = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';
const SOURCE_URL = 'https://agmarknet.gov.in/';
const DEFAULT_PAGE_SIZE = 1000;
const MAX_PAGES_PER_REQUEST = 20;

function num(v: unknown): number | null {
  const n = Number(String(v ?? '').replace(/,/g, '').trim());
  return Number.isFinite(n) ? n : null;
}

function code(value: string, max = 100): string {
  return value.trim().toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, max);
}

function category(group: string, commodity: string) {
  const g = group.toLowerCase();
  if (g.includes('cereal')) return 'CEREALS';
  if (g.includes('pulse')) return 'PULSES';
  if (g.includes('oil')) return 'OILSEEDS';
  if (g.includes('fruit')) return 'FRUITS';
  if (g.includes('spice')) return 'SPICES';
  if (g.includes('fibre') || g.includes('fiber')) return 'FIBER';
  if (['Tomato', 'Onion', 'Potato', 'Brinjal', 'Cabbage', 'Carrot', 'Cauliflower', 'Green Chilli']
    .some((x) => commodity.toLowerCase().includes(x.toLowerCase()))) return 'VEGETABLES';
  return 'COMMERCIAL_CROPS';
}

function positiveInt(raw: string | null, fallback: number, max: number): number {
  const value = Number(raw);
  return Number.isFinite(value) && value > 0 ? Math.min(Math.floor(value), max) : fallback;
}

async function fetchPage(apiKey: string, offset: number, limit: number, state?: string, commodity?: string) {
  const params = new URLSearchParams({
    'api-key': apiKey,
    format: 'json',
    offset: String(offset),
    limit: String(limit),
  });

  if (state) params.set('filters[state.keyword]', state);
  if (commodity) params.set('filters[commodity]', commodity);

  const response = await fetch(OGD_URL + '?' + params.toString(), {
    cache: 'no-store',
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`OGD API returned ${response.status}: ${body.slice(0, 300)}`);
  }

  return response.json();
}

async function upsertRecord(r: Record<string, unknown>) {
  const state = String(r.state ?? '').trim();
  const district = String(r.district ?? '').trim();
  const mandi = String(r.market ?? r.mandi ?? '').trim();
  const commodity = String(r.commodity ?? '').trim();
  const variety = String(r.variety ?? '').trim();
  const grade = String(r.grade ?? '').trim();
  const observedDate = String(r.arrival_date ?? r.date ?? '').trim();
  const minPrice = num(r.min_price);
  const maxPrice = num(r.max_price);
  const modalPrice = num(r.modal_price);

  if (!state || !district || !mandi || !commodity || !observedDate ||
      minPrice == null || maxPrice == null || modalPrice == null) return { skipped: true };

  if (minPrice < 0 || maxPrice < minPrice || modalPrice < minPrice || modalPrice > maxPrice) {
    return { skipped: true };
  }

  const stateCode = code(state, 10);
  const districtCode = code(state + '_' + district, 20);
  const mandiCode = code(state + '_' + district + '_' + mandi, 100);
  const commodityCode = code(commodity, 50);
  const variantCode = variety ? code(commodity + '_' + variety, 100) : null;
  const observedAt = observedDate + 'T00:00:00+05:30';

  const { error: stateError } = await supabase.from('national_states').upsert({
    state_code: stateCode,
    name: state,
    region: 'INDIA',
  }, { onConflict: 'state_code' });
  if (stateError) throw new Error('state upsert failed: ' + stateError.message);

  const { error: districtError } = await supabase.from('national_districts').upsert({
    district_code: districtCode,
    state_code: stateCode,
    name: district,
  }, { onConflict: 'district_code' });
  if (districtError) throw new Error('district upsert failed: ' + districtError.message);

  const { error: mandiError } = await supabase.from('national_mandis').upsert({
    mandi_code: mandiCode,
    district_code: districtCode,
    name: mandi,
  }, { onConflict: 'mandi_code' });
  if (mandiError) throw new Error('mandi upsert failed: ' + mandiError.message);

  const { data: commodityRow, error: commodityError } = await supabase.from('national_commodities').upsert({
    code: commodityCode,
    name: commodity,
    category: category(String(r.cmdt_grp_name ?? r.commodity_group ?? ''), commodity),
  }, { onConflict: 'code' }).select('id').single();
  if (commodityError || !commodityRow) {
    throw new Error('commodity upsert failed: ' + (commodityError?.message || 'missing commodity id'));
  }

  if (variantCode) {
    const { error: variantError } = await supabase.from('national_commodity_variants').upsert({
      variant_code: variantCode,
      commodity_id: commodityRow.id,
      variant_name: variety,
      grade: grade || 'STANDARD',
    }, { onConflict: 'variant_code' });
    if (variantError) throw new Error('variant upsert failed: ' + variantError.message);
  }

  const { error: priceError } = await supabase.from('national_market_price_observations').upsert({
    commodity_code: commodityCode,
    commodity_name: commodity,
    variant_code: variantCode,
    variety_name: variety || null,
    grade_name: grade || null,
    mandi_code: mandiCode,
    mandi_name: mandi,
    district_code: districtCode,
    state_code: stateCode,
    price_signal_type: 'OBSERVED_MANDI',
    min_price: minPrice,
    max_price: maxPrice,
    modal_price: modalPrice,
    arrival_quantity_mt: 0,
    arrival_unit: null,
    observed_at: observedAt,
    source: 'AGMARKNET',
    source_url: SOURCE_URL,
    retrieved_at: new Date().toISOString(),
    license: 'AGMARKNET_OPEN',
    coverage_start: observedDate.slice(0, 10),
    coverage_end: observedDate.slice(0, 10),
    geography: state + ' / ' + district + ' / ' + mandi,
    unit: 'INR_PER_QUINTAL',
    raw_payload: r,
    validation_status: 'VALIDATED',
    data_layer: 'CANONICAL',
    is_synthetic: false,
  }, { onConflict: 'commodity_code,variant_code,mandi_code,observed_at,source' });

  if (priceError) throw new Error('price upsert failed: ' + priceError.message);
  return { skipped: false };
}

export async function GET(request: Request) {
  const apiKey = process.env.DATA_GOV_IN_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ ok: false, error: 'DATA_GOV_IN_API_KEY is not configured on the server.' }, { status: 503 });
  }

  const url = new URL(request.url);
  const pageSize = positiveInt(url.searchParams.get('page_size'), DEFAULT_PAGE_SIZE, DEFAULT_PAGE_SIZE);
  const pages = positiveInt(url.searchParams.get('pages'), 1, MAX_PAGES_PER_REQUEST);
  const state = url.searchParams.get('state')?.trim() || undefined;
  const commodity = url.searchParams.get('commodity')?.trim() || undefined;

  let fetched = 0;
  let upserted = 0;
  let skipped = 0;
  let totalAvailable: number | null = null;
  let pagesProcessed = 0;

  for (let page = 0; page < pages; page += 1) {
    const offset = page * pageSize;
    const payload = await fetchPage(apiKey, offset, pageSize, state, commodity);
    const records = Array.isArray(payload?.records) ? payload.records : [];
    totalAvailable = Number.isFinite(Number(payload?.total)) ? Number(payload.total) : totalAvailable;
    pagesProcessed += 1;
    fetched += records.length;

    for (const record of records as Record<string, unknown>[]) {
      const result = await upsertRecord(record);
      if (result.skipped) skipped += 1;
      else upserted += 1;
    }

    if (records.length < pageSize || (totalAvailable != null && offset + records.length >= totalAvailable)) {
      break;
    }
  }

  return NextResponse.json({
    ok: true,
    source: 'AGMARKNET',
    fetched,
    upserted,
    skipped,
    pages_processed: pagesProcessed,
    page_size: pageSize,
    total_available_reported_by_ogd: totalAvailable,
    next_step: totalAvailable != null && pagesProcessed * pageSize < totalAvailable
      ? 'Call this endpoint again with a larger pages value or targeted filters.'
      : 'Ingestion window complete.',
  });
}
