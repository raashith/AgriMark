import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const OGD_URL = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';
const SOURCE_URL = 'https://agmarknet.gov.in/';

function num(v: unknown): number | null {
  const n = Number(String(v ?? '').replace(/,/g, '').trim());
  return Number.isFinite(n) ? n : null;
}

function code(value: string): string {
  return value.trim().toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 100);
}

function category(group: string, commodity: string) {
  const g = group.toLowerCase();
  if (g.includes('cereal')) return 'CEREALS';
  if (g.includes('pulse')) return 'PULSES';
  if (g.includes('oil')) return 'OILSEEDS';
  if (g.includes('fruit')) return 'FRUITS';
  if (g.includes('spice')) return 'SPICES';
  if (g.includes('fibre') || g.includes('fiber')) return 'FIBER';
  if (['Tomato','Onion','Potato','Brinjal','Cabbage','Carrot','Cauliflower','Green Chilli'].some((x) => commodity.toLowerCase().includes(x.toLowerCase()))) return 'VEGETABLES';
  return 'COMMERCIAL_CROPS';
}

export async function GET() {
  const apiKey = process.env.DATA_GOV_IN_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ ok: false, error: 'DATA_GOV_IN_API_KEY is not configured on the server.' }, { status: 503 });
  }

  const limit = Math.min(Math.max(Number(process.env.MANDI_INGEST_LIMIT || 500), 100), 1000);
  const params = new URLSearchParams({
    'api-key': apiKey,
    format: 'json',
    offset: '0',
    limit: String(limit),
  });

  const response = await fetch(OGD_URL + '?' + params.toString(), {
    cache: 'no-store',
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    return NextResponse.json({ ok: false, error: 'OGD API returned ' + response.status }, { status: 502 });
  }

  const payload = await response.json();
  const records = Array.isArray(payload?.records) ? payload.records : [];

  let inserted = 0;
  let skipped = 0;

  for (const r of records) {
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

    if (!state || !district || !mandi || !commodity || !observedDate || minPrice == null || maxPrice == null || modalPrice == null) {
      skipped += 1;
      continue;
    }
    if (minPrice < 0 || maxPrice < minPrice || modalPrice < minPrice || modalPrice > maxPrice) {
      skipped += 1;
      continue;
    }

    const stateCode = code(state).slice(0, 10);
    const districtCode = code(state + '_' + district).slice(0, 20);
    const mandiCode = code(state + '_' + district + '_' + mandi).slice(0, 100);
    const commodityCode = code(commodity).slice(0, 50);
    const variantCode = variety ? code(commodity + '_' + variety).slice(0, 100) : null;
    const observedAt = observedDate + 'T00:00:00+05:30';

    const { error: stateError } = await supabase.from('national_states').upsert({
      state_code: stateCode,
      name: state,
      region: 'SOUTH',
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

    const { error: commodityError } = await supabase.from('national_commodities').upsert({
      code: commodityCode,
      name: commodity,
      category: category(String(r.cmdt_grp_name ?? r.commodity_group ?? ''), commodity),
    }, { onConflict: 'code' });
    if (commodityError) throw new Error('commodity upsert failed: ' + commodityError.message);

    if (variantCode) {
      const { error: variantError } = await supabase.from('national_commodity_variants').upsert({
        variant_code: variantCode,
        commodity_id: (await supabase.from('national_commodities').select('id').eq('code', commodityCode).single()).data?.id,
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
      unit: String(r.unit_name_price ?? 'INR_PER_QUINTAL'),
      raw_payload: r,
      validation_status: 'VALIDATED',
      data_layer: 'CANONICAL',
      is_synthetic: false,
    }, { onConflict: 'commodity_code,variant_code,mandi_code,observed_at,source' });

    if (priceError) throw new Error('price upsert failed: ' + priceError.message);
    inserted += 1;
  }

  return NextResponse.json({ ok: true, fetched: records.length, upserted: inserted, skipped });
}
