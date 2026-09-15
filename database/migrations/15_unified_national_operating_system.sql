-- AgriMark Accelerated Build Part 3: Unified National Agricultural Operating System Migration

-- 1. Unified Events Log
CREATE TABLE IF NOT EXISTS unified_events_log (
    id TEXT PRIMARY KEY,
    event_id TEXT UNIQUE NOT NULL,
    event_type TEXT NOT NULL,
    actor TEXT NOT NULL,
    source TEXT NOT NULL,
    entity JSONB NOT NULL,
    payload JSONB NOT NULL,
    correlation_id TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Unified Workflow States
CREATE TABLE IF NOT EXISTS unified_workflow_states (
    id TEXT PRIMARY KEY,
    workflow_name TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    current_step TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'RETRYING')),
    payload JSONB DEFAULT '{}'::jsonb,
    error_message TEXT,
    retry_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Outcome Economics Records
CREATE TABLE IF NOT EXISTS outcome_economics_records (
    id TEXT PRIMARY KEY,
    entity_id TEXT NOT NULL,
    entity_type TEXT NOT NULL CHECK (entity_type IN ('FARMER', 'FPO', 'REGIONAL', 'NATIONAL')),
    farmer_income_change_pct NUMERIC,
    yield_change_pct NUMERIC,
    input_efficiency_score NUMERIC,
    water_efficiency_score NUMERIC,
    market_realization_pct NUMERIC,
    loss_reduction_pct NUMERIC,
    cost_reduction_pct NUMERIC,
    scheme_benefit_inr NUMERIC,
    logistics_efficiency_gain_pct NUMERIC,
    credit_outcome_score NUMERIC,
    insurance_outcome_score NUMERIC,
    evidence_provenance JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. National Resilience Indices
CREATE TABLE IF NOT EXISTS national_resilience_indices (
    id TEXT PRIMARY KEY,
    region_or_commodity TEXT NOT NULL,
    level TEXT NOT NULL CHECK (level IN ('REGIONAL', 'COMMODITY', 'NATIONAL')),
    food_security_index NUMERIC CHECK (food_security_index BETWEEN 0 AND 100),
    climate_resilience_index NUMERIC CHECK (climate_resilience_index BETWEEN 0 AND 100),
    water_resilience_index NUMERIC CHECK (water_resilience_index BETWEEN 0 AND 100),
    supply_chain_resilience_index NUMERIC CHECK (supply_chain_resilience_index BETWEEN 0 AND 100),
    logistics_resilience_index NUMERIC CHECK (logistics_resilience_index BETWEEN 0 AND 100),
    overall_resilience_score NUMERIC CHECK (overall_resilience_score BETWEEN 0 AND 100),
    methodology TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Agricultural Operating Graph Nodes
CREATE TABLE IF NOT EXISTS agri_operating_graph_nodes (
    id TEXT PRIMARY KEY,
    node_type TEXT NOT NULL,
    name TEXT NOT NULL,
    properties JSONB DEFAULT '{}'::jsonb,
    data_origin TEXT DEFAULT 'LIVE_OPERATIONAL',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Agricultural Operating Graph Edges
CREATE TABLE IF NOT EXISTS agri_operating_graph_edges (
    id TEXT PRIMARY KEY,
    source_node_id TEXT NOT NULL REFERENCES agri_operating_graph_nodes(id) ON DELETE CASCADE,
    target_node_id TEXT NOT NULL REFERENCES agri_operating_graph_nodes(id) ON DELETE CASCADE,
    relationship_type TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. AI Supervisor Logs
CREATE TABLE IF NOT EXISTS ai_supervisor_logs (
    id TEXT PRIMARY KEY,
    supervisor_action TEXT NOT NULL,
    selected_tools JSONB DEFAULT '[]'::jsonb,
    retrieved_evidence_ids JSONB DEFAULT '[]'::jsonb,
    human_approval_required BOOLEAN DEFAULT FALSE,
    conflict_detected BOOLEAN DEFAULT FALSE,
    uncertainty_escalated BOOLEAN DEFAULT FALSE,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 8. National Alerts
CREATE TABLE IF NOT EXISTS national_alerts (
    id TEXT PRIMARY KEY,
    alert_type TEXT NOT NULL CHECK (alert_type IN ('weather', 'climate', 'crop_disease', 'market', 'food_security', 'water', 'logistics', 'scheme_deadline', 'device_failure', 'ai_incident')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    status TEXT NOT NULL DEFAULT 'CREATED' CHECK (status IN ('CREATED', 'ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED', 'EXPIRED')),
    acknowledged_by TEXT,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Human Approval Requests
CREATE TABLE IF NOT EXISTS human_approval_requests (
    id TEXT PRIMARY KEY,
    request_type TEXT NOT NULL CHECK (request_type IN (
        'high_risk_ai_action', 'financial_action', 'physical_command',
        'policy_conflict', 'certification', 'insurance_credit_decision', 'critical_infrastructure'
    )),
    requester_service TEXT NOT NULL,
    action_details JSONB NOT NULL,
    risk_level TEXT NOT NULL CHECK (risk_level IN ('HIGH', 'CRITICAL')),
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    approved_by TEXT,
    comments TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    decided_at TIMESTAMPTZ
);

-- 10. Incident Records
CREATE TABLE IF NOT EXISTS incident_records (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('application', 'database', 'ai_incident', 'device', 'data_quality', 'security', 'simulation')),
    severity TEXT NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    owner TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'INVESTIGATING', 'RESOLVED', 'CLOSED')),
    root_cause TEXT,
    resolution TEXT,
    postmortem TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- 11. Observability Metrics
CREATE TABLE IF NOT EXISTS observability_metrics (
    id TEXT PRIMARY KEY,
    service_name TEXT NOT NULL,
    metric_name TEXT NOT NULL,
    metric_value NUMERIC NOT NULL,
    unit TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Data Governance Access Logs
CREATE TABLE IF NOT EXISTS data_governance_access_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    data_classification TEXT NOT NULL CHECK (data_classification IN ('PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED')),
    resource_accessed TEXT NOT NULL,
    action TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_events_type ON unified_events_log(event_type);
CREATE INDEX IF NOT EXISTS idx_events_corr ON unified_events_log(correlation_id);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON national_alerts(status);
CREATE INDEX IF NOT EXISTS idx_approval_status ON human_approval_requests(status);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON incident_records(status);

-- ROW LEVEL SECURITY
ALTER TABLE unified_events_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE unified_workflow_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE outcome_economics_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE national_resilience_indices ENABLE ROW LEVEL SECURITY;
ALTER TABLE human_approval_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_governance_access_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY events_read ON unified_events_log FOR SELECT USING (true);
CREATE POLICY workflow_read ON unified_workflow_states FOR SELECT USING (true);
CREATE POLICY outcome_read ON outcome_economics_records FOR SELECT USING (true);
CREATE POLICY resilience_read ON national_resilience_indices FOR SELECT USING (true);
CREATE POLICY approval_read ON human_approval_requests FOR SELECT USING (true);
CREATE POLICY incident_read ON incident_records FOR SELECT USING (true);
CREATE POLICY gov_logs_read ON data_governance_access_logs FOR SELECT USING (true);
