export type MandiPoint = {
  observation_date: string;
  modal_price: number;
  arrival_quantity_mt?: number;
};

export type ForecastPoint = {
  target_date: string;
  predicted_value: number;
  lower_bound_95: number;
  upper_bound_95: number;
};

function mean(values: number[]): number {
  return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
}

function std(values: number[], avg: number): number {
  if (values.length < 2) return Math.max(Math.abs(avg) * 0.03, 1);
  const variance = values.reduce((sum, v) => sum + (v - avg) ** 2, 0) / (values.length - 1);
  return Math.sqrt(Math.max(variance, 0));
}

/**
 * Transparent baseline for the first production version:
 * weighted recent-window trend + recent volatility.
 * It is not presented as a trained ML model.
 */
export function forecastModalPrice(points: MandiPoint[], horizonDays = 7): ForecastPoint[] {
  const clean = points
    .filter((p) => Number.isFinite(p.modal_price) && p.modal_price > 0)
    .sort((a, b) => a.observation_date.localeCompare(b.observation_date));

  if (clean.length < 3) return [];

  const window = clean.slice(-14);
  const prices = window.map((p) => p.modal_price);
  const recent = prices.slice(-5);
  const baseline = mean(recent.length ? recent : prices);

  const first = prices[0];
  const last = prices[prices.length - 1];
  const slope = (last - first) / Math.max(prices.length - 1, 1);
  const volatility = std(prices, mean(prices));

  const lastDate = new Date(clean[clean.length - 1].observation_date + 'T00:00:00Z');
  const out: ForecastPoint[] = [];

  for (let i = 1; i <= horizonDays; i += 1) {
    const target = new Date(lastDate);
    target.setUTCDate(target.getUTCDate() + i);

    const trend = baseline + slope * i;
    const uncertainty = Math.max(volatility * (1 + i * 0.08), Math.abs(trend) * 0.02);

    out.push({
      target_date: target.toISOString().slice(0, 10),
      predicted_value: Math.max(0, Math.round(trend * 100) / 100),
      lower_bound_95: Math.max(0, Math.round((trend - 1.96 * uncertainty) * 100) / 100),
      upper_bound_95: Math.max(0, Math.round((trend + 1.96 * uncertainty) * 100) / 100),
    });
  }

  return out;
}

export function percentChange(current: number | null | undefined, previous: number | null | undefined): number | null {
  if (current == null || previous == null || previous === 0) return null;
  return Number((((current - previous) / previous) * 100).toFixed(2));
}
