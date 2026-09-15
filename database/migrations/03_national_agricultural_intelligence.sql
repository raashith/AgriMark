-- Migration 03: National Agricultural Intelligence Data Model
-- Phase 10: Canonical national data structures with strict provenance, lineage, data quality, and security

CREATE TABLE IF NOT EXISTS national_data_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_code VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    organization VARCHAR(255) NOT NULL,
    source_type VARCHAR(50) NOT NULL CHECK (source_type IN ('GOVERNMENT', 'SATELLITE', 'MANDI_API', 'WEATHER_STATION', 'SURVEY', 'MODEL', 'FPO_AGGREGATOR')),
    base_url TEXT,
    license VARCHAR(100) DEFAULT 'OPEN_DATA_GOV_IN',
    reliability_score NUMERIC(3, 2) DEFAULT 0.90 CHECK (reliability_score >= 0 AND reliability_score <= 1),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS national_commodities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('CEREALS', 'PULSES', 'OILSEEDS', 'VEGETABLES', 'FRUITS', 'SPICES', 'COMMERCIAL_CROPS', 'FIBER')),
    hsn_code VARCHAR(20),
    standard_unit VARCHAR(20) DEFAULT 'METRIC_TON',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS national_commodity_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    commodity_id UUID REFERENCES national_commodities(id) ON DELETE CASCADE,
    variant_code VARCHAR(50) NOT NULL UNIQUE,
    variant_name VARCHAR(100) NOT NULL,
    grade VARCHAR(50) DEFAULT 'STANDARD',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS national_states (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    state_code VARCHAR(10) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    region VARCHAR(50) NOT NULL CHECK (region IN ('NORTH', 'SOUTH', 'EAST', 'WEST', 'CENTRAL', 'NORTHEAST')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS national_districts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    state_code VARCHAR(10) REFERENCES national_states(state_code) ON DELETE CASCADE,
    district_code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    agro_climatic_zone VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS national_mandis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    district_code VARCHAR(20) REFERENCES national_districts(district_code) ON DELETE CASCADE,
    mandi_code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    latitude NUMERIC(10, 6),
    longitude NUMERIC(10, 6),
    is_enam_connected BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS national_seasons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    season_code VARCHAR(20) NOT NULL UNIQUE CHECK (season_code IN ('KHARIF', 'RABI', 'ZAID', 'ANNUAL')),
    name VARCHAR(50) NOT NULL,
    typical_start_month INT CHECK (typical_start_month BETWEEN 1 AND 12),
    typical_end_month INT CHECK (typical_end_month BETWEEN 1 AND 12)
);

CREATE TABLE IF NOT EXISTS national_crop_cycles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    commodity_code VARCHAR(50) REFERENCES national_commodities(code),
    state_code VARCHAR(10) REFERENCES national_states(state_code),
    season_code VARCHAR(20) REFERENCES national_seasons(season_code),
    sowing_start_window VARCHAR(50),
    harvest_start_window VARCHAR(50),
    duration_days INT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Common Provenance Columns Macro:
-- source, source_url, retrieved_at, published_at, license, coverage_start, coverage_end, geography, unit, schema_version, quality_score, validation_status, data_layer

CREATE TABLE IF NOT EXISTS national_production_statistics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    commodity_code VARCHAR(50) NOT NULL REFERENCES national_commodities(code),
    state_code VARCHAR(10) REFERENCES national_states(state_code),
    district_code VARCHAR(20) REFERENCES national_districts(district_code),
    season_code VARCHAR(20) REFERENCES national_seasons(season_code),
    crop_year VARCHAR(20) NOT NULL,
    production_mt NUMERIC(14, 2) NOT NULL CHECK (production_mt >= 0),
    statistical_nature VARCHAR(20) DEFAULT 'ESTIMATED' CHECK (statistical_nature IN ('OBSERVED', 'ESTIMATED', 'FORECAST')),
    -- Provenance
    source VARCHAR(100) NOT NULL,
    source_url TEXT,
    retrieved_at TIMESTAMPTZ DEFAULT NOW(),
    published_at TIMESTAMPTZ,
    license VARCHAR(100) DEFAULT 'OPEN_DATA_GOV_IN',
    coverage_start DATE,
    coverage_end DATE,
    geography VARCHAR(100) NOT NULL,
    unit VARCHAR(20) DEFAULT 'METRIC_TON',
    schema_version VARCHAR(20) DEFAULT 'v1.0',
    quality_score NUMERIC(3, 2) DEFAULT 0.95 CHECK (quality_score BETWEEN 0 AND 1),
    validation_status VARCHAR(20) DEFAULT 'VALIDATED' CHECK (validation_status IN ('RAW', 'PENDING', 'VALIDATED', 'QUARANTINED')),
    data_layer VARCHAR(20) DEFAULT 'CANONICAL' CHECK (data_layer IN ('RAW', 'NORMALIZED', 'VALIDATED', 'CANONICAL', 'FEATURE', 'FORECAST', 'INTELLIGENCE')),
    is_synthetic BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS national_yield_statistics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    commodity_code VARCHAR(50) NOT NULL REFERENCES national_commodities(code),
    state_code VARCHAR(10) REFERENCES national_states(state_code),
    district_code VARCHAR(20) REFERENCES national_districts(district_code),
    crop_year VARCHAR(20) NOT NULL,
    yield_kg_per_hectare NUMERIC(10, 2) NOT NULL CHECK (yield_kg_per_hectare >= 0),
    source VARCHAR(100) NOT NULL,
    source_url TEXT,
    retrieved_at TIMESTAMPTZ DEFAULT NOW(),
    published_at TIMESTAMPTZ,
    license VARCHAR(100) DEFAULT 'OPEN_DATA_GOV_IN',
    coverage_start DATE,
    coverage_end DATE,
    geography VARCHAR(100) NOT NULL,
    unit VARCHAR(20) DEFAULT 'KG_PER_HECTARE',
    schema_version VARCHAR(20) DEFAULT 'v1.0',
    quality_score NUMERIC(3, 2) DEFAULT 0.95,
    validation_status VARCHAR(20) DEFAULT 'VALIDATED',
    data_layer VARCHAR(20) DEFAULT 'CANONICAL',
    is_synthetic BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS national_acreage_statistics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    commodity_code VARCHAR(50) NOT NULL REFERENCES national_commodities(code),
    state_code VARCHAR(10) REFERENCES national_states(state_code),
    district_code VARCHAR(20) REFERENCES national_districts(district_code),
    crop_year VARCHAR(20) NOT NULL,
    acreage_hectares NUMERIC(14, 2) NOT NULL CHECK (acreage_hectares >= 0),
    source VARCHAR(100) NOT NULL,
    source_url TEXT,
    retrieved_at TIMESTAMPTZ DEFAULT NOW(),
    published_at TIMESTAMPTZ,
    license VARCHAR(100) DEFAULT 'OPEN_DATA_GOV_IN',
    coverage_start DATE,
    coverage_end DATE,
    geography VARCHAR(100) NOT NULL,
    unit VARCHAR(20) DEFAULT 'HECTARE',
    schema_version VARCHAR(20) DEFAULT 'v1.0',
    quality_score NUMERIC(3, 2) DEFAULT 0.95,
    validation_status VARCHAR(20) DEFAULT 'VALIDATED',
    data_layer VARCHAR(20) DEFAULT 'CANONICAL',
    is_synthetic BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS national_market_price_observations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    commodity_code VARCHAR(50) NOT NULL REFERENCES national_commodities(code),
    variant_code VARCHAR(50),
    mandi_code VARCHAR(50) REFERENCES national_mandis(mandi_code),
    district_code VARCHAR(20) REFERENCES national_districts(district_code),
    state_code VARCHAR(10) REFERENCES national_states(state_code),
    price_signal_type VARCHAR(30) NOT NULL CHECK (price_signal_type IN ('OBSERVED_MANDI', 'FARMER_ASKING', 'BUYER_OFFER', 'FPO_ASKING', 'AI_FORECAST')),
    min_price NUMERIC(10, 2) NOT NULL CHECK (min_price >= 0),
    max_price NUMERIC(10, 2) NOT NULL CHECK (max_price >= min_price),
    modal_price NUMERIC(10, 2) NOT NULL CHECK (modal_price BETWEEN min_price AND max_price),
    arrival_quantity_mt NUMERIC(10, 2) DEFAULT 0,
    observed_at TIMESTAMPTZ NOT NULL,
    source VARCHAR(100) NOT NULL,
    source_url TEXT,
    retrieved_at TIMESTAMPTZ DEFAULT NOW(),
    published_at TIMESTAMPTZ,
    license VARCHAR(100) DEFAULT 'AGMARKNET_OPEN',
    coverage_start DATE,
    coverage_end DATE,
    geography VARCHAR(100) NOT NULL,
    unit VARCHAR(20) DEFAULT 'INR_PER_QUINTAL',
    schema_version VARCHAR(20) DEFAULT 'v1.0',
    quality_score NUMERIC(3, 2) DEFAULT 0.95,
    validation_status VARCHAR(20) DEFAULT 'VALIDATED',
    data_layer VARCHAR(20) DEFAULT 'CANONICAL',
    is_synthetic BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS national_weather_observations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    district_code VARCHAR(20) REFERENCES national_districts(district_code),
    state_code VARCHAR(10) REFERENCES national_states(state_code),
    observation_date DATE NOT NULL,
    temp_min_c NUMERIC(5, 2),
    temp_max_c NUMERIC(5, 2),
    temp_avg_c NUMERIC(5, 2),
    rainfall_mm NUMERIC(7, 2) CHECK (rainfall_mm >= 0),
    relative_humidity_percent NUMERIC(5, 2),
    wind_speed_kmh NUMERIC(5, 2),
    soil_moisture_volumetric NUMERIC(5, 4),
    solar_radiation_mj_m2 NUMERIC(6, 2),
    source VARCHAR(100) NOT NULL,
    source_url TEXT,
    retrieved_at TIMESTAMPTZ DEFAULT NOW(),
    published_at TIMESTAMPTZ,
    license VARCHAR(100) DEFAULT 'IMD_OPEN',
    coverage_start DATE,
    coverage_end DATE,
    geography VARCHAR(100) NOT NULL,
    unit VARCHAR(20) DEFAULT 'METRIC',
    schema_version VARCHAR(20) DEFAULT 'v1.0',
    quality_score NUMERIC(3, 2) DEFAULT 0.95,
    validation_status VARCHAR(20) DEFAULT 'VALIDATED',
    data_layer VARCHAR(20) DEFAULT 'CANONICAL',
    is_synthetic BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS national_climate_indices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    district_code VARCHAR(20) REFERENCES national_districts(district_code),
    state_code VARCHAR(10) REFERENCES national_states(state_code),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    rainfall_anomaly_mm NUMERIC(7, 2),
    temp_anomaly_c NUMERIC(5, 2),
    spi_3month NUMERIC(4, 2), -- Standardized Precipitation Index
    drought_severity_index NUMERIC(3, 2) CHECK (drought_severity_index BETWEEN 0 AND 1),
    flood_risk_index NUMERIC(3, 2) CHECK (flood_risk_index BETWEEN 0 AND 1),
    heat_stress_index NUMERIC(3, 2) CHECK (heat_stress_index BETWEEN 0 AND 1),
    source VARCHAR(100) NOT NULL,
    source_url TEXT,
    retrieved_at TIMESTAMPTZ DEFAULT NOW(),
    published_at TIMESTAMPTZ,
    license VARCHAR(100) DEFAULT 'OPEN_GOV',
    coverage_start DATE,
    coverage_end DATE,
    geography VARCHAR(100) NOT NULL,
    unit VARCHAR(20) DEFAULT 'INDEX_SCORE',
    schema_version VARCHAR(20) DEFAULT 'v1.0',
    quality_score NUMERIC(3, 2) DEFAULT 0.95,
    validation_status VARCHAR(20) DEFAULT 'VALIDATED',
    data_layer VARCHAR(20) DEFAULT 'INTELLIGENCE',
    is_synthetic BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS national_demand_observations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    commodity_code VARCHAR(50) NOT NULL REFERENCES national_commodities(code),
    state_code VARCHAR(10) REFERENCES national_states(state_code),
    district_code VARCHAR(20) REFERENCES national_districts(district_code),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    estimated_demand_mt NUMERIC(14, 2) NOT NULL CHECK (estimated_demand_mt >= 0),
    demand_trend VARCHAR(20) DEFAULT 'STABLE' CHECK (demand_trend IN ('RISING', 'STABLE', 'FALLING', 'VOLATILE')),
    confidence_score NUMERIC(3, 2) DEFAULT 0.85 CHECK (confidence_score BETWEEN 0 AND 1),
    forecast_horizon_days INT DEFAULT 30,
    evidence_sources JSONB DEFAULT '[]'::jsonb,
    source VARCHAR(100) NOT NULL,
    source_url TEXT,
    retrieved_at TIMESTAMPTZ DEFAULT NOW(),
    published_at TIMESTAMPTZ,
    license VARCHAR(100) DEFAULT 'PROPRIETARY_AGRIMARK',
    coverage_start DATE,
    coverage_end DATE,
    geography VARCHAR(100) NOT NULL,
    unit VARCHAR(20) DEFAULT 'METRIC_TON',
    schema_version VARCHAR(20) DEFAULT 'v1.0',
    quality_score NUMERIC(3, 2) DEFAULT 0.90,
    validation_status VARCHAR(20) DEFAULT 'VALIDATED',
    data_layer VARCHAR(20) DEFAULT 'INTELLIGENCE',
    is_synthetic BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS national_supply_observations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    commodity_code VARCHAR(50) NOT NULL REFERENCES national_commodities(code),
    state_code VARCHAR(10) REFERENCES national_states(state_code),
    district_code VARCHAR(20) REFERENCES national_districts(district_code),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    estimated_supply_mt NUMERIC(14, 2) NOT NULL CHECK (estimated_supply_mt >= 0),
    confidence_score NUMERIC(3, 2) DEFAULT 0.85 CHECK (confidence_score BETWEEN 0 AND 1),
    coverage_percent NUMERIC(5, 2) DEFAULT 95.0,
    evidence_sources JSONB DEFAULT '[]'::jsonb,
    source VARCHAR(100) NOT NULL,
    source_url TEXT,
    retrieved_at TIMESTAMPTZ DEFAULT NOW(),
    published_at TIMESTAMPTZ,
    license VARCHAR(100) DEFAULT 'PROPRIETARY_AGRIMARK',
    coverage_start DATE,
    coverage_end DATE,
    geography VARCHAR(100) NOT NULL,
    unit VARCHAR(20) DEFAULT 'METRIC_TON',
    schema_version VARCHAR(20) DEFAULT 'v1.0',
    quality_score NUMERIC(3, 2) DEFAULT 0.90,
    validation_status VARCHAR(20) DEFAULT 'VALIDATED',
    data_layer VARCHAR(20) DEFAULT 'INTELLIGENCE',
    is_synthetic BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS national_trade_observations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    commodity_code VARCHAR(50) NOT NULL REFERENCES national_commodities(code),
    trade_type VARCHAR(20) NOT NULL CHECK (trade_type IN ('INTER_STATE', 'INTRA_STATE', 'IMPORT', 'EXPORT')),
    origin_geography VARCHAR(100) NOT NULL,
    destination_geography VARCHAR(100) NOT NULL,
    volume_mt NUMERIC(14, 2) NOT NULL CHECK (volume_mt >= 0),
    value_inr NUMERIC(16, 2) CHECK (value_inr >= 0),
    trade_date DATE NOT NULL,
    source VARCHAR(100) NOT NULL,
    source_url TEXT,
    retrieved_at TIMESTAMPTZ DEFAULT NOW(),
    published_at TIMESTAMPTZ,
    license VARCHAR(100) DEFAULT 'COMMERCE_GOV_IN',
    coverage_start DATE,
    coverage_end DATE,
    geography VARCHAR(100) NOT NULL,
    unit VARCHAR(20) DEFAULT 'METRIC_TON',
    schema_version VARCHAR(20) DEFAULT 'v1.0',
    quality_score NUMERIC(3, 2) DEFAULT 0.90,
    validation_status VARCHAR(20) DEFAULT 'VALIDATED',
    data_layer VARCHAR(20) DEFAULT 'CANONICAL',
    is_synthetic BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS national_storage_capacity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    state_code VARCHAR(10) REFERENCES national_states(state_code),
    district_code VARCHAR(20) REFERENCES national_districts(district_code),
    storage_type VARCHAR(50) NOT NULL CHECK (storage_type IN ('DRY_WAREHOUSE', 'COLD_STORAGE', 'SILO', 'PADDY_CAP_STORAGE')),
    facility_count INT DEFAULT 1,
    total_capacity_mt NUMERIC(14, 2) NOT NULL CHECK (total_capacity_mt >= 0),
    utilized_capacity_mt NUMERIC(14, 2) DEFAULT 0 CHECK (utilized_capacity_mt <= total_capacity_mt),
    available_capacity_mt NUMERIC(14, 2) GENERATED ALWAYS AS (total_capacity_mt - utilized_capacity_mt) STORED,
    source VARCHAR(100) NOT NULL,
    source_url TEXT,
    retrieved_at TIMESTAMPTZ DEFAULT NOW(),
    published_at TIMESTAMPTZ,
    license VARCHAR(100) DEFAULT 'WDRA_OPEN',
    coverage_start DATE,
    coverage_end DATE,
    geography VARCHAR(100) NOT NULL,
    unit VARCHAR(20) DEFAULT 'METRIC_TON',
    schema_version VARCHAR(20) DEFAULT 'v1.0',
    quality_score NUMERIC(3, 2) DEFAULT 0.95,
    validation_status VARCHAR(20) DEFAULT 'VALIDATED',
    data_layer VARCHAR(20) DEFAULT 'CANONICAL',
    is_synthetic BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS national_food_security_indicators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    state_code VARCHAR(10) REFERENCES national_states(state_code),
    district_code VARCHAR(20) REFERENCES national_districts(district_code),
    assessment_date DATE NOT NULL,
    production_shortfall_risk NUMERIC(3, 2) CHECK (production_shortfall_risk BETWEEN 0 AND 1),
    market_availability_index NUMERIC(3, 2) CHECK (market_availability_index BETWEEN 0 AND 1),
    price_volatility_score NUMERIC(3, 2) CHECK (price_volatility_score BETWEEN 0 AND 1),
    storage_adequacy_ratio NUMERIC(5, 2),
    supply_concentration_index NUMERIC(3, 2) CHECK (supply_concentration_index BETWEEN 0 AND 1),
    import_dependence_ratio NUMERIC(3, 2) CHECK (import_dependence_ratio BETWEEN 0 AND 1),
    export_pressure_index NUMERIC(3, 2) CHECK (export_pressure_index BETWEEN 0 AND 1),
    crop_failure_risk NUMERIC(3, 2) CHECK (crop_failure_risk BETWEEN 0 AND 1),
    composite_security_score NUMERIC(3, 2) CHECK (composite_security_score BETWEEN 0 AND 1),
    risk_category VARCHAR(20) CHECK (risk_category IN ('LOW', 'MODERATE', 'HIGH', 'SEVERE')),
    component_breakdown JSONB DEFAULT '{}'::jsonb,
    source VARCHAR(100) NOT NULL,
    source_url TEXT,
    retrieved_at TIMESTAMPTZ DEFAULT NOW(),
    published_at TIMESTAMPTZ,
    license VARCHAR(100) DEFAULT 'AGRIMARK_ANALYTICS',
    coverage_start DATE,
    coverage_end DATE,
    geography VARCHAR(100) NOT NULL,
    unit VARCHAR(20) DEFAULT 'INDEX_SCORE',
    schema_version VARCHAR(20) DEFAULT 'v1.0',
    quality_score NUMERIC(3, 2) DEFAULT 0.90,
    validation_status VARCHAR(20) DEFAULT 'VALIDATED',
    data_layer VARCHAR(20) DEFAULT 'INTELLIGENCE',
    is_synthetic BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS national_policy_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_title VARCHAR(255) NOT NULL,
    policy_category VARCHAR(100) NOT NULL,
    jurisdiction VARCHAR(20) NOT NULL CHECK (jurisdiction IN ('NATIONAL', 'STATE')),
    state_code VARCHAR(10) REFERENCES national_states(state_code),
    issuing_authority VARCHAR(255) NOT NULL,
    effective_from DATE NOT NULL,
    effective_to DATE,
    official_url TEXT,
    document_summary TEXT NOT NULL,
    source VARCHAR(100) NOT NULL,
    source_url TEXT,
    retrieved_at TIMESTAMPTZ DEFAULT NOW(),
    published_at TIMESTAMPTZ,
    license VARCHAR(100) DEFAULT 'OPEN_GOV',
    coverage_start DATE,
    coverage_end DATE,
    geography VARCHAR(100) NOT NULL,
    unit VARCHAR(20) DEFAULT 'DOCUMENT',
    schema_version VARCHAR(20) DEFAULT 'v1.0',
    quality_score NUMERIC(3, 2) DEFAULT 0.95,
    validation_status VARCHAR(20) DEFAULT 'VALIDATED',
    data_layer VARCHAR(20) DEFAULT 'CANONICAL',
    is_synthetic BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS national_government_schemes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    policy_document_id UUID REFERENCES national_policy_documents(id) ON DELETE SET NULL,
    scheme_code VARCHAR(50) NOT NULL UNIQUE,
    scheme_name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    jurisdiction VARCHAR(20) NOT NULL CHECK (jurisdiction IN ('NATIONAL', 'STATE')),
    state_code VARCHAR(10) REFERENCES national_states(state_code),
    eligibility_criteria JSONB NOT NULL, -- e.g. {"max_land_hectares": 2.0, "farmer_types": ["SMALL", "MARGINAL"]}
    benefit_structure JSONB NOT NULL,    -- e.g. {"cash_transfer_inr": 6000, "installments": 3}
    application_window_start DATE,
    application_window_end DATE,
    required_documents JSONB DEFAULT '[]'::jsonb,
    official_portal_url TEXT,
    effective_from DATE NOT NULL,
    effective_to DATE,
    source VARCHAR(100) NOT NULL,
    source_url TEXT,
    retrieved_at TIMESTAMPTZ DEFAULT NOW(),
    published_at TIMESTAMPTZ,
    license VARCHAR(100) DEFAULT 'OPEN_GOV',
    coverage_start DATE,
    coverage_end DATE,
    geography VARCHAR(100) NOT NULL,
    unit VARCHAR(20) DEFAULT 'SCHEME',
    schema_version VARCHAR(20) DEFAULT 'v1.0',
    quality_score NUMERIC(3, 2) DEFAULT 0.95,
    validation_status VARCHAR(20) DEFAULT 'VALIDATED',
    data_layer VARCHAR(20) DEFAULT 'CANONICAL',
    is_synthetic BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS national_forecast_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_name VARCHAR(100) NOT NULL,
    model_version VARCHAR(50) NOT NULL,
    model_type VARCHAR(50) NOT NULL CHECK (model_type IN ('BASELINE_STATISTICAL', 'TIME_SERIES', 'ML', 'HYBRID')),
    commodity_code VARCHAR(50) REFERENCES national_commodities(code),
    state_code VARCHAR(10) REFERENCES national_states(state_code),
    district_code VARCHAR(20) REFERENCES national_districts(district_code),
    training_period_start DATE NOT NULL,
    training_period_end DATE NOT NULL,
    feature_set JSONB NOT NULL,
    validation_method VARCHAR(50) NOT NULL CHECK (validation_method IN ('CHRONOLOGICAL_SPLIT', 'ROLLING_WINDOW', 'OUT_OF_TIME')),
    executed_at TIMESTAMPTZ DEFAULT NOW(),
    source VARCHAR(100) DEFAULT 'AGRIMARK_MLOPS',
    is_champion BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS national_forecast_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    forecast_run_id UUID NOT NULL REFERENCES national_forecast_runs(id) ON DELETE CASCADE,
    commodity_code VARCHAR(50) NOT NULL REFERENCES national_commodities(code),
    state_code VARCHAR(10) REFERENCES national_states(state_code),
    district_code VARCHAR(20) REFERENCES national_districts(district_code),
    target_date DATE NOT NULL,
    predicted_metric VARCHAR(50) NOT NULL CHECK (predicted_metric IN ('PRICE', 'YIELD', 'PRODUCTION', 'SUPPLY', 'DEMAND')),
    predicted_value NUMERIC(14, 2) NOT NULL,
    lower_bound_95 NUMERIC(14, 2),
    upper_bound_95 NUMERIC(14, 2),
    confidence_interval_width NUMERIC(14, 2) GENERATED ALWAYS AS (upper_bound_95 - lower_bound_95) STORED,
    forecast_horizon_days INT NOT NULL,
    source VARCHAR(100) NOT NULL DEFAULT 'AGRIMARK_MLOPS',
    source_url TEXT,
    retrieved_at TIMESTAMPTZ DEFAULT NOW(),
    published_at TIMESTAMPTZ DEFAULT NOW(),
    license VARCHAR(100) DEFAULT 'PROPRIETARY_AGRIMARK',
    coverage_start DATE,
    coverage_end DATE,
    geography VARCHAR(100) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    schema_version VARCHAR(20) DEFAULT 'v1.0',
    quality_score NUMERIC(3, 2) DEFAULT 0.90,
    validation_status VARCHAR(20) DEFAULT 'VALIDATED',
    data_layer VARCHAR(20) DEFAULT 'FORECAST',
    is_synthetic BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS national_model_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    forecast_run_id UUID NOT NULL REFERENCES national_forecast_runs(id) ON DELETE CASCADE,
    mae NUMERIC(10, 4) NOT NULL CHECK (mae >= 0),
    rmse NUMERIC(10, 4) NOT NULL CHECK (rmse >= 0),
    mape NUMERIC(7, 4) CHECK (mape >= 0),
    smape NUMERIC(7, 4) CHECK (smape >= 0),
    bias NUMERIC(10, 4) NOT NULL,
    interval_coverage_95 NUMERIC(5, 4) CHECK (interval_coverage_95 BETWEEN 0 AND 1),
    sample_size INT NOT NULL CHECK (sample_size > 0),
    evaluated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS national_data_quality_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dataset_name VARCHAR(100) NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    evaluated_at TIMESTAMPTZ DEFAULT NOW(),
    completeness_score NUMERIC(3, 2) CHECK (completeness_score BETWEEN 0 AND 1),
    freshness_score NUMERIC(3, 2) CHECK (freshness_score BETWEEN 0 AND 1),
    consistency_score NUMERIC(3, 2) CHECK (consistency_score BETWEEN 0 AND 1),
    duplicate_rate NUMERIC(5, 4) CHECK (duplicate_rate BETWEEN 0 AND 1),
    source_reliability_score NUMERIC(3, 2) CHECK (source_reliability_score BETWEEN 0 AND 1),
    geographic_coverage_score NUMERIC(3, 2) CHECK (geographic_coverage_score BETWEEN 0 AND 1),
    temporal_coverage_score NUMERIC(3, 2) CHECK (temporal_coverage_score BETWEEN 0 AND 1),
    overall_quality_score NUMERIC(3, 2) CHECK (overall_quality_score BETWEEN 0 AND 1),
    quality_grade VARCHAR(5) CHECK (quality_grade IN ('A+', 'A', 'B', 'C', 'D', 'F')),
    issues JSONB DEFAULT '[]'::jsonb,
    is_accepted_for_canonical BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS national_data_quarantine (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    target_table VARCHAR(100) NOT NULL,
    raw_payload JSONB NOT NULL,
    rejection_reason TEXT NOT NULL,
    data_layer VARCHAR(20) DEFAULT 'RAW',
    source VARCHAR(100) NOT NULL,
    quarantined_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS national_commodity_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    commodity_code VARCHAR(50) NOT NULL REFERENCES national_commodities(code),
    state_code VARCHAR(10) REFERENCES national_states(state_code),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    opening_stock_mt NUMERIC(14, 2) NOT NULL DEFAULT 0,
    estimated_production_mt NUMERIC(14, 2) NOT NULL DEFAULT 0,
    imports_mt NUMERIC(14, 2) NOT NULL DEFAULT 0,
    exports_mt NUMERIC(14, 2) NOT NULL DEFAULT 0,
    processing_mt NUMERIC(14, 2) NOT NULL DEFAULT 0,
    estimated_consumption_mt NUMERIC(14, 2) NOT NULL DEFAULT 0,
    losses_mt NUMERIC(14, 2) NOT NULL DEFAULT 0,
    closing_stock_mt NUMERIC(14, 2) GENERATED ALWAYS AS (
        opening_stock_mt + estimated_production_mt + imports_mt - exports_mt - processing_mt - estimated_consumption_mt - losses_mt
    ) STORED,
    nature_breakdown JSONB NOT NULL DEFAULT '{
        "opening_stock": "OBSERVED",
        "production": "ESTIMATED",
        "imports": "OBSERVED",
        "exports": "OBSERVED",
        "processing": "ESTIMATED",
        "consumption": "ESTIMATED",
        "losses": "ESTIMATED"
    }'::jsonb,
    source VARCHAR(100) NOT NULL,
    source_url TEXT,
    retrieved_at TIMESTAMPTZ DEFAULT NOW(),
    published_at TIMESTAMPTZ,
    license VARCHAR(100) DEFAULT 'AGRIMARK_INTELLIGENCE',
    coverage_start DATE,
    coverage_end DATE,
    geography VARCHAR(100) NOT NULL,
    unit VARCHAR(20) DEFAULT 'METRIC_TON',
    schema_version VARCHAR(20) DEFAULT 'v1.0',
    quality_score NUMERIC(3, 2) DEFAULT 0.90,
    validation_status VARCHAR(20) DEFAULT 'VALIDATED',
    data_layer VARCHAR(20) DEFAULT 'INTELLIGENCE',
    is_synthetic BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS national_data_lineage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id VARCHAR(100) NOT NULL,
    raw_record_id VARCHAR(100),
    normalized_record_id VARCHAR(100),
    validated_record_id VARCHAR(100),
    canonical_record_id VARCHAR(100),
    feature_record_id VARCHAR(100),
    forecast_record_id VARCHAR(100),
    intelligence_record_id VARCHAR(100),
    transformation_step VARCHAR(100) NOT NULL,
    transformed_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_nat_price_obs ON national_market_price_observations(commodity_code, state_code, district_code, observed_at);
CREATE INDEX IF NOT EXISTS idx_nat_price_signal ON national_market_price_observations(price_signal_type, commodity_code);
CREATE INDEX IF NOT EXISTS idx_nat_weather_obs ON national_weather_observations(district_code, observation_date);
CREATE INDEX IF NOT EXISTS idx_nat_climate_ind ON national_climate_indices(district_code, period_start);
CREATE INDEX IF NOT EXISTS idx_nat_forecast_pred ON national_forecast_predictions(commodity_code, target_date, predicted_metric);
CREATE INDEX IF NOT EXISTS idx_nat_balance_comm ON national_commodity_balances(commodity_code, period_start);

-- Row Level Security for National Data Tables
ALTER TABLE national_commodities ENABLE ROW LEVEL SECURITY;
ALTER TABLE national_market_price_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE national_weather_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE national_commodity_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE national_food_security_indicators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read national commodities" ON national_commodities FOR SELECT USING (true);
CREATE POLICY "Public read national prices" ON national_market_price_observations FOR SELECT USING (true);
CREATE POLICY "Public read national weather" ON national_weather_observations FOR SELECT USING (true);
CREATE POLICY "Public read national balance" ON national_commodity_balances FOR SELECT USING (true);
CREATE POLICY "Public read national security indicators" ON national_food_security_indicators FOR SELECT USING (true);
