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
function parseDate(value?: string): string | null {
  if (!value) return null;
  const raw = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw) && !Number.isNaN(Date.parse(`${raw}T00:00:00Z`))) return raw;
  const dmy = raw.split('/');
  if (dmy.length === 3) {
    const [d,m,y] = dmy;
    const parsed = `${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`;
    if (/^\d{4}-\d{2}-\d{2}$/.test(parsed) && !Number.isNaN(Date.parse(`${parsed}T00:00:00Z`))) return parsed;
  }
  return null;
}
type IngestPreview = {
  valid: boolean;
  observation_date: string | null;
  state: string;
  district: string;
  mandi: string;
  commodity: string;
  modal_price: number;
  min_price: number;
  max_price: number;
  raw_record: unknown;
};

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
    const records: unknown[] = Array.isArray(payload?.records) ? payload.records : [];

    const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL||process.env.SUPABASE_URL||CANONICAL_SUPABASE_URL).replace(/\/$/,'');
    if (supabaseUrl !== CANONICAL_SUPABASE_URL) {
      return NextResponse.json({ok:false,error:'Ingestion is configured for a non-canonical Supabase project. Update server configuration before ingesting.',request_id:requestId},{status:503});
    }
    const supabaseKey = getApiKey();
    if (!supabaseKey) return NextResponse.json({ok:false,error:'Supabase API key is not configured server-side.',request_id:requestId},{status:503});
    const cookieStore = cookies();
    const supabase = createServerClient(supabaseUrl,supabaseKey,{cookies:{get(name:string){return cookieStore.get(name)?.value;}}});

    // Legacy payload is incompatible with the canonical table. This check proves
    // the table shape, but intentionally performs no mutation.
    const {error:schemaCheckError} = await supabase.from('national_market_price_observations')
      .select('id,observation_date,state_code,district_code,mandi_code,commodity_code,variety,grade,arrival_quantity,min_price,max_price,modal_price,source,source_record_id,raw_record')
      .limit(1);
    if (schemaCheckError) return NextResponse.json({ok:false,error:`Canonical observation schema check failed: ${schemaCheckError.message}`,request_id:requestId},{status:503});

    const preview: IngestPreview[] = records.map((record: unknown) => {
      const rec = (record && typeof record === 'object') ? record as Record<string,unknown> : {};
      const modal = Number(rec['Modal Price'] ?? rec.modal_price);
      const minRaw = Number(rec['Min Price'] ?? rec.min_price);
      const maxRaw = Number(rec['Max Price'] ?? rec.max_price);
      const obsDate = parseDate(String(rec.Arrival_Date ?? rec.arrival_date ?? ''));
      const state = String(rec.State ?? rec.state ?? '').trim();
      const district = String(rec.District ?? rec.district ?? '').trim();
      const market = String(rec.Market ?? rec.market ?? '').trim();
      const commodity = String(rec.Commodity ?? rec.commodity ?? '').trim();
      const valid = Boolean(obsDate && state && district && market && commodity && Number.isFinite(modal) && modal > 0);
      return {valid,observation_date:obsDate,state,district,mandi:market,commodity,modal_price:modal,min_price:minRaw>0?minRaw:modal,max_price:maxRaw>0?maxRaw:modal,raw_record:rec};
    });
    const validCount = preview.filter((row: IngestPreview) => row.valid).length;
    const sample = preview.slice(0,3).map((row: IngestPreview) => {
      const {raw_record,...item} = row;
      return item;
    });
    return NextResponse.json({
      ok:false,mode:'PREVIEW_ONLY',request_id:requestId,source:'AGMARKNET_OFFICIAL',
      resource_id:OGD_RESOURCE_ID,offset,limit,total_records:Number(payload?.total||records.length),
      page_records:records.length,accepted_preview_count:validCount,rejected_preview_count:preview.length-validCount,
      next_offset:records.length===limit?offset+limit:null,
      error:'Live ingestion is paused because this endpoint’s write payload is not aligned with the canonical production schema. No database rows were written.',
      sample,timestamp:new Date().toISOString(),
    },{status:409});
  } catch(error:unknown) {
    const message = error instanceof Error ? error.message : 'Server ingestion error';
    return NextResponse.json({ok:false,error:message,request_id:requestId},{status:500});
  }
}
