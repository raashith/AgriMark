import { NextResponse } from 'next/server';
import { ForecastingMLOpsEngine } from '@/lib/forecasting-mlops-engine';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const requestId = `req-${Date.now()}`;
  const { searchParams } = new URL(request.url);
  const commodityCode = searchParams.get('commodity_code') || 'RICE_PADDY';
  const stateCode = searchParams.get('state_code') || 'TN';

  // Sample historical evaluation
  const actuals = [2150, 2180, 2200, 2240, 2230, 2270, 2300, 2320];
  const predictions = [2140, 2190, 2210, 2230, 2245, 2260, 2310, 2315];
  const lower_bounds_95 = [2080, 2130, 2150, 2170, 2185, 2200, 2250, 2255];
  const upper_bounds_95 = [2200, 2250, 2270, 2290, 2305, 2320, 2370, 2375];

  const metrics = ForecastingMLOpsEngine.evaluateModel({
    actuals,
    predictions,
    lower_bounds_95,
    upper_bounds_95
  });

  const run = {
    id: `run-${Date.now()}`,
    model_name: 'AgriMark-Hybrid-XGB-LSTM',
    model_version: 'v2.4.1',
    model_type: 'HYBRID' as const,
    commodity_code: commodityCode,
    state_code: stateCode,
    training_period_start: '2020-01-01',
    training_period_end: '2025-12-31',
    feature_set: ['historical_mandi_modal', 'rainfall_anomaly', 'temp_max', 'fuel_price_index', 'fpo_listings_vol'],
    validation_method: 'ROLLING_WINDOW' as const,
    executed_at: new Date().toISOString(),
    is_champion: true
  };

  const championRun = ForecastingMLOpsEngine.selectChampionModel([{ run, metrics: { ...metrics, forecast_run_id: run.id, evaluated_at: new Date().toISOString() } }]);

  return NextResponse.json({
    success: true,
    request_id: requestId,
    timestamp: new Date().toISOString(),
    data: {
      champion_model: championRun,
      evaluation_metrics: metrics,
      next_30d_prediction: {
        target_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        predicted_modal_price_inr: 2345.50,
        lower_bound_95: 2260.00,
        upper_bound_95: 2431.00,
        confidence_interval_width: 171.00,
        forecast_horizon_days: 30
      }
    }
  }, {
    headers: { 'X-Request-ID': requestId }
  });
}



