import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

const CANONICAL_SUPABASE_URL = 'https://tsdjtlmrvbspyzgwmccg.supabase.co';
const OGD_RESOURCE_ID = '35985678-0d79-46b4-9ed6-6f13308a1d24';
const OGD_BASE_URL = 'https://api.data.gov.in/resource/';
const MAX_PAGE_SIZE = 100;

function getApiKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY
    || process.env.SUPABASE_SECRET_KEY
    || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    || '';
}

function slugify(text: string) {
  return text.trim().toUpperCase().replace(/[^A-Z0-9]+/g,'_').replace(/^_+|_+$/g,'');
}
function stateCodeFor(name: string) {
  const upper = name.trim().toUpperCase();
  const codes: Record<string,string> = {
    'TAMIL NADU':'TN','MAHARASHTRA':'MH','KARNATAKA':'KA','UTTAR PRADESH':'UP','PUNJAB':'PB','HARYANA':'HR',
    'MADHYA PRADESH':'MP','GUJARAT':'GJ','WEST BENGAL':'WB','ANDHRA PRADESH':'AP','TELANGANA':'TS','RAJASTHAN':'RJ',
    'BIHAR':'BR','KERALA':'KL','ODISHA':'OD','ASSAM':'AS','CHHATTISGARH':'CG','JHARKHAND':'JH',
    'HIMACHAL PRADESH':'HP','UTTARAKHAND':'UK','GOA':'GA','DELHI':'DL'
  };
  return codes[upper] || upper.substring(0,2) || 'IN';
}
function parseDate(value?: string): string | null {
  if (!value) return null;
  const raw=value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw) && !Number.isNaN(Date.parse(`${raw}T00:00:00Z`))) return raw;
  const dmy=raw.split('/');
  if (dmy.length===3) {
    const [d,m,y]=dmy;
    const parsed = `${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`;
    if (/^\d{4}-\d{2}-\d{2}$/.test(parsed) && !Number.isNaN(Date.parse(`${parsed}T00:00:00Z`))) return parsed;
  }
  return null;
}

export async function GET(request: Request) {
  const requestId = `mandi-ingest-${Date.now().toString(36)}`;
  try {
    const {searchParams} = new URL(request.url);
    const offset = Math.max(0,Number.parseInt(searchParams.get('offset')||'0',10)||0);
    const limit = Math.min(MAX_PAGE_SIZE,Math.max(1,Number.parseInt(searchParams.get('limit')||'100',10)||100));
    const apiKey = process.env.DATA_GOV_IN_API_KEY;
    if (!apiKey) return NextResponse.json({ok:false,error:'DATA_GOV_IN_API_KEY is not configured server-side.',request_id:requestId},{status:503});

    const arrivalDate = searchParams.get('date') || new Date().toISOString().slice(0,10);
    const url = new URL(`${OGD_BASE_URL}${OGD_RESOURCE_ID}`);
    url.searchParams.set('api-key',apiKey);
    url.searchParams.set('format','json');
    url.searchParams.set('offset',String(offset));
    url.searchParams.set('limit',String(limit));
    url.searchParams.set('filters[Arrival_Date]',arrivalDate);
    const upstream = await fetch(url,{cache:'no-store',signal:AbortSignal.timeout(20000)});
    if (!upstream.ok) return NextResponse.json({ok:false,error:`AGMARKNET request failed: HTTP ${upstream.status}`,request_id:requestId},{status:upstream.status});
    const payload = await upstream.json();
    const records = Array.isArray(payload?.records) ? payload.records : [];

    const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL||process.env.SUPABASE_URL||CANONICAL_SUPABASE_URL).replace(/\/$/,'');
    if (supabaseUrl !== CANONICAL_SUPABASE_URL) {
      return NextResponse.json({ok:false,error:'Ingestion is configured for a non-canonical Supabase project. Update server configuration before ingesting.',request_id:requestId},{status:503});
    }
    const supabaseKey = getApiKey();
    if (!supabaseKey) return NextResponse.json({ok:false,error:'Supabase API key is not configured server-side.',request_id:requestId},{status:503});
    const cookieStore = cookies();
    const supabase = createServerClient(supabaseUrl,supabaseKey,{cookies:{get(name:string){return cookieStore.get(name)?.value;}}});

    // This legacy route's writes do not match the live canonical observation
    // schema (which uses observation_date/variety/grade/source/raw_record and has
    // no variant_code/observed_at/source_url fields). Refuse to write until the
    // canonical ingestion worker is implemented, rather than partially mutating
    // dimensions or reporting false success.
    const {error:schemaCheckError} = await supabase.from('national_market_price_observations')
      .select('id,observation_date,state_code,district_code,mandi_code,commodity_code,variety,grade,arrival_quantity,min_price,max_price,modal_price,source,source_record_id,raw_record')
      .limit(1);
    if (schemaCheckError) return NextResponse.json({ok:false,error:`Canonical observation schema check failed: ${schemaCheckError.message}`,request_id:requestId},{status:503});

    // A read-only preview avoids corruption until the ingestion route is
    // rewritten against the current dimension/schema constraints.
    const preview = records.map((rec:any)=>{
      const modal = Number(rec?.['Modal Price'] ?? rec?.modal_price);
      const minRaw = Number(rec?.['Min Price'] ?? rec?.min_price);
      const maxRaw = Number(rec?.['Max Price'] ?? rec?.max_price);
      const arrival = String(rec?.Arrival_Date ?? rec?.arrival_date ?? '').trim();
      const obsDate = parseDate(arrival);
      const state = String(rec?.State ?? rec?.state ?? '').trim();
      const district = String(rec?.District ?? rec?.district ?? '').trim();
      const market = String(rec?.Market ?? rec?.market ?? '').trim();
      const commodity = String(rec?.Commodity ?? rec?.commodity ?? '').trim();
      const valid = Boolean(obsDate && state && district && market && commodity && Number.isFinite(modal) && modal > 0);
      return {valid,observation_date:obsDate,state,district,mandi:market,commodity,modal_price:modal,min_price:minRaw>0?minRaw:modal,max_price:maxRaw>0?maxRaw:modal,raw_record:rec};
    });
    const validCount = preview.filter(x=>x.valid).length;
    return NextResponse.json({
      ok:false,mode:'PREVIEW_ONLY',request_id:requestId,source:'AGMARKNET_OFFICIAL',
      resource_id:OGD_RESOURCE_ID,offset,limit,total_records:Number(payload?.total||records.length),
      page_records:records.length,accepted_preview_count:validCount,rejected_preview_count:preview.length-validCount,
      next_offset:records.length===limit?offset+limit:null,
      error:'Live ingestion is paused because this endpoint’s write payload is not aligned with the canonical production schema. No database rows were written.',
      sample:preview.slice(0,3).map(({raw_record,...item})=>item),
      timestamp:new Date().toISOString(),
    },{status:409});
  } catch (error:any) {
    return NextResponse.json({ok:false,error:error?.message||'Server ingestion error',request_id:requestId},{status:500});
  }
}
