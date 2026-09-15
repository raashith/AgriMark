import { supabase as supabaseAdmin } from './supabase';

export type GeographicScale = 'field' | 'farm' | 'village' | 'block' | 'district' | 'state' | 'national';
export type TimeGranularity = 'daily' | 'weekly' | 'monthly' | 'seasonal' | 'annual';

export interface TimelineEntry {
  id: string;
  run_id: string;
  timestep_index: number;
  timestep_date: string;
  state_payload: Record<string, any>;
}

export class MultiScaleTimeSeriesEngine {
  static aggregateScale(dataPoints: Array<{ scale: GeographicScale; id: string; metricValue: number }>, targetScale: GeographicScale): {
    targetScale: GeographicScale;
    aggregatedTotal: number;
    unitsCount: number;
    deduplicatedCount: number;
  } {
    // Deduplicate by ID to prevent double counting
    const uniqueMap = new Map<string, number>();
    dataPoints.forEach((dp) => uniqueMap.set(dp.id, dp.metricValue));

    let total = 0;
    uniqueMap.forEach((val) => {
      total += val;
    });

    return {
      targetScale,
      aggregatedTotal: Math.round(total * 100) / 100,
      unitsCount: dataPoints.length,
      deduplicatedCount: uniqueMap.size,
    };
  }

  static generateTimeline(params: {
    run_id: string;
    startDate: string;
    durationDays: number;
    granularity: TimeGranularity;
  }): TimelineEntry[] {
    const entries: TimelineEntry[] = [];
    const baseDate = new Date(params.startDate);
    const stepDays = params.granularity === 'daily' ? 1 : params.granularity === 'weekly' ? 7 : 30;

    const totalSteps = Math.ceil(params.durationDays / stepDays);
    for (let i = 0; i < totalSteps; i++) {
      const stepDate = new Date(baseDate.getTime() + i * stepDays * 86400000);
      entries.push({
        id: `TL-${params.run_id}-${i}`,
        run_id: params.run_id,
        timestep_index: i,
        timestep_date: stepDate.toISOString().split('T')[0],
        state_payload: {
          crop_health: Math.min(100, 70 + i * 1.5),
          accumulated_gdd: i * 25,
          water_reserve_pct: Math.max(20, 100 - i * 2),
        },
      });
    }

    return entries;
  }
}
