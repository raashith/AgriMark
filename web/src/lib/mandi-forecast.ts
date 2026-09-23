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

    // Fallback baseline if insufficient history
    let lastObservedPrice = 2000;
    let dailySlope = 0;
    let stdDev = 50;

    if (numPoints > 0) {
      const prices = validHistory.map((h) => Number(h.modal_price) || 0);
      lastObservedPrice = prices[prices.length - 1];

      if (numPoints >= 2) {
        // Simple linear trend estimation over history
        const n = prices.length;
        const xAvg = (n - 1) / 2;
        const yAvg = prices.reduce((acc, p) => acc + p, 0) / n;

        let num = 0;
        let den = 0;
        prices.forEach((y, x) => {
          num += (x - xAvg) * (y - yAvg);
          den += (x - xAvg) * (x - xAvg);
        });

        dailySlope = den !== 0 ? num / den : 0;
        // Cap daily slope to prevent explosive forecasts
        dailySlope = Math.max(-50, Math.min(50, dailySlope));

        // Calculate standard deviation for prediction intervals
        const variance = prices.reduce((acc, p) => acc + Math.pow(p - yAvg, 2), 0) / n;
        stdDev = Math.sqrt(variance) || 40;
      }
    }

    const predictions: ForecastPoint[] = [];

    for (let day = 1; day <= horizonDays; day++) {
      const targetTime = new Date(baseDate);
      targetTime.setDate(targetTime.getDate() + day);
      const targetDateStr = targetTime.toISOString().split('T')[0];

      // Projected point estimate
      const predictedVal = Math.max(100, Math.round((lastObservedPrice + dailySlope * day) * 100) / 100);

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
