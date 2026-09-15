-- AgriMark Phase 17: National Food & Agricultural Supply Security OS Migration

-- 1. National Commodity Supply Balances
CREATE TABLE IF NOT EXISTS national_supply_balances (
    id TEXT PRIMARY KEY,
    commodity TEXT NOT NULL,
    state TEXT NOT NULL,
    district TEXT,
    period TEXT NOT NULL, -- e.g. 2026-Q3
    opening_stock_mt NUMERIC NOT NULL DEFAULT 0,
    production_mt NUMERIC NOT NULL DEFAULT 0,
    imports_mt NUMERIC NOT NULL DEFAULT 0,
    carry_in_mt NUMERIC NOT NULL DEFAULT 0,
    exports_mt NUMERIC NOT NULL DEFAULT 0,
    processing_mt NUMERIC NOT NULL DEFAULT 0,
    consumption_mt NUMERIC NOT NULL DEFAULT 0,
    losses_mt NUMERIC NOT NULL DEFAULT 0,
    closing_stock_mt NUMERIC NOT NULL DEFAULT 0,
    data_type TEXT NOT NULL DEFAULT 'ESTIMATED', -- OBSERVED, ESTIMATED, FORECAST
    uncertainty_pct NUMERIC NOT NULL DEFAULT 5.0,
    provenance JSONB NOT NULL DEFAULT '{}'::jsonb,
    calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Supply Shock Engine
CREATE TABLE IF NOT EXISTS supply_shock_events (
    id TEXT PRIMARY KEY,
    event_id TEXT NOT NULL UNIQUE,
    commodity TEXT NOT NULL,
    region TEXT NOT NULL,
    shock_type TEXT NOT NULL, -- PRODUCTION, WEATHER, DISEASE, LOGISTICS, STORAGE, TRADE, MARKET_CONCENTRATION, PRICE
    severity TEXT NOT NULL DEFAULT 'MEDIUM', -- LOW, MEDIUM, HIGH, CRITICAL
    detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    evidence JSONB NOT NULL DEFAULT '[]'::jsonb,
    confidence NUMERIC NOT NULL DEFAULT 0.90,
    affected_supply_mt NUMERIC NOT NULL DEFAULT 0,
    expected_duration_days INTEGER NOT NULL DEFAULT 30,
    status TEXT NOT NULL DEFAULT 'ACTIVE'
);

-- 3. National Shortage Early Warning & Alerts
CREATE TABLE IF NOT EXISTS shortage_alerts (
    id TEXT PRIMARY KEY,
    commodity TEXT NOT NULL,
    region TEXT NOT NULL,
    status_classification TEXT NOT NULL DEFAULT 'WATCH', -- NORMAL, WATCH, SHORTAGE_RISK, SHORTAGE, CRITICAL
    available_supply_mt NUMERIC NOT NULL DEFAULT 0,
    expected_demand_mt NUMERIC NOT NULL DEFAULT 0,
    buffer_inventory_mt NUMERIC NOT NULL DEFAULT 0,
    inbound_logistics_mt NUMERIC NOT NULL DEFAULT 0,
    single_price_spike_override BOOLEAN NOT NULL DEFAULT FALSE, -- Never infer shortage from single price spike alone
    confidence NUMERIC NOT NULL DEFAULT 0.88,
    evaluated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Regional Redistribution & Supply Gaps
CREATE TABLE IF NOT EXISTS regional_supply_gaps (
    id TEXT PRIMARY KEY,
    source_region TEXT NOT NULL,
    destination_region TEXT NOT NULL,
    commodity TEXT NOT NULL,
    surplus_quantity_mt NUMERIC NOT NULL DEFAULT 0,
    shortage_quantity_mt NUMERIC NOT NULL DEFAULT 0,
    recommended_transfer_mt NUMERIC NOT NULL DEFAULT 0,
    estimated_transport_vehicles INTEGER NOT NULL DEFAULT 0,
    storage_requirement_type TEXT NOT NULL DEFAULT 'DRY_WAREHOUSE',
    time_window_days INTEGER NOT NULL DEFAULT 14,
    confidence NUMERIC NOT NULL DEFAULT 0.91,
    status TEXT NOT NULL DEFAULT 'PROPOSED' -- PROPOSED, APPROVED, IN_TRANSIT, COMPLETED
);

-- 5. Storage Facilities & Inventory Intelligence
CREATE TABLE IF NOT EXISTS storage_facilities (
    id TEXT PRIMARY KEY,
    facility_name TEXT NOT NULL,
    facility_type TEXT NOT NULL, -- WAREHOUSE, COLD_STORAGE, SILO, DEEP_FREEZE
    total_capacity_mt NUMERIC NOT NULL,
    available_capacity_mt NUMERIC NOT NULL,
    supported_commodities JSONB NOT NULL DEFAULT '[]'::jsonb,
    temp_control_min_c NUMERIC,
    temp_control_max_c NUMERIC,
    humidity_pct NUMERIC,
    location TEXT NOT NULL,
    is_sensitive_infrastructure BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS storage_inventory (
    id TEXT PRIMARY KEY,
    facility_id TEXT NOT NULL REFERENCES storage_facilities(id) ON DELETE CASCADE,
    commodity TEXT NOT NULL,
    stored_quantity_mt NUMERIC NOT NULL,
    inventory_age_days INTEGER NOT NULL DEFAULT 0,
    storage_quality_grade TEXT NOT NULL DEFAULT 'GRADE_A',
    estimated_loss_rate_pct NUMERIC NOT NULL DEFAULT 0.5,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Processing Facilities & Capacity Intelligence
CREATE TABLE IF NOT EXISTS processing_facilities (
    id TEXT PRIMARY KEY,
    facility_name TEXT NOT NULL,
    commodity TEXT NOT NULL,
    daily_capacity_mt NUMERIC NOT NULL,
    location TEXT NOT NULL,
    operating_status TEXT NOT NULL DEFAULT 'OPERATIONAL', -- OPERATIONAL, UNDER_MAINTENANCE, OVERLOADED, IDLE
    utilization_pct NUMERIC NOT NULL DEFAULT 75.0,
    storage_availability_mt NUMERIC NOT NULL DEFAULT 500,
    seasonality_months JSONB NOT NULL DEFAULT '[]'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS processing_capacity (
    id TEXT PRIMARY KEY,
    facility_id TEXT NOT NULL REFERENCES processing_facilities(id) ON DELETE CASCADE,
    period TEXT NOT NULL,
    allocated_mt NUMERIC NOT NULL DEFAULT 0,
    bottleneck_flag BOOLEAN NOT NULL DEFAULT FALSE,
    bottleneck_reason TEXT,
    logged_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Post-Harvest Loss Intelligence
CREATE TABLE IF NOT EXISTS post_harvest_losses (
    id TEXT PRIMARY KEY,
    commodity TEXT NOT NULL,
    region TEXT NOT NULL,
    stage TEXT NOT NULL, -- HARVEST, STORAGE, TRANSPORT, PROCESSING
    loss_pct NUMERIC NOT NULL,
    loss_quantity_mt NUMERIC NOT NULL,
    measurement_source TEXT NOT NULL,
    methodology TEXT NOT NULL, -- e.g. ICAR_CIPHET_2025_METHODOLOGY
    confidence NUMERIC NOT NULL DEFAULT 0.89,
    logged_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Logistics Bottlenecks Engine
CREATE TABLE IF NOT EXISTS logistics_bottlenecks (
    id TEXT PRIMARY KEY,
    route_id TEXT NOT NULL,
    origin TEXT NOT NULL,
    destination TEXT NOT NULL,
    bottleneck_type TEXT NOT NULL, -- PICKUP, TRANSPORT, WAREHOUSE, COLD_CHAIN, LAST_MILE
    severity TEXT NOT NULL DEFAULT 'MEDIUM',
    evidence JSONB NOT NULL DEFAULT '[]'::jsonb,
    estimated_delay_hours INTEGER NOT NULL DEFAULT 12,
    detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Import Dependency & Export Pressure Metrics
CREATE TABLE IF NOT EXISTS trade_observations (
    id TEXT PRIMARY KEY,
    trade_type TEXT NOT NULL, -- IMPORT, EXPORT
    commodity TEXT NOT NULL,
    quantity_mt NUMERIC NOT NULL,
    value_inr NUMERIC NOT NULL,
    origin_country TEXT,
    destination_country TEXT,
    port_or_border TEXT NOT NULL,
    trade_date TIMESTAMPTZ NOT NULL,
    source TEXT NOT NULL DEFAULT 'COMMERCE_MINISTRY_FEED',
    data_origin TEXT NOT NULL DEFAULT 'OBSERVED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS import_dependency_metrics (
    id TEXT PRIMARY KEY,
    commodity TEXT NOT NULL UNIQUE,
    domestic_production_mt NUMERIC NOT NULL,
    imports_mt NUMERIC NOT NULL,
    domestic_demand_mt NUMERIC NOT NULL,
    import_dependency_ratio NUMERIC NOT NULL, -- imports / demand
    trend TEXT NOT NULL DEFAULT 'STABLE',
    period TEXT NOT NULL,
    confidence NUMERIC NOT NULL DEFAULT 0.92,
    evaluated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS export_pressure_metrics (
    id TEXT PRIMARY KEY,
    commodity TEXT NOT NULL UNIQUE,
    production_mt NUMERIC NOT NULL,
    domestic_demand_mt NUMERIC NOT NULL,
    export_volume_mt NUMERIC NOT NULL,
    stock_levels_mt NUMERIC NOT NULL,
    export_pressure_level TEXT NOT NULL DEFAULT 'MODERATE', -- LOW, MODERATE, HIGH, SEVERE
    domestic_availability_risk BOOLEAN NOT NULL DEFAULT FALSE,
    evaluated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Food Security Components & Early Warning
CREATE TABLE IF NOT EXISTS food_security_components (
    id TEXT PRIMARY KEY,
    region TEXT NOT NULL UNIQUE,
    availability_score NUMERIC NOT NULL DEFAULT 85.0,
    access_score NUMERIC NOT NULL DEFAULT 82.0,
    stability_score NUMERIC NOT NULL DEFAULT 80.0,
    affordability_score NUMERIC NOT NULL DEFAULT 78.0,
    storage_resilience_score NUMERIC NOT NULL DEFAULT 84.0,
    supply_concentration_score NUMERIC NOT NULL DEFAULT 70.0,
    climate_exposure_score NUMERIC NOT NULL DEFAULT 65.0,
    evaluated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS early_warning_events (
    id TEXT PRIMARY KEY,
    alert_level TEXT NOT NULL DEFAULT 'GREEN', -- GREEN, WATCH, WARNING, SEVERE, CRITICAL
    hazard_or_signal TEXT NOT NULL,
    region TEXT NOT NULL,
    reason TEXT NOT NULL,
    evidence JSONB NOT NULL DEFAULT '[]'::jsonb,
    confidence NUMERIC NOT NULL DEFAULT 0.90,
    time_horizon_days INTEGER NOT NULL DEFAULT 30,
    affected_geography TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. Non-Production Scenario Simulations
CREATE TABLE IF NOT EXISTS scenario_simulations (
    id TEXT PRIMARY KEY,
    scenario_type TEXT NOT NULL, -- PROD_DECLINE_10, PROD_DECLINE_25, MAJOR_FLOOD, MAJOR_DROUGHT, IMPORT_INTERRUPTION, EXPORT_SURGE, WAREHOUSE_OUTAGE, TRANSPORT_DISRUPTION, PROCESSING_CAPACITY_LOSS
    commodity TEXT NOT NULL,
    region TEXT NOT NULL,
    simulated_supply_gap_mt NUMERIC NOT NULL,
    price_pressure_index NUMERIC NOT NULL,
    inventory_depletion_days INTEGER NOT NULL,
    regional_effects JSONB NOT NULL DEFAULT '{}'::jsonb,
    data_origin TEXT NOT NULL DEFAULT 'SIMULATION', -- Explicit mandatory simulation marker
    simulated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. Resilience Recommendations & Critical Supply Nodes
CREATE TABLE IF NOT EXISTS resilience_recommendations (
    id TEXT PRIMARY KEY,
    region TEXT NOT NULL,
    action TEXT NOT NULL,
    expected_benefit TEXT NOT NULL,
    cost_assumptions_inr NUMERIC NOT NULL DEFAULT 0,
    risks JSONB NOT NULL DEFAULT '[]'::jsonb,
    confidence NUMERIC NOT NULL DEFAULT 0.88,
    evidence JSONB NOT NULL DEFAULT '[]'::jsonb,
    requires_human_approval BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS critical_supply_nodes (
    id TEXT PRIMARY KEY,
    node_name TEXT NOT NULL,
    node_type TEXT NOT NULL, -- WAREHOUSE, COLD_STORE, PROCESSING_PLANT, MANDI, TRANSPORT_HUB, LOGISTICS_CORRIDOR
    location_masked TEXT NOT NULL,
    capacity_throughput_mt NUMERIC NOT NULL,
    single_point_of_failure BOOLEAN NOT NULL DEFAULT FALSE,
    concentration_risk_level TEXT NOT NULL DEFAULT 'MEDIUM',
    is_sensitive BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_supply_balance_comm ON national_supply_balances(commodity, state);
CREATE INDEX IF NOT EXISTS idx_supply_shocks_comm ON supply_shock_events(commodity, region);
CREATE INDEX IF NOT EXISTS idx_shortage_alerts_reg ON shortage_alerts(region);
CREATE INDEX IF NOT EXISTS idx_storage_facilities_loc ON storage_facilities(location);
CREATE INDEX IF NOT EXISTS idx_trade_obs_comm ON trade_observations(commodity);
CREATE INDEX IF NOT EXISTS idx_early_warning_level ON early_warning_events(alert_level);

-- Row Level Security (RLS)
ALTER TABLE national_supply_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE supply_shock_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE shortage_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE regional_supply_gaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage_facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE processing_facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE processing_capacity ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_harvest_losses ENABLE ROW LEVEL SECURITY;
ALTER TABLE logistics_bottlenecks ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_dependency_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE export_pressure_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_security_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE early_warning_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenario_simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE resilience_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE critical_supply_nodes ENABLE ROW LEVEL SECURITY;

-- Allow authenticated access
CREATE POLICY rls_national_supply_balances_all ON national_supply_balances FOR ALL USING (true);
CREATE POLICY rls_supply_shock_events_all ON supply_shock_events FOR ALL USING (true);
CREATE POLICY rls_shortage_alerts_all ON shortage_alerts FOR ALL USING (true);
CREATE POLICY rls_regional_supply_gaps_all ON regional_supply_gaps FOR ALL USING (true);
CREATE POLICY rls_storage_facilities_all ON storage_facilities FOR ALL USING (true);
CREATE POLICY rls_storage_inventory_all ON storage_inventory FOR ALL USING (true);
CREATE POLICY rls_processing_facilities_all ON processing_facilities FOR ALL USING (true);
CREATE POLICY rls_processing_capacity_all ON processing_capacity FOR ALL USING (true);
CREATE POLICY rls_post_harvest_losses_all ON post_harvest_losses FOR ALL USING (true);
CREATE POLICY rls_logistics_bottlenecks_all ON logistics_bottlenecks FOR ALL USING (true);
CREATE POLICY rls_trade_observations_all ON trade_observations FOR ALL USING (true);
CREATE POLICY rls_import_dependency_metrics_all ON import_dependency_metrics FOR ALL USING (true);
CREATE POLICY rls_export_pressure_metrics_all ON export_pressure_metrics FOR ALL USING (true);
CREATE POLICY rls_food_security_components_all ON food_security_components FOR ALL USING (true);
CREATE POLICY rls_early_warning_events_all ON early_warning_events FOR ALL USING (true);
CREATE POLICY rls_scenario_simulations_all ON scenario_simulations FOR ALL USING (true);
CREATE POLICY rls_resilience_recommendations_all ON resilience_recommendations FOR ALL USING (true);
CREATE POLICY rls_critical_supply_nodes_all ON critical_supply_nodes FOR ALL USING (true);
