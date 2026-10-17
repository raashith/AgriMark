/**
 * AgriMark Leakage-Safe Mandi Price Forecasting Engine
 * 
 * Enforces strict temporal isolation: Future price observations are guaranteed
 * never to enter training or feature calculation windows.
 */

export interface PriceObservationInput {
  commodity_code: string;
  state_code?: string;
  district_code?: string;
  mandi_code?: string;
  modal_price: number;
  min_price?: number;
  max_price?: number;
  observed_at: string; // ISO Date String
}

export interface ForecastPoint {
  target_date: string; // YYYY-MM-DD
  forecast_horizon_days: number;
  predicted_value: number;
  lower_bound_95: number;
  upper_bound_95: number;
  data_type: 'PROJECTED';
}

export interface ForecastResult {
  commodity_code: string;
  state_code?: string;
  district_code?: string;
  model_name: string;
  model_version: string;
  model_type: 'TIME_SERIES' | 'BASELINE_STATISTICAL' | 'HYBRID';
  base_date: string;
  history_window_days: number;
  historical_data_points: number;
  predictions: ForecastPoint[];
}

export class MandiForecastEngine {
  /**
   * Generates a leakage-safe price forecast based strictly on historical observations on or before baseDate.
   */
  public static generatePriceForecast(
    observations: PriceObservationInput[],
    commodityCode: string,
    horizonDays: number = 7,
    baseDateIso?: string,
    stateCode?: string,
    districtCode?: string
  ): ForecastResult {
    const baseDate = baseDateIso ? new Date(baseDateIso) : new Date();
    const cutoffTime = baseDate.getTime();

    // 1. Strict Temporal Leakage Guard: Exclude any observations past cutoffTime
    const validHistory = observations
      .filter((obs) => {
        const obsTime = new Date(obs.observed_at).getTime();
        return !isNaN(obsTime) && obsTime <= cutoffTime && obs.commodity_code === commodityCode;
      })
      .sort((a, b) => new Date(a.observed_at).getTime() - new Date(b.observed_at).getTime());

    const numPoints = validHistory.length;

    // No fabricated fallback price: an empty history is reported as unavailable
    // by the API before this engine is called.
    let lastObservedPrice = 0;
    let dailySlope = 0;
    let stdDev = 0;
    let daysSinceLastObservation = 0;

    if (numPoints > 0) {
      const prices = validHistory.map((h) => Number(h.modal_price)).filter((p) => Number.isFinite(p) && p > 0);
      lastObservedPrice = prices[prices.length - 1] || 0;
      const firstTime = new Date(validHistory[0].observed_at).getTime();
      const lastTime = new Date(validHistory[validHistory.length - 1].observed_at).getTime();
      daysSinceLastObservation = Math.max(0, Math.round((cutoffTime - lastTime) / 86400000));

      if (numPoints >= 2 && prices.length === numPoints) {
        // Fit trend against elapsed calendar days, not array position. This
        // remains correct when observation dates have gaps.
        const xValues = validHistory.map((h) => (new Date(h.observed_at).getTime() - firstTime) / 86400000);
        const n = prices.length;
        const xAvg = xValues.reduce((sum, x) => sum + x, 0) / n;
        const yAvg = prices.reduce((sum, p) => sum + p, 0) / n;
        let numerator = 0;
        let denominator = 0;
        for (let i = 0; i < n; i += 1) {
          numerator += (xValues[i] - xAvg) * (prices[i] - yAvg);
          denominator += (xValues[i] - xAvg) ** 2;
        }
        dailySlope = denominator > 0 ? numerator / denominator : 0;
        dailySlope = Math.max(-50, Math.min(50, dailySlope));

        const residuals = prices.map((price, index) => price - (yAvg + dailySlope * (xValues[index] - xAvg)));
        const residualVariance = residuals.reduce((sum, residual) => sum + residual ** 2, 0) / n;
        stdDev = Math.sqrt(residualVariance);
      }
      // A single date supports only a flat baseline. Use a modest price-relative
      // uncertainty band rather than inventing a historic trend.
      stdDev = stdDev || Math.max(10, lastObservedPrice * 0.015);
    }

    const predictions: ForecastPoint[] = [];

    for (let day = 1; day <= horizonDays; day++) {
      const targetTime = new Date(baseDate);
      targetTime.setDate(targetTime.getDate() + day);
      const targetDateStr = targetTime.toISOString().split('T')[0];

      // Projected point estimate
      const predictedVal = Math.max(1, Math.round((lastObservedPrice + dailySlope * (daysSinceLastObservation + day)) * 100) / 100);

      // Uncertainty expands with horizon length
      const horizonFactor = 1.0 + Math.sqrt(day) * 0.15;
      const margin95 = Math.round(1.96 * stdDev * horizonFactor * 100) / 100;

      predictions.push({
        target_date: targetDateStr,
        forecast_horizon_days: day,
        predicted_value: predictedVal,
        lower_bound_95: Math.max(50, Math.round((predictedVal - margin95) * 100) / 100),
        upper_bound_95: Math.round((predictedVal + margin95) * 100) / 100,
        data_type: 'PROJECTED',
      });
    }

    return {
      commodity_code: commodityCode,
      state_code: stateCode,
      district_code: districtCode,
      model_name: 'AgriMark-ExponentialTrend-v1',
      model_version: '1.2.0',
      model_type: 'TIME_SERIES',
      base_date: baseDate.toISOString().split('T')[0],
      history_window_days: 30,
      historical_data_points: numPoints,
      predictions,
    };
  }
}
