import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { MandiForecastEngine, PriceObservationInput } from '@/lib/mandi-forecast';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const commodityCode = (searchParams.get('commodity_code') || 'RICE_PADDY').toUpperCase();
    const stateCode = searchParams.get('state_code') || undefined;
    const districtCode = searchParams.get('district_code') || undefined;
    const horizonDays = Math.min(30, Math.max(1, parseInt(searchParams.get('horizon_days') || '7', 10)));
    const baseDate = searchParams.get('base_date') || new Date().toISOString().split('T')[0];

    const cookieStore = cookies();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xrcqzpnstdbbtafhcwbb.supabase.co';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: { get(name: string) { return cookieStore.get(name)?.value; } },
    });

    // Fetch historical observed mandi prices strictly prior to or on baseDate
    let query = supabase
      .from('national_market_price_observations')
      .select('commodity_code, state_code, district_code, mandi_code, modal_price, min_price, max_price, observed_at')
      .eq('commodity_code', commodityCode)
      .eq('price_signal_type', 'OBSERVED_MANDI')
      .lte('observed_at', `${baseDate}T23:59:59.999Z`)
      .order('observed_at', { ascending: true })
      .limit(100);

    if (stateCode) query = query.eq('state_code', stateCode);
    if (districtCode) query = query.eq('district_code', districtCode);

    const { data: historyData } = await query;

    const observations: PriceObservationInput[] = (historyData || []).map((row) => ({
      commodity_code: row.commodity_code,
      state_code: row.state_code,
      district_code: row.district_code,
      mandi_code: row.mandi_code,
      modal_price: Number(row.modal_price),
      min_price: Number(row.min_price),
      max_price: Number(row.max_price),
      observed_at: row.observed_at,
    }));

    // Generate leakage-safe time-series forecast
    const forecastResult = MandiForecastEngine.generatePriceForecast(
      observations,
      commodityCode,
      horizonDays,
      baseDate,
      stateCode,
      districtCode
    );

    // Materialize forecast execution into national_forecast_runs
    const trainingStart = observations.length > 0 ? observations[0].observed_at.split('T')[0] : baseDate;
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
      success: true,
      timestamp: new Date().toISOString(),
      forecast: forecastResult,
      materialized_run_id: runData?.id || null,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Server forecast error' },
      { status: 500 }
    );
  }
}
