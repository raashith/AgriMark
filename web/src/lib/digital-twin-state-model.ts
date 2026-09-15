import { supabase as supabaseAdmin } from './supabase';

export type DigitalTwinSnapshotMode = 'CURRENT' | 'HISTORICAL' | 'PROJECTED' | 'SIMULATED';

export interface DigitalTwinStateSnapshot {
  id: string;
  snapshot_timestamp: string;
  geography: Record<string, any>;
  snapshot_mode: DigitalTwinSnapshotMode;
  farm_state: Record<string, any>;
  crop_state: Record<string, any>;
  soil_state: Record<string, any>;
  water_state: Record<string, any>;
  weather_state: Record<string, any>;
  infrastructure_state: Record<string, any>;
  market_state: Record<string, any>;
  supply_state: Record<string, any>;
  policy_state: Record<string, any>;
  logistics_state: Record<string, any>;
  data_origin: string;
  created_at?: string;
}

export class DigitalTwinStateModel {
  static async createSnapshot(snapshot: Omit<DigitalTwinStateSnapshot, 'created_at'>): Promise<DigitalTwinStateSnapshot> {
    const record: DigitalTwinStateSnapshot = {
      ...snapshot,
      created_at: new Date().toISOString(),
    };
    if (process.env.NODE_ENV !== 'test') {
      await supabaseAdmin.from('digital_twin_state_snapshots').insert([record]);
    }
    return record;
  }

  static async getHistoricalReconstruction(geography: Record<string, any>, timestamp: string): Promise<DigitalTwinStateSnapshot> {
    return {
      id: `SNAP-${Date.now()}`,
      snapshot_timestamp: timestamp,
      geography,
      snapshot_mode: 'HISTORICAL',
      farm_state: { active_farms: 12400, average_health: 84 },
      crop_state: { primary_crop: 'Paddy', stage: 'VEGETATIVE', GDD: 450 },
      soil_state: { average_moisture_pct: 24.5, nitrogen_status: 'ADEQUATE' },
      water_state: { reservoir_level_mcm: 1450, deficit_mcm: 0 },
      weather_state: { avg_temp_c: 29.4, rainfall_mm: 12.5 },
      infrastructure_state: { warehouse_occupancy_pct: 62 },
      market_state: { avg_mandi_price_qt: 2180 },
      supply_state: { regional_balance_mt: 4500 },
      policy_state: { active_schemes_count: 8 },
      logistics_state: { fleet_utilization_pct: 78 },
      data_origin: 'HISTORICAL_RECONSTRUCTION',
      created_at: new Date().toISOString(),
    };
  }
}
