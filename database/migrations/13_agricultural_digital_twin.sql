-- AgriMark Phase 20: National Agricultural Digital Twin & Simulation OS Migration

-- 1. Digital Twin Entities
CREATE TABLE IF NOT EXISTS digital_twin_entities (
    id TEXT PRIMARY KEY,
    entity_type TEXT NOT NULL CHECK (entity_type IN (
        'country', 'state', 'district', 'block', 'village', 'farm', 'field', 'crop', 'variety',
        'soil', 'water_source', 'irrigation_system', 'weather_station', 'climate_zone',
        'warehouse', 'cold_storage', 'processing_unit', 'market', 'mandi', 'fpo',
        'logistics_node', 'road', 'rail_node', 'port', 'input_supplier', 'machinery',
        'agricultural_device', 'farmer', 'policy', 'scheme', 'food_node'
    )),
    name TEXT NOT NULL,
    code TEXT,
    geography JSONB DEFAULT '{}'::jsonb,
    properties JSONB DEFAULT '{}'::jsonb,
    data_origin TEXT DEFAULT 'LIVE_OPERATIONAL' CHECK (data_origin IN ('LIVE_OPERATIONAL', 'SIMULATION', 'STAGING', 'SYNTHETIC')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Digital Twin Relationships
CREATE TABLE IF NOT EXISTS digital_twin_relationships (
    id TEXT PRIMARY KEY,
    source_entity_id TEXT NOT NULL REFERENCES digital_twin_entities(id) ON DELETE CASCADE,
    target_entity_id TEXT NOT NULL REFERENCES digital_twin_entities(id) ON DELETE CASCADE,
    relationship_type TEXT NOT NULL CHECK (relationship_type IN (
        'LOCATED_IN', 'OWNS', 'OPERATES', 'GROWS', 'DEPENDS_ON', 'SUPPLIES',
        'TRANSPORTS_TO', 'STORES_AT', 'PROCESSES_AT', 'MARKETS_AT', 'AFFECTED_BY',
        'CONNECTED_TO', 'PROTECTED_BY', 'SUBJECT_TO'
    )),
    weight NUMERIC DEFAULT 1.0,
    metadata JSONB DEFAULT '{}'::jsonb,
    provenance JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Digital Twin State Snapshots
CREATE TABLE IF NOT EXISTS digital_twin_state_snapshots (
    id TEXT PRIMARY KEY,
    snapshot_timestamp TIMESTAMPTZ NOT NULL,
    geography JSONB NOT NULL,
    snapshot_mode TEXT NOT NULL CHECK (snapshot_mode IN ('CURRENT', 'HISTORICAL', 'PROJECTED', 'SIMULATED')),
    farm_state JSONB DEFAULT '{}'::jsonb,
    crop_state JSONB DEFAULT '{}'::jsonb,
    soil_state JSONB DEFAULT '{}'::jsonb,
    water_state JSONB DEFAULT '{}'::jsonb,
    weather_state JSONB DEFAULT '{}'::jsonb,
    infrastructure_state JSONB DEFAULT '{}'::jsonb,
    market_state JSONB DEFAULT '{}'::jsonb,
    supply_state JSONB DEFAULT '{}'::jsonb,
    policy_state JSONB DEFAULT '{}'::jsonb,
    logistics_state JSONB DEFAULT '{}'::jsonb,
    data_origin TEXT DEFAULT 'LIVE_OPERATIONAL',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Farm Twin States
CREATE TABLE IF NOT EXISTS farm_twin_states (
    id TEXT PRIMARY KEY,
    farm_id TEXT NOT NULL,
    state_timestamp TIMESTAMPTZ NOT NULL,
    boundary JSONB,
    crop_code TEXT,
    soil_type TEXT,
    farm_health_score NUMERIC CHECK (farm_health_score BETWEEN 0 AND 100),
    expected_production_min NUMERIC,
    expected_production_max NUMERIC,
    water_demand_liters NUMERIC,
    input_demand_kg JSONB DEFAULT '{}'::jsonb,
    risk_exposure_score NUMERIC CHECK (risk_exposure_score BETWEEN 0 AND 100),
    uncertainty_margin NUMERIC DEFAULT 0.1,
    data_origin TEXT DEFAULT 'LIVE_OPERATIONAL',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Field Twin States
CREATE TABLE IF NOT EXISTS field_twin_states (
    id TEXT PRIMARY KEY,
    field_id TEXT NOT NULL,
    farm_id TEXT NOT NULL,
    state_timestamp TIMESTAMPTZ NOT NULL,
    geometry JSONB,
    soil_health_index NUMERIC,
    crop_stage TEXT,
    moisture_level NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Crop Twin States
CREATE TABLE IF NOT EXISTS crop_twin_states (
    id TEXT PRIMARY KEY,
    crop_id TEXT NOT NULL,
    field_id TEXT NOT NULL,
    stage TEXT NOT NULL CHECK (stage IN (
        'PLANNED', 'SOWN', 'GERMINATING', 'VEGETATIVE', 'FLOWERING',
        'FRUITING', 'MATURING', 'HARVEST_READY', 'HARVESTED'
    )),
    gdd_accumulated NUMERIC DEFAULT 0,
    canopy_cover_pct NUMERIC DEFAULT 0,
    stress_index NUMERIC DEFAULT 0,
    transition_timestamp TIMESTAMPTZ DEFAULT NOW(),
    data_origin TEXT DEFAULT 'LIVE_OPERATIONAL'
);

-- 7. Soil Twin States
CREATE TABLE IF NOT EXISTS soil_twin_states (
    id TEXT PRIMARY KEY,
    field_id TEXT NOT NULL,
    soil_type TEXT NOT NULL,
    ph NUMERIC,
    organic_carbon_pct NUMERIC,
    nitrogen_kg_ha NUMERIC,
    phosphorus_kg_ha NUMERIC,
    potassium_kg_ha NUMERIC,
    moisture_pct NUMERIC,
    salinity_ec NUMERIC,
    texture TEXT,
    sampling_date DATE,
    measurement_quality TEXT CHECK (measurement_quality IN ('LAB_TESTED', 'SENSOR_ESTIMATED', 'MODELED', 'UNVERIFIED')),
    data_origin TEXT DEFAULT 'LIVE_OPERATIONAL',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Water Twin States
CREATE TABLE IF NOT EXISTS water_twin_states (
    id TEXT PRIMARY KEY,
    district_code TEXT NOT NULL,
    available_capacity_mcm NUMERIC NOT NULL,
    forecast_inflow_mcm NUMERIC NOT NULL,
    demand_mcm NUMERIC NOT NULL,
    deficit_mcm NUMERIC NOT NULL,
    allocation_pct NUMERIC DEFAULT 100,
    risk_level TEXT CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    state_timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Weather Twin States
CREATE TABLE IF NOT EXISTS weather_twin_states (
    id TEXT PRIMARY KEY,
    station_id TEXT NOT NULL,
    district_code TEXT NOT NULL,
    mode TEXT NOT NULL CHECK (mode IN ('HISTORICAL', 'CURRENT', 'FORECAST', 'SCENARIO')),
    temperature_c NUMERIC,
    rainfall_mm NUMERIC,
    humidity_pct NUMERIC,
    wind_speed_kmh NUMERIC,
    solar_radiation_mj NUMERIC,
    extreme_event TEXT,
    state_timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Infrastructure Twin States
CREATE TABLE IF NOT EXISTS infrastructure_twin_states (
    id TEXT PRIMARY KEY,
    facility_id TEXT NOT NULL,
    facility_type TEXT NOT NULL CHECK (facility_type IN ('warehouse', 'cold_storage', 'processing', 'transport_hub', 'road', 'market')),
    total_capacity NUMERIC NOT NULL,
    utilization_pct NUMERIC NOT NULL CHECK (utilization_pct BETWEEN 0 AND 100),
    operational_status TEXT DEFAULT 'ACTIVE',
    maintenance_flag BOOLEAN DEFAULT FALSE,
    district_code TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Market Twin States
CREATE TABLE IF NOT EXISTS market_twin_states (
    id TEXT PRIMARY KEY,
    mandi_code TEXT NOT NULL,
    commodity_code TEXT NOT NULL,
    supply_mt NUMERIC NOT NULL,
    demand_mt NUMERIC NOT NULL,
    simulated_price_per_qt NUMERIC NOT NULL,
    is_simulated BOOLEAN DEFAULT TRUE,
    arrival_mt NUMERIC,
    inventory_mt NUMERIC,
    state_timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Supply Twin States
CREATE TABLE IF NOT EXISTS supply_twin_states (
    id TEXT PRIMARY KEY,
    district_code TEXT NOT NULL,
    commodity_code TEXT NOT NULL,
    production_balance_mt NUMERIC NOT NULL,
    surplus_mt NUMERIC DEFAULT 0,
    deficit_mt NUMERIC DEFAULT 0,
    storage_coverage_days NUMERIC,
    processing_capacity_mt NUMERIC,
    logistics_bottleneck_flag BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Digital Twin Events
CREATE TABLE IF NOT EXISTS digital_twin_events (
    id TEXT PRIMARY KEY,
    event_type TEXT NOT NULL CHECK (event_type IN (
        'crop_state_changed', 'weather_changed', 'water_changed', 'inventory_changed',
        'market_changed', 'logistics_disrupted', 'policy_changed', 'risk_changed'
    )),
    entity_id TEXT NOT NULL,
    payload JSONB NOT NULL,
    event_timestamp TIMESTAMPTZ DEFAULT NOW(),
    data_origin TEXT DEFAULT 'SIMULATION' CHECK (data_origin IN ('LIVE_OPERATIONAL', 'SIMULATION', 'STAGING', 'SYNTHETIC'))
);

-- 14. Simulation Scenarios
CREATE TABLE IF NOT EXISTS simulation_scenarios (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    scenario_type TEXT NOT NULL CHECK (scenario_type IN (
        'drought', 'flood', 'heatwave', 'pest_outbreak', 'disease_outbreak',
        'fertilizer_shortage', 'fuel_price_shock', 'transport_disruption',
        'market_demand_shock', 'crop_failure', 'export_restriction', 'import_disruption', 'custom'
    )),
    assumptions JSONB DEFAULT '{}'::jsonb,
    affected_regions JSONB DEFAULT '[]'::jsonb,
    affected_commodities JSONB DEFAULT '[]'::jsonb,
    severity TEXT CHECK (severity IN ('MILD', 'MODERATE', 'SEVERE', 'EXTREME')),
    duration_days INT NOT NULL,
    start_time TIMESTAMPTZ DEFAULT NOW(),
    end_time TIMESTAMPTZ,
    data_origin TEXT DEFAULT 'LIVE_OPERATIONAL',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. Simulation Parameters
CREATE TABLE IF NOT EXISTS simulation_parameters (
    id TEXT PRIMARY KEY,
    scenario_id TEXT NOT NULL REFERENCES simulation_scenarios(id) ON DELETE CASCADE,
    parameter_name TEXT NOT NULL,
    parameter_value JSONB NOT NULL,
    distribution_type TEXT DEFAULT 'DETERMINISTIC',
    mean_val NUMERIC,
    std_dev NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. Simulation Runs
CREATE TABLE IF NOT EXISTS simulation_runs (
    id TEXT PRIMARY KEY,
    scenario_id TEXT NOT NULL REFERENCES simulation_scenarios(id),
    run_type TEXT NOT NULL CHECK (run_type IN ('WHAT_IF', 'MONTE_CARLO', 'INTERVENTION', 'COUNTERFACTUAL')),
    status TEXT NOT NULL DEFAULT 'QUEUED' CHECK (status IN ('QUEUED', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED')),
    random_seed INT,
    simulation_runs_count INT DEFAULT 1,
    geographic_scope TEXT NOT NULL,
    risk_level TEXT DEFAULT 'LOW' CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    requires_human_review BOOLEAN DEFAULT FALSE,
    reviewed_by TEXT,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. Simulation Results
CREATE TABLE IF NOT EXISTS simulation_results (
    id TEXT PRIMARY KEY,
    run_id TEXT NOT NULL REFERENCES simulation_runs(id) ON DELETE CASCADE,
    baseline_metrics JSONB NOT NULL,
    simulated_metrics JSONB NOT NULL,
    variance_metrics JSONB NOT NULL,
    confidence_score NUMERIC CHECK (confidence_score BETWEEN 0 AND 1),
    uncertainty_bound JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. Simulation Timelines
CREATE TABLE IF NOT EXISTS simulation_timelines (
    id TEXT PRIMARY KEY,
    run_id TEXT NOT NULL REFERENCES simulation_runs(id) ON DELETE CASCADE,
    timestep_index INT NOT NULL,
    timestep_date DATE NOT NULL,
    state_payload JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 19. Simulation Uncertainty
CREATE TABLE IF NOT EXISTS simulation_uncertainty (
    id TEXT PRIMARY KEY,
    run_id TEXT NOT NULL REFERENCES simulation_runs(id) ON DELETE CASCADE,
    variable_name TEXT NOT NULL,
    p10_value NUMERIC NOT NULL,
    p50_value NUMERIC NOT NULL,
    p90_value NUMERIC NOT NULL,
    confidence_interval_95 JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 20. Simulation Interventions
CREATE TABLE IF NOT EXISTS simulation_interventions (
    id TEXT PRIMARY KEY,
    run_id TEXT NOT NULL REFERENCES simulation_runs(id) ON DELETE CASCADE,
    intervention_type TEXT NOT NULL CHECK (intervention_type IN (
        'additional_irrigation', 'storage_expansion', 'logistics_rerouting',
        'crop_diversification', 'processing_expansion', 'market_redistribution',
        'water_conservation', 'fpo_aggregation'
    )),
    cost_inr NUMERIC NOT NULL,
    production_effect_pct NUMERIC,
    water_effect_mcm NUMERIC,
    food_security_effect_score NUMERIC,
    logistics_efficiency_gain_pct NUMERIC,
    farmer_income_change_pct NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 21. Counterfactual Runs
CREATE TABLE IF NOT EXISTS counterfactual_runs (
    id TEXT PRIMARY KEY,
    run_id TEXT NOT NULL REFERENCES simulation_runs(id) ON DELETE CASCADE,
    output_tag TEXT NOT NULL DEFAULT 'COUNTERFACTUAL_SIMULATION' CHECK (output_tag = 'COUNTERFACTUAL_SIMULATION'),
    hypothetical_variable TEXT NOT NULL,
    observed_baseline JSONB NOT NULL,
    counterfactual_outcome JSONB NOT NULL,
    delta_explanation TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 22. Simulation Provenance
CREATE TABLE IF NOT EXISTS simulation_provenance (
    id TEXT PRIMARY KEY,
    run_id TEXT NOT NULL REFERENCES simulation_runs(id) ON DELETE CASCADE,
    model_id TEXT NOT NULL,
    model_version TEXT NOT NULL,
    data_version TEXT NOT NULL,
    assumptions_summary TEXT NOT NULL,
    parameters_hash TEXT NOT NULL,
    executed_by TEXT NOT NULL,
    retrieved_at TIMESTAMPTZ DEFAULT NOW()
);

-- 23. Twin Model Bindings
CREATE TABLE IF NOT EXISTS twin_model_bindings (
    id TEXT PRIMARY KEY,
    model_id TEXT NOT NULL,
    model_name TEXT NOT NULL,
    version TEXT NOT NULL,
    approval_status TEXT NOT NULL CHECK (approval_status IN ('PENDING', 'APPROVED', 'DEPRECATED', 'REJECTED')),
    owner TEXT NOT NULL,
    valid_until DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 24. Simulation Reviews
CREATE TABLE IF NOT EXISTS simulation_reviews (
    id TEXT PRIMARY KEY,
    run_id TEXT NOT NULL REFERENCES simulation_runs(id) ON DELETE CASCADE,
    reviewer_id TEXT NOT NULL,
    review_status TEXT NOT NULL CHECK (review_status IN ('APPROVED', 'REJECTED', 'NEEDS_REVISION')),
    comments TEXT,
    reviewed_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_dt_entities_type ON digital_twin_entities(entity_type);
CREATE INDEX IF NOT EXISTS idx_dt_rel_source ON digital_twin_relationships(source_entity_id);
CREATE INDEX IF NOT EXISTS idx_dt_rel_target ON digital_twin_relationships(target_entity_id);
CREATE INDEX IF NOT EXISTS idx_sim_runs_status ON simulation_runs(status);
CREATE INDEX IF NOT EXISTS idx_sim_runs_risk ON simulation_runs(risk_level);

-- ROW LEVEL SECURITY
ALTER TABLE digital_twin_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_twin_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_twin_state_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_twin_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulation_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulation_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulation_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY dt_entities_read ON digital_twin_entities FOR SELECT USING (true);
CREATE POLICY dt_rel_read ON digital_twin_relationships FOR SELECT USING (true);
CREATE POLICY dt_state_read ON digital_twin_state_snapshots FOR SELECT USING (true);
CREATE POLICY farm_twin_read ON farm_twin_states FOR SELECT USING (true);
CREATE POLICY sim_scenarios_read ON simulation_scenarios FOR SELECT USING (true);
CREATE POLICY sim_runs_read ON simulation_runs FOR SELECT USING (true);
CREATE POLICY sim_results_read ON simulation_results FOR SELECT USING (true);
