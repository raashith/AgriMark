-- AgriMark Phase 16: Climate, Sustainability & Circular Agriculture OS Migration

-- 1. Climate Risk Engine & Farm Climate Profiles
CREATE TABLE IF NOT EXISTS climate_risk_assessments (
    id TEXT PRIMARY KEY,
    farm_id TEXT NOT NULL,
    field_id TEXT,
    risk_type TEXT NOT NULL, -- HEAT_WAVE, DROUGHT, FLOOD, EXCESS_RAINFALL, CYCLONE, FROST, SOIL_MOISTURE_STRESS, WATER_STRESS, CROP_FAILURE_RISK
    severity TEXT NOT NULL DEFAULT 'MEDIUM', -- LOW, MEDIUM, HIGH, CRITICAL
    probability NUMERIC NOT NULL DEFAULT 0.5,
    time_window_start TIMESTAMPTZ NOT NULL,
    time_window_end TIMESTAMPTZ NOT NULL,
    affected_area_ha NUMERIC NOT NULL DEFAULT 1.0,
    confidence NUMERIC NOT NULL DEFAULT 0.85,
    evidence JSONB NOT NULL DEFAULT '[]'::jsonb,
    recommended_actions JSONB NOT NULL DEFAULT '[]'::jsonb,
    data_origin TEXT NOT NULL DEFAULT 'agrimark_climate_engine',
    assessed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS farm_climate_profiles (
    id TEXT PRIMARY KEY,
    farm_id TEXT NOT NULL UNIQUE,
    historical_rainfall_mm NUMERIC NOT NULL DEFAULT 750,
    avg_temperature_celsius NUMERIC NOT NULL DEFAULT 28.5,
    heat_exposure_score NUMERIC NOT NULL DEFAULT 45,
    drought_exposure_score NUMERIC NOT NULL DEFAULT 40,
    flood_exposure_score NUMERIC NOT NULL DEFAULT 20,
    water_availability_index NUMERIC NOT NULL DEFAULT 65,
    soil_baseline JSONB NOT NULL DEFAULT '{}'::jsonb,
    crop_history JSONB NOT NULL DEFAULT '[]'::jsonb,
    risk_profile JSONB NOT NULL DEFAULT '{}'::jsonb,
    trend TEXT NOT NULL DEFAULT 'STABLE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Water Intelligence & Optimization
CREATE TABLE IF NOT EXISTS water_observations (
    id TEXT PRIMARY KEY,
    field_id TEXT NOT NULL,
    captured_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    measurement_type TEXT NOT NULL, -- soil_moisture, rainfall, irrigation_volume
    value NUMERIC NOT NULL,
    unit TEXT NOT NULL,
    data_origin TEXT NOT NULL DEFAULT 'direct_sensor'
);

CREATE TABLE IF NOT EXISTS water_use_records (
    id TEXT PRIMARY KEY,
    farm_id TEXT NOT NULL,
    field_id TEXT NOT NULL,
    measurement_period TEXT NOT NULL,
    estimated_water_use_liters NUMERIC NOT NULL DEFAULT 0,
    water_efficiency_score NUMERIC NOT NULL DEFAULT 75,
    irrigation_efficiency_pct NUMERIC NOT NULL DEFAULT 82.5,
    water_stress_index NUMERIC NOT NULL DEFAULT 0.35,
    potential_savings_liters NUMERIC NOT NULL DEFAULT 0,
    calculation_method TEXT NOT NULL DEFAULT 'FAO_56_Penman_Monteith',
    data_origin TEXT NOT NULL DEFAULT 'measured_telemetry',
    calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS irrigation_recommendations (
    id TEXT PRIMARY KEY,
    field_id TEXT NOT NULL,
    recommended_timing TIMESTAMPTZ NOT NULL,
    recommended_quantity_liters NUMERIC NOT NULL DEFAULT 0,
    recommended_frequency_hours INTEGER NOT NULL DEFAULT 24,
    soil_evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
    weather_evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
    crop_requirement JSONB NOT NULL DEFAULT '{}'::jsonb,
    confidence NUMERIC NOT NULL DEFAULT 0.90,
    max_limit_liters NUMERIC NOT NULL DEFAULT 15000,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Soil Health Intelligence
CREATE TABLE IF NOT EXISTS soil_tests (
    id TEXT PRIMARY KEY,
    farm_id TEXT NOT NULL,
    field_id TEXT NOT NULL,
    sample_date TIMESTAMPTZ NOT NULL,
    organic_carbon_pct NUMERIC NOT NULL,
    ph NUMERIC NOT NULL,
    nitrogen_ppm NUMERIC NOT NULL,
    phosphorus_ppm NUMERIC NOT NULL,
    potassium_ppm NUMERIC NOT NULL,
    moisture_pct NUMERIC NOT NULL,
    salinity_ec NUMERIC,
    lab_name TEXT NOT NULL,
    lab_certificate TEXT,
    data_origin TEXT NOT NULL DEFAULT 'accredited_soil_lab',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS soil_health_metrics (
    id TEXT PRIMARY KEY,
    field_id TEXT NOT NULL,
    soil_quality_score NUMERIC NOT NULL DEFAULT 80,
    trend TEXT NOT NULL DEFAULT 'IMPROVING',
    indicators JSONB NOT NULL DEFAULT '{}'::jsonb,
    recommended_actions JSONB NOT NULL DEFAULT '[]'::jsonb,
    evaluated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Farm Input Efficiency
CREATE TABLE IF NOT EXISTS farm_input_efficiency (
    id TEXT PRIMARY KEY,
    farm_id TEXT NOT NULL,
    crop_id TEXT NOT NULL,
    period TEXT NOT NULL,
    fertilizer_kg_per_ha NUMERIC NOT NULL DEFAULT 0,
    seed_kg_per_ha NUMERIC NOT NULL DEFAULT 0,
    pesticide_l_per_ha NUMERIC NOT NULL DEFAULT 0,
    water_l_per_kg_yield NUMERIC NOT NULL DEFAULT 0,
    energy_kwh_per_ha NUMERIC NOT NULL DEFAULT 0,
    efficiency_tier TEXT NOT NULL DEFAULT 'HIGH_EFFICIENCY',
    cost_contribution_inr NUMERIC NOT NULL DEFAULT 0,
    data_type TEXT NOT NULL DEFAULT 'MEASURED', -- MEASURED, REPORTED, ESTIMATED
    calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Regenerative Agriculture Practices
CREATE TABLE IF NOT EXISTS regenerative_practices (
    id TEXT PRIMARY KEY,
    farm_id TEXT NOT NULL,
    practice_type TEXT NOT NULL, -- COVER_CROPS, CROP_ROTATION, REDUCED_TILLAGE, ORGANIC_AMENDMENTS, MULCHING, INTERCROPPING, AGROFORESTRY, SOIL_RESTORATION
    start_date TIMESTAMPTZ NOT NULL,
    area_ha NUMERIC NOT NULL DEFAULT 1.0,
    evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    verified_by TEXT,
    logged_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Emissions & Carbon Profile Foundation
CREATE TABLE IF NOT EXISTS emission_activity_records (
    id TEXT PRIMARY KEY,
    farm_id TEXT NOT NULL,
    activity_type TEXT NOT NULL, -- DIESEL_FUEL, ELECTRICITY, SYNTHETIC_FERTILIZER, IRRIGATION_PUMPING, TRANSPORT, COLD_STORAGE, PROCESSING
    activity_amount NUMERIC NOT NULL,
    unit TEXT NOT NULL,
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    source TEXT NOT NULL DEFAULT 'farm_log',
    data_origin TEXT NOT NULL DEFAULT 'measured_telemetry',
    logged_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS emission_factors (
    id TEXT PRIMARY KEY,
    activity_type TEXT NOT NULL UNIQUE,
    emission_factor_value NUMERIC NOT NULL, -- kg CO2e per unit
    unit TEXT NOT NULL,
    factor_source TEXT NOT NULL DEFAULT 'IPCC_2019_Refinement',
    factor_version TEXT NOT NULL DEFAULT 'v2026.1',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS farm_emission_profiles (
    id TEXT PRIMARY KEY,
    farm_id TEXT NOT NULL UNIQUE,
    total_co2e_kg NUMERIC NOT NULL DEFAULT 0,
    intensity_per_kg_yield NUMERIC NOT NULL DEFAULT 0,
    major_sources JSONB NOT NULL DEFAULT '[]'::jsonb,
    uncertainty_pct NUMERIC NOT NULL DEFAULT 12.5,
    calculation_method TEXT NOT NULL DEFAULT 'IPCC_Tier_2',
    methodology_version TEXT NOT NULL DEFAULT 'v2026.1',
    calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Circular Agriculture & Secondary Materials Marketplace
CREATE TABLE IF NOT EXISTS waste_materials (
    id TEXT PRIMARY KEY,
    seller_id TEXT NOT NULL,
    waste_type TEXT NOT NULL, -- CROP_RESIDUE, FOOD_WASTE, PACKAGING, ORGANIC_WASTE, MANURE, PROCESSING_BYPRODUCT
    source_description TEXT NOT NULL,
    quantity_kg NUMERIC NOT NULL DEFAULT 0,
    quality_grade TEXT NOT NULL DEFAULT 'GRADE_A',
    location TEXT NOT NULL,
    rate_per_kg NUMERIC NOT NULL DEFAULT 0,
    intended_use TEXT NOT NULL, -- COMPOST, BIO_INPUTS, ANIMAL_FEED, BIOENERGY, RECYCLING, SOIL_AMENDMENT
    status TEXT NOT NULL DEFAULT 'AVAILABLE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS circular_matches (
    id TEXT PRIMARY KEY,
    waste_id TEXT NOT NULL REFERENCES waste_materials(id) ON DELETE CASCADE,
    buyer_id TEXT NOT NULL,
    processor_id TEXT,
    match_score NUMERIC NOT NULL DEFAULT 90,
    status TEXT NOT NULL DEFAULT 'MATCHED',
    matched_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS circular_transactions (
    id TEXT PRIMARY KEY,
    match_id TEXT NOT NULL REFERENCES circular_matches(id) ON DELETE CASCADE,
    seller_id TEXT NOT NULL,
    buyer_id TEXT NOT NULL,
    quantity_kg NUMERIC NOT NULL,
    total_value_inr NUMERIC NOT NULL,
    transport_cost_inr NUMERIC NOT NULL DEFAULT 0,
    net_value_inr NUMERIC NOT NULL,
    value_type TEXT NOT NULL DEFAULT 'OBSERVED', -- OBSERVED, ESTIMATED, FORECAST
    settled_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Sustainability Metrics & Lineage
CREATE TABLE IF NOT EXISTS sustainability_metrics (
    id TEXT PRIMARY KEY,
    farm_id TEXT NOT NULL,
    water_efficiency NUMERIC NOT NULL DEFAULT 85.0,
    energy_efficiency NUMERIC NOT NULL DEFAULT 82.0,
    input_efficiency NUMERIC NOT NULL DEFAULT 88.0,
    waste_diversion_pct NUMERIC NOT NULL DEFAULT 74.0,
    soil_health_index NUMERIC NOT NULL DEFAULT 80.0,
    emissions_intensity NUMERIC NOT NULL DEFAULT 0.42,
    overall_score NUMERIC NOT NULL DEFAULT 81.5,
    evaluated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Climate Response Workflows & Alerts
CREATE TABLE IF NOT EXISTS climate_alerts (
    id TEXT PRIMARY KEY,
    region TEXT NOT NULL,
    hazard_type TEXT NOT NULL,
    alert_level TEXT NOT NULL DEFAULT 'WATCH', -- INFO, WATCH, WARNING, SEVERE, CRITICAL
    time_window_start TIMESTAMPTZ NOT NULL,
    time_window_end TIMESTAMPTZ NOT NULL,
    confidence NUMERIC NOT NULL DEFAULT 0.90,
    evidence JSONB NOT NULL DEFAULT '[]'::jsonb,
    recommended_actions JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS climate_actions (
    id TEXT PRIMARY KEY,
    alert_id TEXT NOT NULL REFERENCES climate_alerts(id) ON DELETE CASCADE,
    farmer_id TEXT NOT NULL,
    action_taken TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'COMPLETED',
    result TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS climate_outcomes (
    id TEXT PRIMARY KEY,
    farm_id TEXT NOT NULL,
    environmental_result JSONB NOT NULL DEFAULT '{}'::jsonb,
    economic_result_inr NUMERIC NOT NULL DEFAULT 0,
    confidence NUMERIC NOT NULL DEFAULT 0.90,
    evidence_window TEXT NOT NULL DEFAULT '30_DAYS',
    data_origin TEXT NOT NULL DEFAULT 'agrimark_measured',
    measured_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexing for performance
CREATE INDEX IF NOT EXISTS idx_climate_risk_farm ON climate_risk_assessments(farm_id);
CREATE INDEX IF NOT EXISTS idx_climate_profile_farm ON farm_climate_profiles(farm_id);
CREATE INDEX IF NOT EXISTS idx_water_use_farm ON water_use_records(farm_id);
CREATE INDEX IF NOT EXISTS idx_soil_tests_farm ON soil_tests(farm_id);
CREATE INDEX IF NOT EXISTS idx_input_eff_farm ON farm_input_efficiency(farm_id);
CREATE INDEX IF NOT EXISTS idx_emissions_farm ON farm_emission_profiles(farm_id);
CREATE INDEX IF NOT EXISTS idx_waste_type ON waste_materials(waste_type);
CREATE INDEX IF NOT EXISTS idx_climate_alerts_region ON climate_alerts(region);

-- Row Level Security (RLS)
ALTER TABLE climate_risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_climate_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE water_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE water_use_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE irrigation_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE soil_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE soil_health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_input_efficiency ENABLE ROW LEVEL SECURITY;
ALTER TABLE regenerative_practices ENABLE ROW LEVEL SECURITY;
ALTER TABLE emission_activity_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE emission_factors ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_emission_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE waste_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE circular_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE circular_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sustainability_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE climate_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE climate_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE climate_outcomes ENABLE ROW LEVEL SECURITY;

-- Allow authenticated access
CREATE POLICY rls_climate_risk_all ON climate_risk_assessments FOR ALL USING (true);
CREATE POLICY rls_climate_profile_all ON farm_climate_profiles FOR ALL USING (true);
CREATE POLICY rls_water_obs_all ON water_observations FOR ALL USING (true);
CREATE POLICY rls_water_use_all ON water_use_records FOR ALL USING (true);
CREATE POLICY rls_irrig_recs_all ON irrigation_recommendations FOR ALL USING (true);
CREATE POLICY rls_soil_tests_all ON soil_tests FOR ALL USING (true);
CREATE POLICY rls_soil_health_all ON soil_health_metrics FOR ALL USING (true);
CREATE POLICY rls_input_eff_all ON farm_input_efficiency FOR ALL USING (true);
CREATE POLICY rls_regen_prac_all ON regenerative_practices FOR ALL USING (true);
CREATE POLICY rls_emiss_activity_all ON emission_activity_records FOR ALL USING (true);
CREATE POLICY rls_emiss_factors_all ON emission_factors FOR ALL USING (true);
CREATE POLICY rls_emiss_profiles_all ON farm_emission_profiles FOR ALL USING (true);
CREATE POLICY rls_waste_materials_all ON waste_materials FOR ALL USING (true);
CREATE POLICY rls_circular_matches_all ON circular_matches FOR ALL USING (true);
CREATE POLICY rls_circular_tx_all ON circular_transactions FOR ALL USING (true);
CREATE POLICY rls_sustainability_met_all ON sustainability_metrics FOR ALL USING (true);
CREATE POLICY rls_climate_alerts_all ON climate_alerts FOR ALL USING (true);
CREATE POLICY rls_climate_actions_all ON climate_actions FOR ALL USING (true);
CREATE POLICY rls_climate_outcomes_all ON climate_outcomes FOR ALL USING (true);
