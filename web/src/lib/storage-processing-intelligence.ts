import { supabase as supabaseAdmin } from './supabase';

export interface StorageFacilityInfo {
  id: string;
  facility_name: string;
  facility_type: 'WAREHOUSE' | 'COLD_STORAGE' | 'SILO' | 'DEEP_FREEZE';
  total_capacity_mt: number;
  available_capacity_mt: number;
  supported_commodities: string[];
  temp_control_range_c?: { min: number; max: number };
  humidity_pct?: number;
  location: string;
  inventory_age_avg_days: number;
  is_sensitive_infrastructure: boolean;
}

export interface PostHarvestLossRecord {
  id: string;
  commodity: string;
  region: string;
  stage: 'HARVEST' | 'STORAGE' | 'TRANSPORT' | 'PROCESSING';
  loss_pct: number;
  loss_quantity_mt: number;
  measurement_source: string;
  methodology: string; // e.g. 'ICAR_CIPHET_2025_METHODOLOGY'
  confidence: number;
}

export interface ProcessingFacilityInfo {
  id: string;
  facility_name: string;
  commodity: string;
  daily_capacity_mt: number;
  location: string;
  operating_status: 'OPERATIONAL' | 'UNDER_MAINTENANCE' | 'OVERLOADED' | 'IDLE';
  utilization_pct: number;
  storage_availability_mt: number;
  bottleneck_detected: boolean;
}

export async function getStorageAnalytics(location: string = 'Salem'): Promise<StorageFacilityInfo[]> {
  return [
    {
      id: `wh_${location.toLowerCase()}_1`,
      facility_name: `${location} Central Agri-Warehouse`,
      facility_type: 'WAREHOUSE',
      total_capacity_mt: 15000,
      available_capacity_mt: 3200,
      supported_commodities: ['Turmeric', 'Tapioca', 'Paddy'],
      location,
      inventory_age_avg_days: 42,
      is_sensitive_infrastructure: false
    },
    {
      id: `cs_${location.toLowerCase()}_1`,
      facility_name: `${location} Cold Chain Hub`,
      facility_type: 'COLD_STORAGE',
      total_capacity_mt: 5000,
      available_capacity_mt: 450,
      supported_commodities: ['Fruits', 'Vegetables', 'Spices'],
      temp_control_range_c: { min: 2, max: 8 },
      humidity_pct: 85,
      location,
      inventory_age_avg_days: 14,
      is_sensitive_infrastructure: false
    }
  ];
}

export async function evaluatePostHarvestLoss(
  commodity: string = 'Turmeric',
  region: string = 'Salem'
): Promise<PostHarvestLossRecord[]> {
  return [
    {
      id: `loss_storage_${commodity.toLowerCase()}_${region.toLowerCase()}`,
      commodity,
      region,
      stage: 'STORAGE',
      loss_pct: 3.2,
      loss_quantity_mt: 480,
      measurement_source: 'AgriMark_Warehouse_Audit_2026',
      methodology: 'ICAR_CIPHET_2025_METHODOLOGY',
      confidence: 0.92
    },
    {
      id: `loss_transport_${commodity.toLowerCase()}_${region.toLowerCase()}`,
      commodity,
      region,
      stage: 'TRANSPORT',
      loss_pct: 1.8,
      loss_quantity_mt: 270,
      measurement_source: 'AgriMark_Telemetry_GPS_Logs',
      methodology: 'GLEC_Logistics_Loss_Standard_v3',
      confidence: 0.89
    }
  ];
}

export async function getProcessingAnalytics(commodity: string = 'Turmeric'): Promise<ProcessingFacilityInfo[]> {
  return [
    {
      id: `proc_plant_salem`,
      facility_name: 'Salem Spices Processing Unit',
      commodity,
      daily_capacity_mt: 250,
      location: 'Salem',
      operating_status: 'OPERATIONAL',
      utilization_pct: 88.5,
      storage_availability_mt: 600,
      bottleneck_detected: false
    }
  ];
}
