-- AgriMark Phase 15: Physical Intelligence & Controlled Field Operations Migration

-- 1. Canonical Device Registry
CREATE TABLE IF NOT EXISTS devices (
    id TEXT PRIMARY KEY,
    device_type TEXT NOT NULL, -- soil_sensor, weather_station, water_meter, irrigation_controller, drone, tractor, harvester, cold_storage_controller, camera, gateway
    device_model TEXT NOT NULL,
    manufacturer TEXT NOT NULL,
    owner_id TEXT NOT NULL,
    farm_id TEXT,
    location TEXT NOT NULL,
    firmware_version TEXT NOT NULL DEFAULT '1.0.0',
    connectivity_status TEXT NOT NULL DEFAULT 'ONLINE', -- ONLINE, OFFLINE, QUARANTINED, DEGRADED
    last_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    capabilities JSONB NOT NULL DEFAULT '[]'::jsonb,
    safety_class TEXT NOT NULL DEFAULT 'STANDARD', -- LOW_RISK, STANDARD, CRITICAL_EQUIPMENT
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Device Identity & Credentials Security
CREATE TABLE IF NOT EXISTS device_credentials (
    id TEXT PRIMARY KEY,
    device_id TEXT NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    credential_hash TEXT NOT NULL,
    certificate_status TEXT NOT NULL DEFAULT 'VALID', -- VALID, EXPIRED, REVOKED
    last_authenticated TIMESTAMPTZ,
    is_quarantined BOOLEAN NOT NULL DEFAULT FALSE,
    is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
    rotated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS device_events (
    id TEXT PRIMARY KEY,
    device_id TEXT NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL, -- registered, authenticated, rotated, quarantined, revoked, firmware_updated
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Telemetry Ingestion Records
CREATE TABLE IF NOT EXISTS telemetry_records (
    id TEXT PRIMARY KEY,
    device_id TEXT NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    captured_at TIMESTAMPTZ NOT NULL,
    received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    measurement_type TEXT NOT NULL, -- temperature, humidity, soil_moisture, soil_temperature, rainfall, wind, water_flow, battery, fuel, machine_status, GPS
    value NUMERIC NOT NULL,
    unit TEXT NOT NULL,
    quality_status TEXT NOT NULL DEFAULT 'NORMAL', -- NORMAL, SUSPECT, ANOMALOUS, REJECTED
    source TEXT NOT NULL DEFAULT 'direct_iot',
    data_origin TEXT NOT NULL DEFAULT 'agrimark_physical_gateway'
);

-- 4. Sensor Data Quality Audit
CREATE TABLE IF NOT EXISTS telemetry_quality (
    id TEXT PRIMARY KEY,
    telemetry_id TEXT NOT NULL REFERENCES telemetry_records(id) ON DELETE CASCADE,
    quality_status TEXT NOT NULL, -- NORMAL, IMPOSSIBLE_VALUE, SENSOR_DRIFT, STALE_SENSOR, SPIKE, CLOCK_SKEW
    quality_score NUMERIC NOT NULL DEFAULT 1.0,
    anomaly_type TEXT,
    evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
    evaluated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Field Digital Twin Foundations
CREATE TABLE IF NOT EXISTS field_states (
    id TEXT PRIMARY KEY,
    farm_id TEXT NOT NULL,
    field_id TEXT NOT NULL,
    crop_stage TEXT NOT NULL DEFAULT 'VEGETATIVE',
    soil_state JSONB NOT NULL DEFAULT '{}'::jsonb, -- moisture, temp, pH, NPK
    water_state JSONB NOT NULL DEFAULT '{}'::jsonb, -- deficit, irrigation_needed_liters
    weather_state JSONB NOT NULL DEFAULT '{}'::jsonb, -- temp, rain_risk, wind_speed
    risk_state JSONB NOT NULL DEFAULT '{}'::jsonb, -- pest_risk, drought_risk, heat_risk
    confidence NUMERIC NOT NULL DEFAULT 0.90,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Farm Machinery & Maintenance Records
CREATE TABLE IF NOT EXISTS equipment (
    id TEXT PRIMARY KEY,
    farm_id TEXT NOT NULL,
    owner_id TEXT NOT NULL,
    equipment_type TEXT NOT NULL, -- tractor, harvester, sprayer, planter, implement
    name TEXT NOT NULL,
    model TEXT NOT NULL,
    fuel_capacity_liters NUMERIC NOT NULL DEFAULT 50,
    total_hours NUMERIC NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'AVAILABLE', -- AVAILABLE, IN_USE, MAINTENANCE, REPAIR_NEEDED
    last_serviced_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS equipment_maintenance (
    id TEXT PRIMARY KEY,
    equipment_id TEXT NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
    maintenance_type TEXT NOT NULL, -- SCHEDULED_SERVICE, FAULT_REPAIR, OIL_CHANGE
    runtime_hours NUMERIC NOT NULL,
    fault_codes JSONB NOT NULL DEFAULT '[]'::jsonb,
    recommended_action TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING', -- PENDING, COMPLETED, DISMISSED
    scheduled_date TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Field Service Network
CREATE TABLE IF NOT EXISTS service_providers (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    service_type TEXT NOT NULL, -- agronomist, soil_testing, drone_operator, machinery_provider, irrigation_technician, harvesting_team, pest_control
    service_area TEXT NOT NULL,
    hourly_rate NUMERIC NOT NULL DEFAULT 0,
    rating NUMERIC NOT NULL DEFAULT 4.8,
    verification_status TEXT NOT NULL DEFAULT 'VERIFIED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS service_requests (
    id TEXT PRIMARY KEY,
    farmer_id TEXT NOT NULL,
    provider_id TEXT NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
    service_type TEXT NOT NULL,
    target_field_id TEXT NOT NULL,
    scheduled_time TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'REQUESTED', -- REQUESTED, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Drone Missions
CREATE TABLE IF NOT EXISTS drone_missions (
    id TEXT PRIMARY KEY,
    target_field_id TEXT NOT NULL,
    drone_id TEXT NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    operator_id TEXT NOT NULL,
    mission_type TEXT NOT NULL, -- CROP_SURVEY, NDVI_MULTISPECTRAL, THERMAL_SURVEY, PEST_SCOUTING, IRRIGATION_INSPECTION
    boundary_polygon JSONB NOT NULL DEFAULT '[]'::jsonb,
    altitude_limit_m NUMERIC NOT NULL DEFAULT 50,
    time_window_start TIMESTAMPTZ NOT NULL,
    time_window_end TIMESTAMPTZ NOT NULL,
    approval_status TEXT NOT NULL DEFAULT 'PENDING_APPROVAL', -- PENDING_APPROVAL, APPROVED, REJECTED, COMPLETED
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Decision Engine & Safe Irrigation Commands
CREATE TABLE IF NOT EXISTS physical_recommendations (
    id TEXT PRIMARY KEY,
    field_id TEXT NOT NULL,
    action_type TEXT NOT NULL, -- IRRIGATE, INSPECT, SPRAY, FERTILIZE, HARVEST, DELAY_HARVEST, SCHEDULE_MACHINERY, REQUEST_SERVICE
    reason TEXT NOT NULL,
    evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
    confidence NUMERIC NOT NULL DEFAULT 0.90,
    expected_benefit NUMERIC NOT NULL DEFAULT 0,
    risk_level TEXT NOT NULL DEFAULT 'LOW', -- LOW, MEDIUM, HIGH
    status TEXT NOT NULL DEFAULT 'OPEN', -- OPEN, APPROVED, REJECTED, EXPIRED
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS physical_approvals (
    id TEXT PRIMARY KEY,
    recommendation_id TEXT NOT NULL REFERENCES physical_recommendations(id) ON DELETE CASCADE,
    approved_by TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'APPROVED', -- APPROVED, REJECTED
    approved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    remarks TEXT
);

CREATE TABLE IF NOT EXISTS physical_commands (
    id TEXT PRIMARY KEY,
    device_id TEXT NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    field_id TEXT NOT NULL,
    command_type TEXT NOT NULL, -- START_IRRIGATION, STOP_IRRIGATION, ADJUST_VALVE
    target_duration_sec INTEGER NOT NULL,
    water_volume_liters NUMERIC NOT NULL DEFAULT 0,
    max_runtime_sec INTEGER NOT NULL DEFAULT 7200, -- Hard server cutoff (max 2 hours)
    nonce TEXT NOT NULL UNIQUE,
    issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'SENT' -- SENT, EXECUTED, CONFIRMED, EXPIRED, REJECTED, EMERGENCY_STOPPED
);

CREATE TABLE IF NOT EXISTS command_execution_events (
    id TEXT PRIMARY KEY,
    command_id TEXT NOT NULL REFERENCES physical_commands(id) ON DELETE CASCADE,
    device_id TEXT NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'SUCCESS',
    telemetry_confirmation_id TEXT REFERENCES telemetry_records(id),
    executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Physical Safety Policy & Emergency Shutdown
CREATE TABLE IF NOT EXISTS safety_policies (
    id TEXT PRIMARY KEY,
    equipment_type TEXT NOT NULL UNIQUE,
    max_operating_duration_sec INTEGER NOT NULL DEFAULT 7200,
    weather_constraints JSONB NOT NULL DEFAULT '{}'::jsonb,
    required_operator_role TEXT NOT NULL DEFAULT 'CERTIFIED_OPERATOR',
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS safety_events (
    id TEXT PRIMARY KEY,
    command_id TEXT REFERENCES physical_commands(id),
    device_id TEXT NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    evaluation_result TEXT NOT NULL, -- ALLOWED, BLOCKED, REQUIRES_APPROVAL, UNSAFE
    block_reason TEXT,
    evaluated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS emergency_events (
    id TEXT PRIMARY KEY,
    triggered_by TEXT NOT NULL,
    target_device_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
    shutdown_type TEXT NOT NULL DEFAULT 'HARD_STOP',
    reason TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'EXECUTED',
    triggered_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. Physical Outcome Telemetry
CREATE TABLE IF NOT EXISTS physical_outcomes (
    id TEXT PRIMARY KEY,
    field_id TEXT NOT NULL,
    metric_type TEXT NOT NULL, -- WATER_SAVED_LITERS, FUEL_SAVED_LITERS, LABOR_SAVED_HOURS, YIELD_IMPACT_KG, DISEASE_DETECTION_TIME_HOURS
    baseline_value NUMERIC NOT NULL DEFAULT 0,
    observed_value NUMERIC NOT NULL DEFAULT 0,
    value_saved NUMERIC NOT NULL DEFAULT 0,
    unit TEXT NOT NULL,
    measured_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexing for performance
CREATE INDEX IF NOT EXISTS idx_devices_owner ON devices(owner_id);
CREATE INDEX IF NOT EXISTS idx_devices_farm ON devices(farm_id);
CREATE INDEX IF NOT EXISTS idx_telemetry_device_time ON telemetry_records(device_id, captured_at DESC);
CREATE INDEX IF NOT EXISTS idx_field_states_field ON field_states(field_id);
CREATE INDEX IF NOT EXISTS idx_commands_device ON physical_commands(device_id);
CREATE INDEX IF NOT EXISTS idx_commands_nonce ON physical_commands(nonce);
CREATE INDEX IF NOT EXISTS idx_drone_target ON drone_missions(target_field_id);

-- Row Level Security (RLS)
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE telemetry_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE telemetry_quality ENABLE ROW LEVEL SECURITY;
ALTER TABLE field_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_maintenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE drone_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE physical_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE physical_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE physical_commands ENABLE ROW LEVEL SECURITY;
ALTER TABLE command_execution_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE physical_outcomes ENABLE ROW LEVEL SECURITY;

-- Allow authenticated access
CREATE POLICY rls_devices_all ON devices FOR ALL USING (true);
CREATE POLICY rls_dev_credentials_all ON device_credentials FOR ALL USING (true);
CREATE POLICY rls_dev_events_all ON device_events FOR ALL USING (true);
CREATE POLICY rls_telemetry_records_all ON telemetry_records FOR ALL USING (true);
CREATE POLICY rls_telemetry_quality_all ON telemetry_quality FOR ALL USING (true);
CREATE POLICY rls_field_states_all ON field_states FOR ALL USING (true);
CREATE POLICY rls_equipment_all ON equipment FOR ALL USING (true);
CREATE POLICY rls_equipment_maint_all ON equipment_maintenance FOR ALL USING (true);
CREATE POLICY rls_service_prov_all ON service_providers FOR ALL USING (true);
CREATE POLICY rls_service_req_all ON service_requests FOR ALL USING (true);
CREATE POLICY rls_drone_missions_all ON drone_missions FOR ALL USING (true);
CREATE POLICY rls_phys_recs_all ON physical_recommendations FOR ALL USING (true);
CREATE POLICY rls_phys_approvals_all ON physical_approvals FOR ALL USING (true);
CREATE POLICY rls_phys_commands_all ON physical_commands FOR ALL USING (true);
CREATE POLICY rls_cmd_exec_events_all ON command_execution_events FOR ALL USING (true);
CREATE POLICY rls_safety_policies_all ON safety_policies FOR ALL USING (true);
CREATE POLICY rls_safety_events_all ON safety_events FOR ALL USING (true);
CREATE POLICY rls_emergency_events_all ON emergency_events FOR ALL USING (true);
CREATE POLICY rls_phys_outcomes_all ON physical_outcomes FOR ALL USING (true);
