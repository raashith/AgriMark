-- Migration 05: Agricultural Trust, Finance, and Commerce Intelligence
-- Phase 12: Trust score framework, quality assaying, dispute lifecycle, farmer economics,
-- credit & insurance intelligence, payment provider abstractions, reconciliation, and farmer outcomes.

CREATE TABLE IF NOT EXISTS trust_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id VARCHAR(100) NOT NULL, -- Farmer, Buyer, FPO, or Provider ID
    entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN ('FARMER', 'BUYER', 'FPO', 'LOGISTICS', 'QUALITY_PROVIDER')),
    trust_score NUMERIC(5, 2) NOT NULL CHECK (trust_score BETWEEN 0 AND 100),
    score_version VARCHAR(20) DEFAULT 'v1.0',
    confidence NUMERIC(3, 2) DEFAULT 0.90 CHECK (confidence BETWEEN 0 AND 1),
    identity_verified BOOLEAN DEFAULT false,
    farm_verified BOOLEAN DEFAULT false,
    fulfillment_rate NUMERIC(5, 2) DEFAULT 100.0,
    quality_consistency_score NUMERIC(5, 2) DEFAULT 95.0,
    dispute_free_rate NUMERIC(5, 2) DEFAULT 100.0,
    evidence JSONB DEFAULT '[]'::jsonb,
    last_updated TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quality_inspections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inspection_code VARCHAR(100) NOT NULL UNIQUE,
    lot_id VARCHAR(100) NOT NULL,
    inspector_id VARCHAR(100) NOT NULL,
    inspector_name VARCHAR(255) NOT NULL,
    inspection_method VARCHAR(50) NOT NULL CHECK (inspection_method IN ('DIGITAL_NIR_SCANNER', 'LAB_CHEMICAL_ANALYSIS', 'MANUAL_PHYSICAL_INSPECTION')),
    moisture_percent NUMERIC(4, 2),
    purity_percent NUMERIC(5, 2),
    grade VARCHAR(50) NOT NULL,
    size_mm NUMERIC(5, 2),
    color_grade VARCHAR(50),
    contaminants_ppm NUMERIC(6, 2) DEFAULT 0,
    damage_percent NUMERIC(4, 2) DEFAULT 0,
    storage_condition VARCHAR(100) DEFAULT 'OPTIMAL_DRY',
    certificate_reference_id VARCHAR(100) NOT NULL,
    inspected_at TIMESTAMPTZ DEFAULT NOW(),
    evidence_urls JSONB DEFAULT '[]'::jsonb
);

CREATE TABLE IF NOT EXISTS disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dispute_code VARCHAR(100) NOT NULL UNIQUE,
    order_id VARCHAR(100) NOT NULL,
    complainant_id VARCHAR(100) NOT NULL,
    respondent_id VARCHAR(100) NOT NULL,
    reason VARCHAR(50) NOT NULL CHECK (reason IN ('QUANTITY_MISMATCH', 'QUALITY_MISMATCH', 'LATE_DELIVERY', 'DAMAGED_PRODUCE', 'WRONG_PRODUCT', 'PRICE_DISAGREEMENT', 'PAYMENT_DISPUTE')),
    status VARCHAR(30) NOT NULL DEFAULT 'DISPUTE_OPENED' CHECK (status IN ('DISPUTE_OPENED', 'EVIDENCE_COLLECTION', 'SELLER_RESPONSE', 'BUYER_RESPONSE', 'UNDER_REVIEW', 'RESOLUTION_PROPOSED', 'RESOLVED', 'APPEALED', 'CLOSED')),
    claim_amount_inr NUMERIC(12, 2) NOT NULL,
    resolved_amount_inr NUMERIC(12, 2),
    resolution_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dispute_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dispute_id UUID NOT NULL REFERENCES disputes(id) ON DELETE CASCADE,
    actor_id VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL,
    from_status VARCHAR(30),
    to_status VARCHAR(30) NOT NULL,
    notes TEXT,
    evidence_urls JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS farmer_economic_ledgers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id VARCHAR(100) NOT NULL,
    crop_year VARCHAR(20) NOT NULL,
    commodity_code VARCHAR(50) NOT NULL,
    production_cost_inr NUMERIC(12, 2) DEFAULT 0,
    input_cost_inr NUMERIC(12, 2) DEFAULT 0,
    labor_cost_inr NUMERIC(12, 2) DEFAULT 0,
    irrigation_cost_inr NUMERIC(12, 2) DEFAULT 0,
    transport_cost_inr NUMERIC(12, 2) DEFAULT 0,
    storage_cost_inr NUMERIC(12, 2) DEFAULT 0,
    platform_fees_inr NUMERIC(12, 2) DEFAULT 0,
    sale_revenue_inr NUMERIC(12, 2) DEFAULT 0,
    net_realization_inr NUMERIC(12, 2) GENERATED ALWAYS AS (
        sale_revenue_inr - (production_cost_inr + input_cost_inr + labor_cost_inr + irrigation_cost_inr + transport_cost_inr + storage_cost_inr + platform_fees_inr)
    ) STORED,
    gross_margin_percent NUMERIC(5, 2),
    roi_percent NUMERIC(5, 2),
    calculation_period VARCHAR(50) DEFAULT 'SEASONAL',
    is_synthetic BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS credit_risk_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id VARCHAR(100) NOT NULL,
    risk_band VARCHAR(20) NOT NULL CHECK (risk_band IN ('LOW_RISK', 'MODERATE_RISK', 'HIGH_RISK', 'INSUFFICIENT_DATA')),
    confidence NUMERIC(3, 2) DEFAULT 0.88,
    verified_farm_years INT DEFAULT 0,
    fulfillment_history_score NUMERIC(5, 2) DEFAULT 100.0,
    annual_sales_realization_inr NUMERIC(12, 2) DEFAULT 0,
    evidence JSONB DEFAULT '[]'::jsonb,
    data_gaps JSONB DEFAULT '[]'::jsonb,
    assessed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS insurance_risk_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id VARCHAR(100) NOT NULL,
    commodity_code VARCHAR(50) NOT NULL,
    geography VARCHAR(100) NOT NULL,
    risk_profile VARCHAR(30) NOT NULL CHECK (risk_profile IN ('LOW_HAZARD', 'MODERATE_HAZARD', 'HIGH_HAZARD', 'CRITICAL_HAZARD')),
    hazards JSONB DEFAULT '[]'::jsonb,
    estimated_exposure_inr NUMERIC(12, 2) DEFAULT 0,
    weather_risk_index NUMERIC(3, 2) DEFAULT 0.20,
    historical_yield_variance NUMERIC(5, 2) DEFAULT 10.0,
    assessed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_intent_id VARCHAR(100) NOT NULL UNIQUE,
    order_id VARCHAR(100) NOT NULL,
    payer_id VARCHAR(100) NOT NULL,
    payee_id VARCHAR(100) NOT NULL,
    amount_inr NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    payment_provider VARCHAR(50) NOT NULL DEFAULT 'AGRIMARK_ESCROW',
    idempotency_key VARCHAR(100) NOT NULL UNIQUE,
    status VARCHAR(30) NOT NULL CHECK (status IN ('AUTHORIZED', 'CAPTURED', 'REFUNDED', 'FAILED', 'SETTLED')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS settlement_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    settlement_code VARCHAR(100) NOT NULL UNIQUE,
    payee_id VARCHAR(100) NOT NULL,
    gross_amount_inr NUMERIC(12, 2) NOT NULL,
    deductions_inr NUMERIC(12, 2) DEFAULT 0,
    net_payout_inr NUMERIC(12, 2) NOT NULL,
    status VARCHAR(30) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'PAID', 'FAILED')),
    payout_ref_id VARCHAR(100),
    settled_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS reconciliation_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_code VARCHAR(100) NOT NULL UNIQUE,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    total_transactions_scanned INT NOT NULL,
    total_amount_inr NUMERIC(14, 2) NOT NULL,
    mismatches_count INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'MATCHED' CHECK (status IN ('MATCHED', 'MISMATCH_DETECTED', 'RESOLVED')),
    run_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reconciliation_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reconciliation_run_id UUID REFERENCES reconciliation_runs(id) ON DELETE CASCADE,
    transaction_id VARCHAR(100) NOT NULL,
    issue_type VARCHAR(50) NOT NULL CHECK (issue_type IN ('MISSING_PAYMENT', 'DUPLICATE_PAYMENT', 'AMOUNT_MISMATCH', 'FAILED_PAYOUT', 'UNMATCHED_SETTLEMENT')),
    expected_amount_inr NUMERIC(12, 2) NOT NULL,
    actual_amount_inr NUMERIC(12, 2) NOT NULL,
    discrepancy_inr NUMERIC(12, 2) GENERATED ALWAYS AS (actual_amount_inr - expected_amount_inr) STORED,
    status VARCHAR(20) DEFAULT 'UNRESOLVED' CHECK (status IN ('UNRESOLVED', 'RESOLVED'))
);

CREATE TABLE IF NOT EXISTS farmer_outcomes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id VARCHAR(100) NOT NULL,
    measurement_period VARCHAR(50) NOT NULL,
    baseline_income_inr NUMERIC(12, 2) NOT NULL,
    achieved_income_inr NUMERIC(12, 2) NOT NULL,
    income_increase_percent NUMERIC(5, 2) GENERATED ALWAYS AS (
        CASE WHEN baseline_income_inr > 0 THEN ((achieved_income_inr - baseline_income_inr) / baseline_income_inr) * 100 ELSE 0 END
    ) STORED,
    post_harvest_loss_reduction_percent NUMERIC(5, 2) DEFAULT 0,
    price_realization_improvement_percent NUMERIC(5, 2) DEFAULT 0,
    evidence JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE trust_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE farmer_economic_ledgers ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE settlement_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read trust scores" ON trust_scores FOR SELECT USING (true);
CREATE POLICY "Users view own ledgers" ON farmer_economic_ledgers FOR SELECT USING (farmer_id = auth.uid()::text);
CREATE POLICY "Users view own payment transactions" ON payment_transactions FOR SELECT USING (payer_id = auth.uid()::text OR payee_id = auth.uid()::text);
