-- AgriMark Phase 14: Autonomous Agricultural Network & Network Effects Migration

-- 1. Network Entities
CREATE TABLE IF NOT EXISTS network_entities (
    id TEXT PRIMARY KEY,
    entity_type TEXT NOT NULL, -- farmer, farm, fpo, buyer, market, mandi, produce_lot, order, logistics, warehouse, quality_provider, researcher
    entity_name TEXT NOT NULL,
    data_origin TEXT NOT NULL DEFAULT 'agrimark_system',
    classification TEXT NOT NULL DEFAULT 'INTERNAL',
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Network Relationships
CREATE TABLE IF NOT EXISTS network_relationships (
    id TEXT PRIMARY KEY,
    source_entity_id TEXT NOT NULL REFERENCES network_entities(id) ON DELETE CASCADE,
    target_entity_id TEXT NOT NULL REFERENCES network_entities(id) ON DELETE CASCADE,
    relationship_type TEXT NOT NULL, -- owns_farm, member_of_fpo, planted_crop, listed_lot, ordered_by, delivered_by, stored_at
    weight NUMERIC NOT NULL DEFAULT 1.0,
    provenance TEXT NOT NULL DEFAULT 'system_inference',
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Match Recommendations (Matching 2.0)
CREATE TABLE IF NOT EXISTS match_recommendations (
    id TEXT PRIMARY KEY,
    farmer_id TEXT NOT NULL,
    buyer_id TEXT NOT NULL,
    lot_id TEXT,
    listing_id TEXT,
    score NUMERIC NOT NULL,
    confidence NUMERIC NOT NULL,
    factors JSONB NOT NULL DEFAULT '{}'::jsonb,
    evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
    model_version TEXT NOT NULL DEFAULT 'matching_v2.0.0',
    status TEXT NOT NULL DEFAULT 'OPEN',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Liquidity Metrics
CREATE TABLE IF NOT EXISTS liquidity_metrics (
    id TEXT PRIMARY KEY,
    region TEXT NOT NULL,
    active_sellers INTEGER NOT NULL DEFAULT 0,
    active_buyers INTEGER NOT NULL DEFAULT 0,
    inventory_available_kg NUMERIC NOT NULL DEFAULT 0,
    rfq_volume INTEGER NOT NULL DEFAULT 0,
    order_conversion_rate NUMERIC NOT NULL DEFAULT 0,
    avg_time_to_sale_hours NUMERIC NOT NULL DEFAULT 0,
    price_spread NUMERIC NOT NULL DEFAULT 0,
    liquidity_tier TEXT NOT NULL DEFAULT 'NORMAL', -- HIGH, NORMAL, LOW, SUPPLY_SURPLUS, DEMAND_SURPLUS
    calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Market Opportunities
CREATE TABLE IF NOT EXISTS opportunities (
    id TEXT PRIMARY KEY,
    entity_type TEXT NOT NULL, -- farmer, fpo
    entity_id TEXT NOT NULL,
    opportunity_type TEXT NOT NULL, -- HIGH_DEMAND_CROP, UNSERVED_DEMAND, NEARBY_BUYER, PRICE_IMPROVEMENT, BULK_PROCUREMENT, STORAGE_OPPORTUNITY, EXPORT_OPPORTUNITY
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    expected_benefit NUMERIC NOT NULL DEFAULT 0,
    required_action TEXT NOT NULL,
    evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
    uncertainty NUMERIC NOT NULL DEFAULT 0.1,
    status TEXT NOT NULL DEFAULT 'OPEN',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Shared Resource Listings & Matches
CREATE TABLE IF NOT EXISTS resource_listings (
    id TEXT PRIMARY KEY,
    provider_id TEXT NOT NULL,
    resource_type TEXT NOT NULL, -- machinery, labor, transport, storage, processing, field_service, irrigation
    name TEXT NOT NULL,
    capacity NUMERIC NOT NULL DEFAULT 1,
    unit TEXT NOT NULL DEFAULT 'hours',
    rate_per_unit NUMERIC NOT NULL DEFAULT 0,
    location TEXT NOT NULL,
    availability_status TEXT NOT NULL DEFAULT 'AVAILABLE',
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS resource_matches (
    id TEXT PRIMARY KEY,
    farmer_id TEXT NOT NULL,
    resource_id TEXT NOT NULL REFERENCES resource_listings(id) ON DELETE CASCADE,
    match_score NUMERIC NOT NULL,
    status TEXT NOT NULL DEFAULT 'MATCHED', -- MATCHED, REQUESTED, CONFIRMED, REJECTED, COMPLETED
    requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Recommendation Outcomes
CREATE TABLE IF NOT EXISTS recommendation_outcomes (
    id TEXT PRIMARY KEY,
    recommendation_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    issued_at TIMESTAMPTZ NOT NULL,
    accepted_at TIMESTAMPTZ,
    action_taken TEXT,
    baseline_value NUMERIC NOT NULL DEFAULT 0,
    result_value NUMERIC NOT NULL DEFAULT 0,
    contribution_type TEXT NOT NULL DEFAULT 'OBSERVED', -- OBSERVED, CORRELATED, ESTIMATED_CONTRIBUTION
    measured_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Experimentation Platform
CREATE TABLE IF NOT EXISTS experiments (
    id TEXT PRIMARY KEY,
    experiment_name TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'DRAFT', -- DRAFT, ACTIVE, PAUSED, CONCLUDED
    target_cohort TEXT NOT NULL DEFAULT 'ALL',
    feature_flag_key TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS experiment_exposures (
    id TEXT PRIMARY KEY,
    experiment_id TEXT NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    variant TEXT NOT NULL,
    exposed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Model Registry & Governance
CREATE TABLE IF NOT EXISTS model_registry (
    id TEXT PRIMARY KEY,
    model_name TEXT NOT NULL UNIQUE,
    task_type TEXT NOT NULL, -- matching, liquidity, forecasting, opportunity, pricing
    current_version TEXT NOT NULL DEFAULT '1.0.0',
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS model_versions (
    id TEXT PRIMARY KEY,
    model_id TEXT NOT NULL REFERENCES model_registry(id) ON DELETE CASCADE,
    version TEXT NOT NULL,
    dataset_version TEXT NOT NULL,
    features JSONB NOT NULL DEFAULT '[]'::jsonb,
    evaluation_metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
    approved_by TEXT NOT NULL DEFAULT 'system_admin',
    status TEXT NOT NULL DEFAULT 'STAGING', -- STAGING, PRODUCTION, ARCHIVED, ROLLED_BACK
    deployed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS training_runs (
    id TEXT PRIMARY KEY,
    model_id TEXT NOT NULL REFERENCES model_registry(id) ON DELETE CASCADE,
    run_name TEXT NOT NULL,
    hyperparams JSONB NOT NULL DEFAULT '{}'::jsonb,
    metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
    status TEXT NOT NULL DEFAULT 'COMPLETED',
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS evaluation_runs (
    id TEXT PRIMARY KEY,
    model_version_id TEXT NOT NULL REFERENCES model_versions(id) ON DELETE CASCADE,
    test_dataset TEXT NOT NULL,
    accuracy NUMERIC NOT NULL DEFAULT 0.95,
    precision NUMERIC NOT NULL DEFAULT 0.94,
    recall NUMERIC NOT NULL DEFAULT 0.93,
    f1_score NUMERIC NOT NULL DEFAULT 0.935,
    evaluated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS model_deployments (
    id TEXT PRIMARY KEY,
    model_version_id TEXT NOT NULL REFERENCES model_versions(id) ON DELETE CASCADE,
    environment TEXT NOT NULL DEFAULT 'production',
    status TEXT NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, ROLLED_BACK
    deployed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    rollback_reason TEXT
);

-- 10. Network Risk Events
CREATE TABLE IF NOT EXISTS network_risk_events (
    id TEXT PRIMARY KEY,
    region TEXT NOT NULL,
    risk_type TEXT NOT NULL, -- SUPPLY_SHOCK, DEMAND_SHOCK, MARKET_CONCENTRATION, SINGLE_BUYER_DEPENDENCY, LOGISTICS_BOTTLENECK, PRICE_ANOMALY
    severity TEXT NOT NULL DEFAULT 'MEDIUM', -- LOW, MEDIUM, HIGH, CRITICAL
    title TEXT NOT NULL,
    evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
    recommended_mitigation TEXT NOT NULL,
    detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. Autonomy Policies
CREATE TABLE IF NOT EXISTS autonomy_policies (
    id TEXT PRIMARY KEY,
    subsystem TEXT NOT NULL UNIQUE,
    level TEXT NOT NULL DEFAULT 'L1', -- L0_INFORMATIONAL, L1_RECOMMENDATION, L2_ASSISTED_ACTION, L3_CONDITIONAL_LIMITS, L4_RESTRICTED_AUTONOMOUS, L5_RESEARCH_ONLY
    allowed_tools JSONB NOT NULL DEFAULT '[]'::jsonb,
    forbidden_tools JSONB NOT NULL DEFAULT '[]'::jsonb,
    risk_limits JSONB NOT NULL DEFAULT '{}'::jsonb,
    requires_approval BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexing for performance
CREATE INDEX IF NOT EXISTS idx_net_rel_source ON network_relationships(source_entity_id);
CREATE INDEX IF NOT EXISTS idx_net_rel_target ON network_relationships(target_entity_id);
CREATE INDEX IF NOT EXISTS idx_match_rec_farmer ON match_recommendations(farmer_id);
CREATE INDEX IF NOT EXISTS idx_match_rec_buyer ON match_recommendations(buyer_id);
CREATE INDEX IF NOT EXISTS idx_liquidity_region ON liquidity_metrics(region);
CREATE INDEX IF NOT EXISTS idx_opp_entity ON opportunities(entity_id);
CREATE INDEX IF NOT EXISTS idx_res_list_type ON resource_listings(resource_type);
CREATE INDEX IF NOT EXISTS idx_exp_exp_user ON experiment_exposures(user_id);
CREATE INDEX IF NOT EXISTS idx_risk_events_region ON network_risk_events(region);

-- Row Level Security (RLS) Policies
ALTER TABLE network_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE network_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE liquidity_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendation_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiment_exposures ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE network_risk_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE autonomy_policies ENABLE ROW LEVEL SECURITY;

-- Allow authenticated read/write
CREATE POLICY rls_net_entities_all ON network_entities FOR ALL USING (true);
CREATE POLICY rls_net_relationships_all ON network_relationships FOR ALL USING (true);
CREATE POLICY rls_match_rec_all ON match_recommendations FOR ALL USING (true);
CREATE POLICY rls_liquidity_all ON liquidity_metrics FOR ALL USING (true);
CREATE POLICY rls_opp_all ON opportunities FOR ALL USING (true);
CREATE POLICY rls_res_list_all ON resource_listings FOR ALL USING (true);
CREATE POLICY rls_res_match_all ON resource_matches FOR ALL USING (true);
CREATE POLICY rls_rec_outcomes_all ON recommendation_outcomes FOR ALL USING (true);
CREATE POLICY rls_experiments_all ON experiments FOR ALL USING (true);
CREATE POLICY rls_exp_exposures_all ON experiment_exposures FOR ALL USING (true);
CREATE POLICY rls_model_reg_all ON model_registry FOR ALL USING (true);
CREATE POLICY rls_model_vers_all ON model_versions FOR ALL USING (true);
CREATE POLICY rls_risk_events_all ON network_risk_events FOR ALL USING (true);
CREATE POLICY rls_autonomy_pol_all ON autonomy_policies FOR ALL USING (true);
