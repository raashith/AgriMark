-- Migration 06: National Agricultural Operating System Infrastructure
-- Phase 13: Canonical relationship graph, durable domain events, idempotency, workflow engine,
-- farmer action queue, alerts, human approval framework, AI supervisor governance, SLOs, and incidents.

CREATE TABLE IF NOT EXISTS entity_identifiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN ('FARMER', 'FARM', 'CROP', 'CULTIVATION', 'HARVEST', 'PRODUCE_LOT', 'LISTING', 'ORDER', 'SHIPMENT', 'WAREHOUSE', 'FPO', 'MARKET', 'BUYER')),
    canonical_id VARCHAR(100) NOT NULL UNIQUE,
    entity_version INT DEFAULT 1,
    owner_id VARCHAR(100) NOT NULL,
    data_classification VARCHAR(30) DEFAULT 'CONFIDENTIAL' CHECK (data_classification IN ('PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'SENSITIVE', 'REGULATED')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS domain_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id VARCHAR(100) NOT NULL UNIQUE,
    event_type VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    actor VARCHAR(100) NOT NULL,
    occurred_at TIMESTAMPTZ DEFAULT NOW(),
    schema_version VARCHAR(20) DEFAULT 'v1.0',
    correlation_id VARCHAR(100) NOT NULL,
    causation_id VARCHAR(100),
    data_origin VARCHAR(50) DEFAULT 'PRODUCTION' CHECK (data_origin IN ('PRODUCTION', 'SYNTHETIC', 'SIMULATED')),
    payload JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS event_consumers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id VARCHAR(100) NOT NULL REFERENCES domain_events(event_id) ON DELETE CASCADE,
    consumer_name VARCHAR(100) NOT NULL,
    processed_at TIMESTAMPTZ DEFAULT NOW(),
    result VARCHAR(20) DEFAULT 'SUCCESS' CHECK (result IN ('SUCCESS', 'SKIPPED_DUPLICATE', 'FAILED')),
    UNIQUE (event_id, consumer_name)
);

CREATE TABLE IF NOT EXISTS workflow_instances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id VARCHAR(100) NOT NULL UNIQUE,
    workflow_name VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    current_step VARCHAR(50) NOT NULL,
    previous_step VARCHAR(50),
    next_step VARCHAR(50),
    status VARCHAR(30) DEFAULT 'IN_PROGRESS' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'WAITING_HUMAN_APPROVAL', 'COMPLETED', 'FAILED', 'RETRYING')),
    failure_reason TEXT,
    retry_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workflow_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id VARCHAR(100) NOT NULL REFERENCES workflow_instances(workflow_id) ON DELETE CASCADE,
    step_name VARCHAR(50) NOT NULL,
    status VARCHAR(30) NOT NULL CHECK (status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED')),
    output JSONB DEFAULT '{}'::jsonb,
    executed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS action_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action_id VARCHAR(100) NOT NULL UNIQUE,
    owner_id VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'MEDIUM' CHECK (priority IN ('INFO', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    source VARCHAR(100) NOT NULL,
    deadline TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'COMPLETED', 'DISMISSED', 'EXPIRED')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_id VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(50) NOT NULL CHECK (category IN ('WEATHER', 'CROP_RISK', 'DISEASE', 'PRICE_MOVEMENT', 'DEMAND', 'ORDER', 'SHIPMENT', 'FPO', 'FINANCIAL', 'POLICY', 'DATA_QUALITY')),
    priority VARCHAR(20) DEFAULT 'MEDIUM' CHECK (priority IN ('INFO', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    title VARCHAR(255) NOT NULL,
    reason TEXT NOT NULL,
    source VARCHAR(100) NOT NULL,
    confidence NUMERIC(3, 2) DEFAULT 0.90,
    recommended_action TEXT,
    recipient_id VARCHAR(100) NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS approval_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id VARCHAR(100) NOT NULL UNIQUE,
    requester_id VARCHAR(100) NOT NULL,
    action_type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    status VARCHAR(30) DEFAULT 'PENDING_APPROVAL' CHECK (status IN ('RECOMMENDED', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'EXECUTED', 'FAILED', 'EXPIRED')),
    approver_id VARCHAR(100),
    approval_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    decided_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS ai_tool_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tool_name VARCHAR(100) NOT NULL UNIQUE,
    tool_class VARCHAR(50) NOT NULL CHECK (tool_class IN ('READ_ONLY', 'SAFE_MUTATION', 'HUMAN_APPROVAL_REQUIRED', 'FORBIDDEN')),
    description TEXT NOT NULL,
    requires_consent BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS slo_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_name VARCHAR(100) NOT NULL UNIQUE,
    target_slo_percent NUMERIC(5, 2) NOT NULL,
    actual_percent NUMERIC(5, 2) NOT NULL,
    error_budget_remaining_percent NUMERIC(5, 2) NOT NULL,
    p50_latency_ms INT NOT NULL,
    p95_latency_ms INT NOT NULL,
    p99_latency_ms INT NOT NULL,
    measured_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS operational_incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_code VARCHAR(100) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    severity VARCHAR(10) NOT NULL CHECK (severity IN ('P0', 'P1', 'P2', 'P3')),
    status VARCHAR(20) DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'INVESTIGATING', 'MITIGATED', 'RESOLVED')),
    source_service VARCHAR(100) NOT NULL,
    assigned_to VARCHAR(100),
    correlated_deployment_id VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS incident_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id UUID NOT NULL REFERENCES operational_incidents(id) ON DELETE CASCADE,
    actor_id VARCHAR(100) NOT NULL,
    notes TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE entity_identifiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE domain_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read entity identifiers" ON entity_identifiers FOR SELECT USING (true);
CREATE POLICY "Users read own action items" ON action_items FOR SELECT USING (owner_id = auth.uid()::text);
CREATE POLICY "Users read own alerts" ON alerts FOR SELECT USING (recipient_id = auth.uid()::text);
