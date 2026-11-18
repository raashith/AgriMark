import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { MandiForecastEngine, PriceObservationInput } from '@/lib/mandi-forecast';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const PAGE_SIZE = 1000;
const MAX_HISTORY_ROWS = 100_000;
const HISTORY_WINDOW_DAYS = 365;
const MIN_TRAINING_DATES = 5;

function indiaToday() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

function shiftDate(date: string, days: number) {
  const shifted = new Date(`${date}T00:00:00.000Z`);
  shifted.setUTCDate(shifted.getUTCDate() + days);
  return shifted.toISOString().slice(0, 10);
}

function dayDifference(from: string, to: string) {
  return Math.max(0, Math.floor((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86400000));
}

function invalid(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, {
    status,
    headers: { 'Cache-Control': 'no-store, max-age=0' },
  });
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const commodityCode = searchParams.get('commodity_code')?.trim() || searchParams.get('commodity')?.trim() || '';
    const mandiCode = searchParams.get('mandi_code')?.trim() || searchParams.get('mandi')?.trim() || '';
    const stateCode = searchParams.get('state_code')?.trim() || '';
    const districtCode = searchParams.get('district_code')?.trim() || '';
    const variety = searchParams.get('variety')?.trim() || '';
    const grade = searchParams.get('grade')?.trim() || '';
    const rawHorizon = searchParams.get('horizon_days') ?? searchParams.get('days') ?? '7';
    const requestedHorizon = Number(rawHorizon);

    if (!commodityCode) return invalid('A valid commodity_code is required for a mandi forecast.');
    if (!Number.isSafeInteger(requestedHorizon) || requestedHorizon < 1 || requestedHorizon > 30) {
      return invalid('horizon_days must be a whole number between 1 and 30.');
    }
    const horizonDays = requestedHorizon;
    const baseDate = indiaToday();

    const cookieStore = cookies();
    const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'https://tsdjtlmrvbspyzgwmccg.supabase.co').replace(/\/$/, '');
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
      || process.env.SUPABASE_SECRET_KEY
      || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
      || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      || '';
    if (!supabaseKey) {
      return invalid('Supabase credentials are not configured for price forecasting.', 503);
    }

    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: { get(name: string) { return cookieStore.get(name)?.value; } },
    });

    const buildLatestQuery = () => {
      let query = supabase
        .from('national_market_price_observations')
        .select('observation_date')
        .eq('commodity_code', commodityCode)
        .eq('source', 'AGMARKNET')
        .gt('modal_price', 0)
        .lte('observation_date', baseDate)
        .order('observation_date', { ascending: false })
        .limit(1);
      if (stateCode) query = query.eq('state_code', stateCode);
      if (districtCode) query = query.eq('district_code', districtCode);
      if (mandiCode) query = query.eq('mandi_code', mandiCode);
      if (variety) query = query.eq('variety', variety);
      if (grade) query = query.eq('grade', grade);
      return query;
    };

    const { data: latestRecord, error: latestError } = await buildLatestQuery().maybeSingle();
    if (latestError) throw latestError;
    const sourceDate = latestRecord?.observation_date ? String(latestRecord.observation_date).slice(0, 10) : '';
    if (!sourceDate) {
      return NextResponse.json({
        ok: false,
        error: 'No official price observation was found for this commodity and mandi selection.',
      }, { status: 404 });
    }

    // Keep one year of source history, ending at the latest real observation
    // no later than today in India. Cross-mandi rows are collapsed into daily
    // medians below so a national snapshot is never mistaken for a time series.
    const historyStart = shiftDate(sourceDate, -HISTORY_WINDOW_DAYS);
    const buildHistoryQuery = () => {
      let query = supabase
        .from('national_market_price_observations')
        .select('id,commodity_code,state_code,district_code,mandi_code,variety,grade,modal_price,min_price,max_price,observation_date', { count: 'exact' })
        .eq('commodity_code', commodityCode)
        .eq('source', 'AGMARKNET')
        .gt('modal_price', 0)
        .gte('observation_date', historyStart)
        .lte('observation_date', sourceDate)
        .order('observation_date', { ascending: true })
        .order('id', { ascending: true });
      if (stateCode) query = query.eq('state_code', stateCode);
      if (districtCode) query = query.eq('district_code', districtCode);
      if (mandiCode) query = query.eq('mandi_code', mandiCode);
      if (variety) query = query.eq('variety', variety);
      if (grade) query = query.eq('grade', grade);
      return query;
    };

    const firstPage = await buildHistoryQuery().range(0, PAGE_SIZE - 1);
    if (firstPage.error) throw firstPage.error;
    const expectedRows = Number(firstPage.count ?? firstPage.data?.length ?? 0);
    if (expectedRows > MAX_HISTORY_ROWS) {
      return invalid(
        `This forecast selection contains ${expectedRows.toLocaleString('en-IN')} observations. Narrow it to a state, district, or mandi to keep the forecast request within its safe processing limit.`,
        413,
      );
    }

    const historyData: any[] = [...(firstPage.data || [])];
    for (let offset = historyData.length; offset < expectedRows; offset += PAGE_SIZE) {
      const nextPage = await buildHistoryQuery().range(offset, Math.min(offset + PAGE_SIZE - 1, expectedRows - 1));
      if (nextPage.error) throw nextPage.error;
      historyData.push(...(nextPage.data || []));
      if (!nextPage.data?.length) break;
    }

    const byDate = new Map<string, Array<{ row: any; price: number; min: number; max: number }>>();
    for (const row of historyData) {
      const date = String(row.observation_date).slice(0, 10);
      const price = Number(row.modal_price);
      if (!date || !Number.isFinite(price) || price <= 0) continue;
      const bucket = byDate.get(date) || [];
      bucket.push({
        row,
        price,
        min: Number(row.min_price ?? price),
        max: Number(row.max_price ?? price),
      });
      byDate.set(date, bucket);
    }

    const median = (values: number[]) => {
      const sorted = values.filter(Number.isFinite).sort((a, b) => a - b);
      if (!sorted.length) return 0;
      const mid = Math.floor(sorted.length / 2);
      return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    };

    const observations: PriceObservationInput[] = Array.from(byDate.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, bucket]) => ({
        commodity_code: commodityCode,
        state_code: stateCode || bucket[0]?.row.state_code || undefined,
        district_code: districtCode || bucket[0]?.row.district_code || undefined,
        mandi_code: mandiCode || undefined,
        modal_price: median(bucket.map((item) => item.price)),
        min_price: median(bucket.map((item) => item.min)),
        max_price: median(bucket.map((item) => item.max)),
        observed_at: date,
      }));

    if (!observations.length) {
      return NextResponse.json({ ok: false, error: 'No valid AGMARKNET price history was found for this selection.' }, { status: 404 });
    }

    const daysSinceLastObservation = dayDifference(sourceDate, baseDate);
    if (observations.length < MIN_TRAINING_DATES) {
      const baseline = Number(observations[observations.length - 1].modal_price);
      const baselinePoints = Array.from({ length: horizonDays }, (_, index) => {
        const target = new Date(`${baseDate}T00:00:00.000Z`);
        target.setUTCDate(target.getUTCDate() + index + 1);
        return {
          target_date: target.toISOString().slice(0, 10),
          forecast_horizon_days: index + 1,
          predicted_value: baseline,
          lower_bound_95: baseline,
          upper_bound_95: baseline,
          data_type: 'BASELINE_NOT_TRAINED',
        };
      });

      return NextResponse.json({
        ok: true,
        training_status: 'BASELINE_ONLY',
        message: `A flat reference baseline is shown from the latest real price dated ${sourceDate}. Only ${observations.length} distinct observation date(s) are available; at least ${MIN_TRAINING_DATES} are required before a time-trend model is used. No confidence interval is claimed.`,
        source_date: sourceDate,
        forecast_base_date: baseDate,
        days_since_last_observation: daysSinceLastObservation,
        distinct_observation_dates: observations.length,
        commodity_code: commodityCode,
        mandi_code: mandiCode || null,
        forecast: baselinePoints,
        observed_count: observations.length,
        source_row_count: historyData.length,
        history_start_date: observations[0].observed_at,
        history_end_date: observations[observations.length - 1].observed_at,
        model_name: null,
        model_version: null,
        materialized_run_id: null,
        persistence: 'READ_ONLY',
      }, { headers: { 'Cache-Control': 'no-store, max-age=0' } });
    }

    const forecastResult = MandiForecastEngine.generatePriceForecast(
      observations,
      commodityCode,
      horizonDays,
      baseDate,
      stateCode || undefined,
      districtCode || undefined,
    );

    // Forecast GET requests are read-only. Persisting model runs is a separate
    // authenticated write workflow, not a side effect of opening a dashboard.
    return NextResponse.json({
      ok: true,
      training_status: 'MODEL_READY',
      timestamp: new Date().toISOString(),
      source_date: sourceDate,
      forecast_base_date: baseDate,
      days_since_last_observation: daysSinceLastObservation,
      distinct_observation_dates: observations.length,
      commodity_code: commodityCode,
      mandi_code: mandiCode || null,
      forecast: forecastResult.predictions,
      observed_count: forecastResult.historical_data_points,
      source_row_count: historyData.length,
      history_start_date: observations[0].observed_at,
      history_end_date: observations[observations.length - 1].observed_at,
      model_name: forecastResult.model_name,
      model_version: forecastResult.model_version,
      materialized_run_id: null,
      persistence: 'READ_ONLY',
    }, { headers: { 'Cache-Control': 'no-store, max-age=0' } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown mandi forecast error.';
    return NextResponse.json({ ok: false, error: message }, {
      status: 500,
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    });
  }
}
