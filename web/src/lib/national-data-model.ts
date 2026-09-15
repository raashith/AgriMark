/**
 * AgriMark Phase 10 National Agricultural Intelligence Data Model
 * Provides strict TypeScript types, metadata interfaces, data layer definitions, and quality rules.
 */

export type DataLayer = 
  | 'RAW' 
  | 'NORMALIZED' 
  | 'VALIDATED' 
  | 'CANONICAL' 
  | 'FEATURE' 
  | 'FORECAST' 
  | 'INTELLIGENCE';

export type ValidationStatus = 'RAW' | 'PENDING' | 'VALIDATED' | 'QUARANTINED';

export interface ProvenanceMetadata {
  source: string;
  source_url?: string;
  retrieved_at: string;
  published_at?: string;
  license: string;
  coverage_start: string;
  coverage_end: string;
  geography: string;
  unit: string;
  schema_version: string;
  quality_score: number;
  validation_status: ValidationStatus;
  data_layer: DataLayer;
  is_synthetic?: boolean;
}

export interface NationalCommodity {
  id: string;
  code: string;
  name: string;
  category: 'CEREALS' | 'PULSES' | 'OILSEEDS' | 'VEGETABLES' | 'FRUITS' | 'SPICES' | 'COMMERCIAL_CROPS' | 'FIBER';
  hsn_code?: string;
  standard_unit: string;
}

export interface NationalState {
  id: string;
  state_code: string;
  name: string;
  region: 'NORTH' | 'SOUTH' | 'EAST' | 'WEST' | 'CENTRAL' | 'NORTHEAST';
}

export interface NationalDistrict {
  id: string;
  state_code: string;
  district_code: string;
  name: string;
  agro_climatic_zone?: string;
}

export interface NationalMandi {
  id: string;
  district_code: string;
  mandi_code: string;
  name: string;
  latitude?: number;
  longitude?: number;
  is_enam_connected: boolean;
}

export interface CommodityBalance {
  id: string;
  commodity_code: string;
  state_code?: string;
  period_start: string;
  period_end: string;
  opening_stock_mt: number;
  estimated_production_mt: number;
  imports_mt: number;
  exports_mt: number;
  processing_mt: number;
  estimated_consumption_mt: number;
  losses_mt: number;
  closing_stock_mt: number;
  nature_breakdown: {
    opening_stock: 'OBSERVED' | 'ESTIMATED' | 'FORECAST';
    production: 'OBSERVED' | 'ESTIMATED' | 'FORECAST';
    imports: 'OBSERVED' | 'ESTIMATED' | 'FORECAST';
    exports: 'OBSERVED' | 'ESTIMATED' | 'FORECAST';
    processing: 'OBSERVED' | 'ESTIMATED' | 'FORECAST';
    consumption: 'OBSERVED' | 'ESTIMATED' | 'FORECAST';
    losses: 'OBSERVED' | 'ESTIMATED' | 'FORECAST';
  };
  provenance: ProvenanceMetadata;
}

export interface MarketPriceObservation {
  id: string;
  commodity_code: string;
  variant_code?: string;
  mandi_code?: string;
  district_code?: string;
  state_code?: string;
  price_signal_type: 'OBSERVED_MANDI' | 'FARMER_ASKING' | 'BUYER_OFFER' | 'FPO_ASKING' | 'AI_FORECAST';
  min_price: number;
  max_price: number;
  modal_price: number;
  arrival_quantity_mt: number;
  observed_at: string;
  provenance: ProvenanceMetadata;
}

export interface WeatherObservation {
  id: string;
  district_code: string;
  state_code: string;
  observation_date: string;
  temp_min_c?: number;
  temp_max_c?: number;
  temp_avg_c?: number;
  rainfall_mm?: number;
  relative_humidity_percent?: number;
  wind_speed_kmh?: number;
  soil_moisture_volumetric?: number;
  solar_radiation_mj_m2?: number;
  provenance: ProvenanceMetadata;
}

export interface ClimateIndex {
  id: string;
  district_code: string;
  state_code: string;
  period_start: string;
  period_end: string;
  rainfall_anomaly_mm?: number;
  temp_anomaly_c?: number;
  spi_3month?: number;
  drought_severity_index?: number;
  flood_risk_index?: number;
  heat_stress_index?: number;
  provenance: ProvenanceMetadata;
}

export interface ForecastRun {
  id: string;
  model_name: string;
  model_version: string;
  model_type: 'BASELINE_STATISTICAL' | 'TIME_SERIES' | 'ML' | 'HYBRID';
  commodity_code: string;
  state_code?: string;
  district_code?: string;
  training_period_start: string;
  training_period_end: string;
  feature_set: string[];
  validation_method: 'CHRONOLOGICAL_SPLIT' | 'ROLLING_WINDOW' | 'OUT_OF_TIME';
  executed_at: string;
  is_champion: boolean;
}

export interface ForecastPrediction {
  id: string;
  forecast_run_id: string;
  commodity_code: string;
  state_code?: string;
  district_code?: string;
  target_date: string;
  predicted_metric: 'PRICE' | 'YIELD' | 'PRODUCTION' | 'SUPPLY' | 'DEMAND';
  predicted_value: number;
  lower_bound_95: number;
  upper_bound_95: number;
  confidence_interval_width: number;
  forecast_horizon_days: number;
  provenance: ProvenanceMetadata;
}

export interface ModelMetrics {
  forecast_run_id: string;
  mae: number;
  rmse: number;
  mape?: number;
  smape?: number;
  bias: number;
  interval_coverage_95: number;
  sample_size: number;
  evaluated_at: string;
}

export interface FoodSecurityIndicators {
  id: string;
  state_code: string;
  district_code?: string;
  assessment_date: string;
  production_shortfall_risk: number;
  market_availability_index: number;
  price_volatility_score: number;
  storage_adequacy_ratio: number;
  supply_concentration_index: number;
  import_dependence_ratio: number;
  export_pressure_index: number;
  crop_failure_risk: number;
  composite_security_score: number;
  risk_category: 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE';
  component_breakdown: Record<string, number>;
  provenance: ProvenanceMetadata;
}

export interface PolicyDocument {
  id: string;
  document_title: string;
  policy_category: string;
  jurisdiction: 'NATIONAL' | 'STATE';
  state_code?: string;
  issuing_authority: string;
  effective_from: string;
  effective_to?: string;
  official_url?: string;
  document_summary: string;
  provenance: ProvenanceMetadata;
}

export interface GovernmentScheme {
  id: string;
  policy_document_id?: string;
  scheme_code: string;
  scheme_name: string;
  description: string;
  jurisdiction: 'NATIONAL' | 'STATE';
  state_code?: string;
  eligibility_criteria: {
    max_land_hectares?: number;
    min_land_hectares?: number;
    farmer_types?: string[];
    eligible_crops?: string[];
    eligible_states?: string[];
    income_limit_inr?: number;
  };
  benefit_structure: {
    cash_transfer_inr?: number;
    subsidy_percent?: number;
    insurance_coverage?: boolean;
    loan_interest_subvention_percent?: number;
  };
  application_window_start?: string;
  application_window_end?: string;
  required_documents: string[];
  official_portal_url?: string;
  effective_from: string;
  effective_to?: string;
  provenance: ProvenanceMetadata;
}

export interface DataQualityReport {
  id: string;
  dataset_name: string;
  table_name: string;
  evaluated_at: string;
  completeness_score: number;
  freshness_score: number;
  consistency_score: number;
  duplicate_rate: number;
  source_reliability_score: number;
  geographic_coverage_score: number;
  temporal_coverage_score: number;
  overall_quality_score: number;
  quality_grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  issues: string[];
  is_accepted_for_canonical: boolean;
}
