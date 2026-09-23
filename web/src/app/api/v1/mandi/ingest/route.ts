import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

const OGD_RESOURCE_ID = '9ef4b77d-9a0c-4988-8573-054bb0058170';
const OGD_BASE_URL = 'https://api.data.gov.in/resource/';

function getStateCode(stateName: string): string {
  if (!stateName) return 'IN';
  const s = stateName.trim().toUpperCase();
  const map: Record<string, string> = {
    'TAMIL NADU': 'TN',
    'MAHARASHTRA': 'MH',
    'KARNATAKA': 'KA',
    'UTTAR PRADESH': 'UP',
    'PUNJAB': 'PB',
    'HARYANA': 'HR',
    'MADHYA PRADESH': 'MP',
    'GUJARAT': 'GJ',
    'WEST BENGAL': 'WB',
    'ANDHRA PRADESH': 'AP',
    'TELANGANA': 'TS',
    'RAJASTHAN': 'RJ',
    'BIHAR': 'BR',
    'KERALA': 'KL',
    'ODISHA': 'OD',
    'ASSAM': 'AS',
    'CHHATTISGARH': 'CG',
    'JHARKHAND': 'JH',
    'HIMACHAL PRADESH': 'HP',
    'UTTARAKHAND': 'UK',
    'GOA': 'GA',
    'DELHI': 'DL',
  };
  return map[s] || s.substring(0, 2);
}

function getRegionForState(stateCode: string): 'NORTH' | 'SOUTH' | 'EAST' | 'WEST' | 'CENTRAL' | 'NORTHEAST' {
  const map: Record<string, 'NORTH' | 'SOUTH' | 'EAST' | 'WEST' | 'CENTRAL' | 'NORTHEAST'> = {
    TN: 'SOUTH', KA: 'SOUTH', AP: 'SOUTH', TS: 'SOUTH', KL: 'SOUTH',
    MH: 'WEST', GJ: 'WEST', GA: 'WEST', RJ: 'WEST',
    UP: 'NORTH', PB: 'NORTH', HR: 'NORTH', HP: 'NORTH', UK: 'NORTH', DL: 'NORTH',
    MP: 'CENTRAL', CG: 'CENTRAL',
    WB: 'EAST', BR: 'EAST', OD: 'EAST', JH: 'EAST',
    AS: 'NORTHEAST',
  };
  return map[stateCode] || 'CENTRAL';
}

function slugify(text: string): string {
  return text
    .toUpperCase()
    .trim()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const offset = Math.max(0, parseInt(searchParams.get('offset') || '0', 10));
    const limit = Math.min(200, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)));
    const apiKey = process.env.DATA_GOV_IN_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'DATA_GOV_IN_API_KEY server environment variable is not configured.' },
        { status: 500 }
      );
    }

    const apiUrl = `${OGD_BASE_URL}${OGD_RESOURCE_ID}?api-key=${apiKey}&format=json&offset=${offset}&limit=${limit}`;
    const response = await fetch(apiUrl, { cache: 'no-store' });

    if (!response.ok) {
      return NextResponse.json(
        { error: `AGMARKNET API request failed with status ${response.status}` },
        { status: response.status }
      );
    }

    const payload = await response.json();
    const records: Array<{
      state?: string;
      district?: string;
      market?: string;
      commodity?: string;
      variety?: string;
      arrival_date?: string;
      min_price?: string | number;
      max_price?: string | number;
      modal_price?: string | number;
    }> = payload?.records || [];

    const cookieStore = cookies();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xrcqzpnstdbbtafhcwbb.supabase.co';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: { get(name: string) { return cookieStore.get(name)?.value; } },
    });

    let ingestedCount = 0;
    let errorCount = 0;

    for (const rec of records) {
      if (!rec.state || !rec.district || !rec.market || !rec.commodity || !rec.modal_price) {
        continue;
      }

      const stateName = rec.state.trim();
      const districtName = rec.district.trim();
      const mandiName = rec.market.trim();
      const commodityName = rec.commodity.trim();
      const variantName = (rec.variety || 'Standard').trim();

      const stateCode = getStateCode(stateName);
      const districtCode = `${stateCode}_${slugify(districtName)}`;
      const mandiCode = `${districtCode}_${slugify(mandiName)}`;
      const commodityCode = slugify(commodityName);
      const variantCode = `${commodityCode}_${slugify(variantName)}`;

      const minPrice = parseFloat(String(rec.min_price || rec.modal_price)) || 0;
      const maxPrice = parseFloat(String(rec.max_price || rec.modal_price)) || minPrice;
      const modalPrice = parseFloat(String(rec.modal_price)) || minPrice;

      // Parse arrival date (DD/MM/YYYY to YYYY-MM-DD)
      let obsDate = new Date().toISOString().split('T')[0];
      if (rec.arrival_date) {
        const parts = rec.arrival_date.split('/');
        if (parts.length === 3) {
          obsDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        }
      }
      const observedAt = new Date(obsDate).toISOString();

      // Upsert canonical dimension records into Supabase
      try {
        await supabase.from('national_states').upsert({
          state_code: stateCode,
          name: stateName,
          region: getRegionForState(stateCode),
        }, { onConflict: 'state_code' });

        await supabase.from('national_districts').upsert({
          state_code: stateCode,
          district_code: districtCode,
          name: districtName,
        }, { onConflict: 'district_code' });

        await supabase.from('national_mandis').upsert({
          district_code: districtCode,
          mandi_code: mandiCode,
          name: mandiName,
        }, { onConflict: 'mandi_code' });

        await supabase.from('national_commodities').upsert({
          code: commodityCode,
          name: commodityName,
          category: 'CEREALS',
        }, { onConflict: 'code' });

        await supabase.from('national_commodity_variants').upsert({
          variant_code: variantCode,
          variant_name: variantName,
        }, { onConflict: 'variant_code' });

        // Upsert canonical price observation
        const { error: obsErr } = await supabase.from('national_market_price_observations').insert({
          commodity_code: commodityCode,
          variant_code: variantCode,
          mandi_code: mandiCode,
          district_code: districtCode,
          state_code: stateCode,
          price_signal_type: 'OBSERVED_MANDI',
          min_price: minPrice,
          max_price: maxPrice,
          modal_price: modalPrice,
          observed_at: observedAt,
          source: 'AGMARKNET_OFFICIAL',
          source_url: apiUrl,
          geography: `${districtName}, ${stateName}`,
          unit: 'INR_PER_QUINTAL',
          validation_status: 'VALIDATED',
          data_layer: 'CANONICAL',
          is_synthetic: false,
        });

        // Also sync to UI table market_prices
        await supabase.from('market_prices').upsert({
          mandi_name: mandiName,
          district: districtName,
          state: stateName,
          commodity: commodityName,
          observation_date: obsDate,
          min_price: minPrice,
          modal_price: modalPrice,
          max_price: maxPrice,
          unit: 'QUINTAL',
          source_name: 'AGMARKNET_OFFICIAL',
        });

        if (!obsErr) {
          ingestedCount++;
        } else {
          errorCount++;
        }
      } catch {
        errorCount++;
      }
    }

    return NextResponse.json({
      success: true,
      source: 'AGMARKNET_OFFICIAL',
      resource_id: OGD_RESOURCE_ID,
      offset,
      limit,
      total_records: payload?.total || records.length,
      ingested_count: ingestedCount,
      error_count: errorCount,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Server ingestion error' },
      { status: 500 }
    );
  }
}
