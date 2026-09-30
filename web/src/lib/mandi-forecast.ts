/**
 * Leakage-safe Mandi Price Forecasting Engine.
 * Forecasts are produced only when enough verified observed history exists.
 */

export interface PriceObservationInput {
  commodity_code: string;
  state_code?: string;
  district_code?: string;
  mandi_code?: string;
  modal_price: number;
  min_price?: number;
  max_price?: number;
  observed_at: string;
}

export interface ForecastPoint {
  target_date: string;
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
  public static generatePriceForecast(
    observations: PriceObservationInput[],
    commodityCode: string,
    horizonDays = 7,
    baseDateIso?: string,
    stateCode?: string,
    districtCode?: string,
  ): ForecastResult {
    const baseDate = baseDateIso ? new Date(baseDateIso) : new Date();
    const cutoffTime = baseDate.getTime();

    const validHistory = observations
      .filter((obs) => {
        const obsTime = new Date(obs.observed_at).getTime();
        return (
          Number.isFinite(obsTime) &&
          obsTime <= cutoffTime &&
          obs.commodity_code === commodityCode &&
          Number.isFinite(Number(obs.modal_price)) &&
          Number(obs.modal_price) > 0
        );
      })
      .sort(
        (a, b) =>
          new Date(a.observed_at).getTime() - new Date(b.observed_at).getTime(),
      );

    const numPoints = validHistory.length;

    const resultBase = {
      commodity_code: commodityCode,
      state_code: stateCode,
      district_code: districtCode,
      model_name: 'AgriMark-ExponentialTrend-v1',
      model_version: '1.2.0',
      model_type: 'TIME_SERIES' as const,
      base_date: baseDate.toISOString().split('T')[0],
      history_window_days: 30,
      historical_data_points: numPoints,
    };

    // Never manufacture a forecast from a made-up default price.
    if (numPoints < 3) {
      return { ...resultBase, predictions: [] };
    }

    const prices = validHistory.map((h) => Number(h.modal_price));
    const lastObservedPrice = prices[prices.length - 1];
    const n = prices.length;
    const xAvg = (n - 1) / 2;
    const yAvg = prices.reduce((sum, price) => sum + price, 0) / n;

    let numerator = 0;
    let denominator = 0;
    prices.forEach((price, index) => {
      numerator += (index - xAvg) * (price - yAvg);
      denominator += (index - xAvg) * (index - xAvg);
    });

    const dailySlope =
      denominator !== 0
        ? Math.max(-50, Math.min(50, numerator / denominator))
        : 0;

    const variance =
      prices.reduce((sum, price) => sum + Math.pow(price - yAvg, 2), 0) / n;
    const stdDev = Math.sqrt(variance) || 1;

    const predictions: ForecastPoint[] = [];

    for (let day = 1; day <= horizonDays; day += 1) {
      const target = new Date(baseDate);
      target.setDate(target.getDate() + day);

      const predictedVal = Math.max(
        1,
        Math.round((lastObservedPrice + dailySlope * day) * 100) / 100,
      );
      const horizonFactor = 1 + Math.sqrt(day) * 0.15;
      const margin95 =
        Math.round(1.96 * stdDev * horizonFactor * 100) / 100;

      predictions.push({
        target_date: target.toISOString().split('T')[0],
        forecast_horizon_days: day,
        predicted_value: predictedVal,
        lower_bound_95: Math.max(
          0.01,
          Math.round((predictedVal - margin95) * 100) / 100,
        ),
        upper_bound_95: Math.round((predictedVal + margin95) * 100) / 100,
        data_type: 'PROJECTED',
      });
    }

    return { ...resultBase, predictions };
  }
}
