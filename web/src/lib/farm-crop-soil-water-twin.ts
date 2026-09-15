import { supabase as supabaseAdmin } from './supabase';

export type CropStage =
  | 'PLANNED'
  | 'SOWN'
  | 'GERMINATING'
  | 'VEGETATIVE'
  | 'FLOWERING'
  | 'FRUITING'
  | 'MATURING'
  | 'HARVEST_READY'
  | 'HARVESTED';

export interface FarmTwinState {
  id: string;
  farm_id: string;
  state_timestamp: string;
  boundary?: Record<string, any>;
  crop_code: string;
  soil_type: string;
  farm_health_score: number;
  expected_production_min: number;
  expected_production_max: number;
  water_demand_liters: number;
  input_demand_kg: Record<string, number>;
  risk_exposure_score: number;
  uncertainty_margin: number;
  data_origin: string;
}

export interface CropTwinState {
  id: string;
  crop_id: string;
  field_id: string;
  stage: CropStage;
  gdd_accumulated: number;
  canopy_cover_pct: number;
  stress_index: number;
  transition_timestamp: string;
  data_origin: string;
}

export interface SoilTwinState {
  id: string;
  field_id: string;
  soil_type: string;
  ph: number;
  organic_carbon_pct: number;
  nitrogen_kg_ha: number;
  phosphorus_kg_ha: number;
  potassium_kg_ha: number;
  moisture_pct: number;
  salinity_ec: number;
  texture: string;
  sampling_date: string;
  measurement_quality: 'LAB_TESTED' | 'SENSOR_ESTIMATED' | 'MODELED' | 'UNVERIFIED';
  data_origin: string;
}

export interface WaterTwinState {
  id: string;
  district_code: string;
  available_capacity_mcm: number;
  forecast_inflow_mcm: number;
  demand_mcm: number;
  deficit_mcm: number;
  allocation_pct: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  state_timestamp: string;
}

export class FarmCropSoilWaterTwinEngine {
  static transitionCropStage(currentStage: CropStage, GDD: number): CropStage {
    const stageFlow: CropStage[] = [
      'PLANNED', 'SOWN', 'GERMINATING', 'VEGETATIVE',
      'FLOWERING', 'FRUITING', 'MATURING', 'HARVEST_READY', 'HARVESTED'
    ];
    const currentIndex = stageFlow.indexOf(currentStage);
    if (currentIndex === -1 || currentIndex === stageFlow.length - 1) return currentStage;

    if (GDD > (currentIndex + 1) * 200) {
      return stageFlow[currentIndex + 1];
    }
    return currentStage;
  }

  static calculateWaterBalance(params: {
    capacity_mcm: number;
    inflow_mcm: number;
    demand_mcm: number;
  }): WaterTwinState {
    const totalAvailable = params.capacity_mcm + params.inflow_mcm;
    const deficit = Math.max(0, params.demand_mcm - totalAvailable);
    const allocation_pct = params.demand_mcm > 0 ? Math.min(100, (totalAvailable / params.demand_mcm) * 100) : 100;

    let risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
    if (deficit > params.demand_mcm * 0.4) risk_level = 'CRITICAL';
    else if (deficit > params.demand_mcm * 0.2) risk_level = 'HIGH';
    else if (deficit > 0) risk_level = 'MEDIUM';

    return {
      id: `WTR-${Date.now()}`,
      district_code: 'TN-SLM',
      available_capacity_mcm: params.capacity_mcm,
      forecast_inflow_mcm: params.inflow_mcm,
      demand_mcm: params.demand_mcm,
      deficit_mcm: deficit,
      allocation_pct: Math.round(allocation_pct * 10) / 10,
      risk_level,
      state_timestamp: new Date().toISOString(),
    };
  }
}
