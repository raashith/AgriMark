import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { MandiForecastEngine, PriceObservationInput } from '@/lib/mandi-forecast';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const requestedCommodityCode = searchParams.get('commodity_code') || searchParams.get('commodity');
    // Commodity codes are case-sensitive values from national_commodities.
    const commodityCode = requestedCommodityCode?.trim() || 'com-paddy-common-e045104e';
    const mandiCode = searchParams.get('mandi_code') || searchParams.get('mandi') || undefined;
    const stateCode = searchParams.get('state_code') || undefined;
    const districtCode = searchParams.get('district_code') || undefined;
    const horizonDays = Math.min(30, Math.max(1, parseInt(searchParams.get('horizon_days') || searchParams.get('days') || '7', 10)));
    const baseDate = searchParams.get('base_date') || new Date().toISOString().split('T')[0];

    const cookieStore = cookies();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tsdjtlmrvbspyzgwmccg.supabase.co';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: { get(name: string) { return cookieStore.get(name)?.value; } },
    });

    // Page through all eligible official observations. Supabase/PostgREST can
    // cap responses below 5,000 rows; a single .limit(5000) silently truncates
    // long-running commodity histories and can bias the fitted trend.
    const PAGE_SIZE = 1000;
    const historyData: any[] = [];
    for (let offset = 0; offset < 100000; offset += PAGE_SIZE) {
      let query = supabase
        .from('national_market_price_observations')
        .select('commodity_code, state_code, district_code, mandi_code, modal_price, min_price, max_price, observation_date')
        .eq('commodity_code', commodityCode)
        .lte('observation_date', baseDate)
        .order('observation_date', { ascending: true })
        .range(offset, offset + PAGE_SIZE - 1);

      if (stateCode) query = query.eq('state_code', stateCode);
      if (districtCode) query = query.eq('district_code', districtCode);
      if (mandiCode) query = query.eq('mandi_code', mandiCode);

      const { data: page, error: pageError } = await query;
      if (pageError) throw pageError;
      historyData.push(...(page || []));
      if (!page || page.length < PAGE_SIZE) break;
    }

    // A national dataset has many mandi rows per day. Aggregate those rows into
    // one robust daily median so cross-mandi differences are never mistaken for
    // a time trend. With one observation date, the engine can only produce a
    // transparent flat baseline, not a learned trend.
    const byDate = new Map<string, Array<{ row: any; price: number; min: number; max: number }>>();
    for (const row of historyData || []) {
      const date = String(row.observation_date).slice(0, 10);
      const price = Number(row.modal_price);
      if (!date || !Number.isFinite(price) || price <= 0) continue;
      const bucket = byDate.get(date) || [];
      bucket.push({ row, price, min: Number(row.min_price ?? price), max: Number(row.max_price ?? price) });
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

    if (observations.length === 0) {
      return NextResponse.json(
        { ok: false, error: 'No real AGMARKNET observations were found for this commodity/mandi selection. Choose a commodity or mandi with stored records.' },
        { status: 404 },
      );
    }

    // Never present a one-day cross-sectional snapshot as a trained forecast.
    // Five distinct daily points are a minimum readiness gate; more history is
    // needed for dependable validation and seasonal modelling.
    if (observations.length < 5) {
      return NextResponse.json({
        ok: true,
        training_status: 'INSUFFICIENT_HISTORY',
        message: 'At least five distinct observed dates are required before fitting a price trend. Ingest more official AGMARKNET history.',
        commodity_code: commodityCode,
        mandi_code: mandiCode || null,
        forecast: [],
        observed_count: observations.length,
        source_row_count: historyData.length,
        history_dates: observations.map((item) => item.observed_at),
        model_name: null,
        model_version: null,
        materialized_run_id: null,
      });
    }

    // Fit the leakage-safe time-series trend using daily medians of official observations
    const forecastResult = MandiForecastEngine.generatePriceForecast(
      observations,
      commodityCode,
      horizonDays,
      baseDate,
      stateCode,
      districtCode
    );

    // Materialize forecast execution into national_forecast_runs
    const trainingStart = observations.length > 0 ? String(observations[0].observed_at).split('T')[0] : baseDate;
    const trainingEnd = baseDate;

    const { data: runData } = await supabase
      .from('national_forecast_runs')
      .insert({
        model_name: forecastResult.model_name,
        model_version: forecastResult.model_version,
        model_type: forecastResult.model_type,
        commodity_code: commodityCode,
        state_code: stateCode,
        district_code: districtCode,
        training_period_start: trainingStart,
        training_period_end: trainingEnd,
        feature_set: { history_points: forecastResult.historical_data_points, horizon_days: horizonDays },
        validation_method: 'ROLLING_WINDOW',
        executed_at: new Date().toISOString(),
        source: 'AGRIMARK_MLOPS',
        is_champion: true,
      })
      .select('id')
      .maybeSingle();

    // Materialize daily prediction points if run succeeded
    if (runData?.id) {
      const runId = runData.id;
      const predictionsPayload = forecastResult.predictions.map((p) => ({
        forecast_run_id: runId,
        commodity_code: commodityCode,
        state_code: stateCode,
        district_code: districtCode,
        target_date: p.target_date,
        predicted_metric: 'PRICE',
        predicted_value: p.predicted_value,
        lower_bound_95: p.lower_bound_95,
        upper_bound_95: p.upper_bound_95,
        forecast_horizon_days: p.forecast_horizon_days,
        source: 'AGRIMARK_MLOPS',
        geography: districtCode || stateCode || 'NATIONAL',
        unit: 'INR_PER_QUINTAL',
        validation_status: 'VALIDATED',
        data_layer: 'FORECAST',
        is_synthetic: false,
      }));

      await supabase.from('national_forecast_predictions').insert(predictionsPayload);
    }

    return NextResponse.json({
      ok: true,
      timestamp: new Date().toISOString(),
      commodity_code: commodityCode,
      mandi_code: mandiCode || null,
      forecast: forecastResult.predictions,
      observed_count: forecastResult.historical_data_points,
      source_row_count: historyData?.length || 0,
      history_dates: observations.map((item) => item.observed_at),
      model_name: forecastResult.model_name,
      model_version: forecastResult.model_version,
      materialized_run_id: runData?.id || null,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || 'Server forecast error' },
      { status: 500 }
    );
  }
}
