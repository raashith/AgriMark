import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { MandiForecastEngine, PriceObservationInput } from '@/lib/mandi-forecast';

export const dynamic = 'force-dynamic';

const CANONICAL_SUPABASE_URL = 'https://tsdjtlmrvbspyzgwmccg.supabase.co';
function getSupabaseKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY
    || process.env.SUPABASE_SECRET_KEY
    || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    || '';
}
function validIsoDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00.000Z`));
}

export async function GET(request: Request) {
  const requestId = `mandi-forecast-${Date.now().toString(36)}`;
  try {
    const { searchParams } = new URL(request.url);
    const requestedCommodityCode = searchParams.get('commodity_code') || searchParams.get('commodity');
    const commodityCode = requestedCommodityCode?.trim() || 'com-paddy-common-e045104e';
    const mandiCode = searchParams.get('mandi_code') || searchParams.get('mandi') || undefined;
    const stateCode = searchParams.get('state_code') || undefined;
    const districtCode = searchParams.get('district_code') || undefined;
    const requestedHorizon = Number.parseInt(searchParams.get('horizon_days') || searchParams.get('days') || '7', 10);
    const horizonDays = Math.min(30, Math.max(1, Number.isFinite(requestedHorizon) ? requestedHorizon : 7));
    const suppliedBaseDate = searchParams.get('base_date');
    const baseDate = suppliedBaseDate || new Date().toISOString().slice(0, 10);
    if (!validIsoDate(baseDate)) return NextResponse.json({ok:false,error:'base_date must be YYYY-MM-DD',request_id:requestId},{status:400});

    const cookieStore = cookies();
    const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || CANONICAL_SUPABASE_URL).replace(/\/$/, '');
    if (supabaseUrl !== CANONICAL_SUPABASE_URL) {
      return NextResponse.json({ok:false,error:'Mandi forecasting is not configured for the canonical AgriMark Supabase project.',request_id:requestId},{status:503});
    }
    const supabaseKey = getSupabaseKey();
    if (!supabaseKey) return NextResponse.json({ok:false,error:'Supabase API key is not configured server-side.',request_id:requestId},{status:503});
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: { get(name: string) { return cookieStore.get(name)?.value; } },
    });

    const PAGE_SIZE = 1000;
    const historyData: any[] = [];
    for (let offset = 0; offset < 100000; offset += PAGE_SIZE) {
      let query = supabase
        .from('national_market_price_observations')
        .select('commodity_code,state_code,district_code,mandi_code,modal_price,min_price,max_price,observation_date')
        .eq('commodity_code', commodityCode)
        .lte('observation_date', baseDate)
        .order('observation_date', { ascending: true })
        .range(offset, offset + PAGE_SIZE - 1);
      if (stateCode) query = query.eq('state_code', stateCode);
      if (districtCode) query = query.eq('district_code', districtCode);
      if (mandiCode) query = query.eq('mandi_code', mandiCode);
      const { data: page, error } = await query;
      if (error) throw error;
      historyData.push(...(page || []));
      if (!page || page.length < PAGE_SIZE) break;
    }

    const byDate = new Map<string, Array<{row:any;price:number;min:number;max:number}>>();
    for (const row of historyData) {
      const date = String(row.observation_date || '').slice(0, 10);
      const price = Number(row.modal_price);
      if (!validIsoDate(date) || !Number.isFinite(price) || price <= 0) continue;
      const bucket = byDate.get(date) || [];
      bucket.push({row,price,min:Number(row.min_price ?? price),max:Number(row.max_price ?? price)});
      byDate.set(date,bucket);
    }
    const median = (values:number[]) => {
      const sorted = values.filter(Number.isFinite).sort((a,b)=>a-b);
      if (!sorted.length) return 0;
      const middle = Math.floor(sorted.length/2);
      return sorted.length%2 ? sorted[middle] : (sorted[middle-1]+sorted[middle])/2;
    };
    const observations: PriceObservationInput[] = Array.from(byDate.entries()).sort(([a],[b])=>a.localeCompare(b)).map(([date,bucket])=>({
      commodity_code:commodityCode,
      state_code:stateCode || bucket[0]?.row.state_code || undefined,
      district_code:districtCode || bucket[0]?.row.district_code || undefined,
      mandi_code:mandiCode || undefined,
      modal_price:median(bucket.map(x=>x.price)),
      min_price:median(bucket.map(x=>x.min)),
      max_price:median(bucket.map(x=>x.max)),
      observed_at:date,
    }));

    if (!observations.length) return NextResponse.json({
      ok:false,error:'No real observations match this commodity and geography.',request_id:requestId,
      commodity_code:commodityCode,mandi_code:mandiCode||null,state_code:stateCode||null,
    },{status:404});

    if (observations.length < 5) {
      const last = observations[observations.length-1];
      const baseline = Number(last.modal_price);
      const lower = Math.max(0,Math.min(Number(last.min_price)||baseline,baseline));
      const upper = Math.max(Number(last.max_price)||baseline,baseline);
      const start = new Date(`${last.observed_at}T00:00:00.000Z`);
      const forecast = Array.from({length:horizonDays},(_,i)=>{
        const target = new Date(start); target.setUTCDate(target.getUTCDate()+i+1);
        return {target_date:target.toISOString().slice(0,10),forecast_horizon_days:i+1,predicted_value:baseline,lower_bound_95:lower,upper_bound_95:upper,data_type:'BASELINE_NOT_TRAINED'};
      });
      return NextResponse.json({
        ok:true,request_id:requestId,training_status:'BASELINE_ONLY',
        message:'Baseline only: fewer than five distinct observation dates. This is not a trained or validated prediction.',
        commodity_code:commodityCode,mandi_code:mandiCode||null,state_code:stateCode||null,
        forecast,observed_count:observations.length,source_row_count:historyData.length,
        history_dates:observations.map(x=>x.observed_at),model_name:null,model_version:null,
        materialized_run_id:null,persistence_status:'NOT_REQUIRED_BASELINE',
      });
    }

    const result = MandiForecastEngine.generatePriceForecast(observations,commodityCode,horizonDays,baseDate,stateCode,districtCode);
    let runId: string | null = null;
    let persistenceStatus = 'FAILED';
    let persistenceWarning: string | null = null;
    const {data:runData,error:runError} = await supabase.from('national_forecast_runs').insert({
      model_name:result.model_name,model_version:result.model_version,model_type:result.model_type,
      commodity_code:commodityCode,state_code:stateCode,district_code:districtCode,
      training_period_start:observations[0].observed_at,training_period_end:baseDate,
      feature_set:{history_points:result.historical_data_points,horizon_days:horizonDays},
      validation_method:'ROLLING_WINDOW',executed_at:new Date().toISOString(),source:'AGRIMARK_MLOPS',
      is_champion:false,
    }).select('id').maybeSingle();

    if (runError || !runData?.id) {
      persistenceWarning = runError?.message || 'Forecast run record was not returned.';
    } else {
      runId = String(runData.id);
      const payload = result.predictions.map(p=>({
        forecast_run_id:runId,commodity_code:commodityCode,state_code:stateCode,district_code:districtCode,
        target_date:p.target_date,predicted_metric:'PRICE',predicted_value:p.predicted_value,
        lower_bound_95:p.lower_bound_95,upper_bound_95:p.upper_bound_95,
        forecast_horizon_days:p.forecast_horizon_days,source:'AGRIMARK_MLOPS',
        geography:districtCode||stateCode||'NATIONAL',unit:'INR_PER_QUINTAL',
        validation_status:'UNVALIDATED',data_layer:'FORECAST',is_synthetic:false,
      }));
      const {error:predictionError}=await supabase.from('national_forecast_predictions').insert(payload);
      if (predictionError) persistenceWarning = predictionError.message;
      else persistenceStatus = 'SAVED_UNVALIDATED';
    }

    return NextResponse.json({
      ok:true,request_id:requestId,timestamp:new Date().toISOString(),
      commodity_code:commodityCode,mandi_code:mandiCode||null,state_code:stateCode||null,
      forecast:result.predictions,observed_count:result.historical_data_points,
      source_row_count:historyData.length,history_dates:observations.map(x=>x.observed_at),
      model_name:result.model_name,model_version:result.model_version,
      materialized_run_id:runId,persistence_status:persistenceStatus,persistence_warning:persistenceWarning,
      training_status:'TREND_FIT_NOT_YET_BACKTEST_VALIDATED',
    });
  } catch (err: any) {
    return NextResponse.json({ok:false,error:err?.message||'Server forecast error',request_id:requestId},{status:500});
  }
}
