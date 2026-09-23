import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

const OGD_RESOURCE_ID = '35985678-0d79-46b4-9ed6-6f13308a1d24';
const OGD_BASE_URL = 'https://api.data.gov.in/resource/';
const DEFAULT_PAGE_SIZE = 200;
const MAX_PAGE_SIZE = 100;

const STATE_CODES: Record<string,string> = {
  'TAMIL NADU':'TN','MAHARASHTRA':'MH','KARNATAKA':'KA','UTTAR PRADESH':'UP','PUNJAB':'PB','HARYANA':'HR','MADHYA PRADESH':'MP','GUJARAT':'GJ','WEST BENGAL':'WB','ANDHRA PRADESH':'AP','TELANGANA':'TS','RAJASTHAN':'RJ','BIHAR':'BR','KERALA':'KL','ODISHA':'OD','ASSAM':'AS','CHHATTISGARH':'CG','JHARKHAND':'JH','HIMACHAL PRADESH':'HP','UTTARAKHAND':'UK','GOA':'GA','DELHI':'DL'
};
const REGIONS: Record<string,'NORTH'|'SOUTH'|'EAST'|'WEST'|'CENTRAL'|'NORTHEAST'> = {
  TN:'SOUTH',KA:'SOUTH',AP:'SOUTH',TS:'SOUTH',KL:'SOUTH',MH:'WEST',GJ:'WEST',GA:'WEST',RJ:'WEST',UP:'NORTH',PB:'NORTH',HR:'NORTH',HP:'NORTH',UK:'NORTH',DL:'NORTH',MP:'CENTRAL',CG:'CENTRAL',WB:'EAST',BR:'EAST',OD:'EAST',JH:'EAST',AS:'NORTHEAST'
};

function slugify(text: string): string {
  return text.trim().toUpperCase().replace(/[^A-Z0-9]+/g,'_').replace(/^_+|_+$/g,'');
}
function stateCodeFor(name: string): string {
  const upper=name.trim().toUpperCase();
  return STATE_CODES[upper] || upper.substring(0,2) || 'IN';
}
function parseDate(value?: string): string | null {
  if (!value) return null;
  const raw=value.trim();
  const dmy=raw.split('/');
  if (dmy.length===3) {
    const [d,m,y]=dmy;
    if (y?.length===4) return `${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`;
  }
  if (/^\\d{4}-\\d{2}-\\d{2}$/.test(raw)) return raw;
  return null;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const offset = Math.max(0, Number.parseInt(searchParams.get('offset') || '0',10) || 0);
    const limit = Math.min(MAX_PAGE_SIZE, Math.max(1, Number.parseInt(searchParams.get('limit') || String(DEFAULT_PAGE_SIZE),10) || DEFAULT_PAGE_SIZE));
    const apiKey = process.env.DATA_GOV_IN_API_KEY;
    if (!apiKey) return NextResponse.json({ok:false,error:'DATA_GOV_IN_API_KEY is not configured server-side.'},{status:503});

    const apiUrl = `${OGD_BASE_URL}${OGD_RESOURCE_ID}?api_key=${encodeURIComponent(apiKey)}&format=json&offset=${offset}&limit=${limit}`;
    const upstream = await fetch(apiUrl,{cache:'no-store'});
    if (!upstream.ok) return NextResponse.json({ok:false,error:`AGMARKNET request failed: HTTP ${upstream.status}`},{status:upstream.status});

    const payload = await upstream.json();
    const records = Array.isArray(payload?.records) ? payload.records : [];
    const cookieStore = cookies();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xrcqzpnstdbbtafhcwbb.supabase.co';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    if (!supabaseKey) {
      return NextResponse.json({ ok: false, error: 'Supabase publishable key is not configured in Vercel Production.' }, { status: 503 });
    }
    const supabase = createServerClient(
      supabaseUrl,
      supabaseKey,
      { cookies: { get(name: string){ return cookieStore.get(name)?.value; } } }
    );

    let ingested=0, skipped=0, errors=0;
    for (const rec of records) {
      const state=String(rec?.State ?? rec?.state ?? '').trim();
      const district=String(rec?.District ?? rec?.district ?? '').trim();
      const market=String(rec?.Market ?? rec?.market ?? '').trim();
      const commodity=String(rec?.Commodity ?? rec?.commodity ?? '').trim();
      const variety=String(rec?.Variety ?? rec?.variety ?? 'Standard').trim() || 'Standard';
      const modal=Number(rec?.['Modal Price'] ?? rec?.modal_price);
      if (!state || !district || !market || !commodity || !Number.isFinite(modal)) { skipped++; continue; }

      const stateCode=stateCodeFor(state);
      const districtCode=`${stateCode}_${slugify(district)}`;
      const mandiCode=`${districtCode}_${slugify(market)}`;
      const commodityCode=slugify(commodity);
      const variantCode=`${commodityCode}_${slugify(variety)}`;
      const obsDate=parseDate(String(rec?.Arrival_Date ?? rec?.arrival_date ?? '')) || new Date().toISOString().slice(0,10);
      const minPrice=Number(rec?.['Min Price'] ?? rec?.min_price);
      const maxPrice=Number(rec?.['Max Price'] ?? rec?.max_price);
      const min=minPrice>0?minPrice:modal;
      const max=maxPrice>0?maxPrice:modal;

      try {
        const results = await Promise.all([
          supabase.from('national_states').upsert({state_code:stateCode,name:state,region:REGIONS[stateCode] || 'CENTRAL'},{onConflict:'state_code'}),
          supabase.from('national_districts').upsert({state_code:stateCode,district_code:districtCode,name:district},{onConflict:'district_code'}),
          supabase.from('national_mandis').upsert({district_code:districtCode,mandi_code:mandiCode,name:market},{onConflict:'mandi_code'}),
          supabase.from('national_commodities').upsert({code:commodityCode,name:commodity,category:'AGRICULTURE',standard_unit:'QUINTAL'},{onConflict:'code'}),
          supabase.from('national_commodity_variants').upsert({variant_code:variantCode,variant_name:variety,grade:String(rec?.Grade ?? rec?.grade ?? 'STANDARD')},{onConflict:'variant_code'})
        ]);
        const dimensionError=results.find(r=>r.error)?.error;
        if (dimensionError) { errors++; continue; }

        const {error: obsError}=await supabase.from('national_market_price_observations').upsert({
          commodity_code:commodityCode,variant_code:variantCode,mandi_code:mandiCode,district_code:districtCode,state_code:stateCode,
          price_signal_type:'OBSERVED_MANDI',min_price:min,max_price:max,modal_price:modal,observed_at:`${obsDate}T00:00:00.000Z`,
          source:'AGMARKNET_OFFICIAL',source_url:OGD_BASE_URL+OGD_RESOURCE_ID,geography:`${district}, ${state}`,unit:'INR_PER_QUINTAL',
          validation_status:'VALIDATED',data_layer:'CANONICAL',is_synthetic:false,commodity_name:commodity,variety_name:variety,grade_name:String(rec?.Grade ?? rec?.grade ?? 'STANDARD'),
          mandi_name:market,arrival_unit:null,raw_payload:rec
        },{onConflict:'commodity_code,variant_code,mandi_code,observed_at,source'});
        if (obsError) { errors++; continue; }

        await supabase.from('market_prices').upsert({mandi_name:market,district,state,commodity,observation_date:obsDate,min_price:min,modal_price:modal,max_price:max,unit:'QUINTAL',source_name:'AGMARKNET_OFFICIAL'});
        ingested++;
      } catch { errors++; }
    }

    return NextResponse.json({ok:true,source:'AGMARKNET_OFFICIAL',resource_id:OGD_RESOURCE_ID,offset,limit,total_records:Number(payload?.total || records.length),page_records:records.length,ingested_count:ingested,skipped_count:skipped,error_count:errors,next_offset:records.length===limit?offset+limit:null,timestamp:new Date().toISOString()});
  } catch (error:any) {
    return NextResponse.json({ok:false,error:error?.message || 'Server ingestion error'},{status:500});
  }
}
