"""
Migration 016: Stage 25 Farmer Outcome Economics & AI Impact OS
"""

from alembic import op
import sqlalchemy as sa

def upgrade():
    # 1. Farmer Economic Profiles & Periods
    op.execute("""
    CREATE TABLE IF NOT EXISTS farmer_economic_profiles (
        id VARCHAR(36) PRIMARY KEY,
        farmer_ref VARCHAR(100) NOT NULL UNIQUE,
        farm_ref VARCHAR(100) NOT NULL,
        season VARCHAR(50) NOT NULL,
        gross_revenue_inr DECIMAL(12, 2) DEFAULT 0.00,
        gross_cost_inr DECIMAL(12, 2) DEFAULT 0.00,
        net_farm_income_inr DECIMAL(12, 2) DEFAULT 0.00,
        profit_margin_pct DECIMAL(5, 2) DEFAULT 0.00,
        cost_breakdown JSON,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
    """)

    # 2. Farm Baselines & Outcome Interventions
    op.execute("""
    CREATE TABLE IF NOT EXISTS farm_baselines (
        id VARCHAR(36) PRIMARY KEY,
        farmer_ref VARCHAR(100) NOT NULL,
        crop_name VARCHAR(100) NOT NULL,
        baseline_yield_per_acre DECIMAL(10, 2) NOT NULL,
        baseline_net_income_inr DECIMAL(12, 2) NOT NULL,
        baseline_water_use_l_per_acre DECIMAL(12, 2),
        baseline_fertilizer_cost_inr DECIMAL(10, 2),
        recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    """)

    op.execute("""
    CREATE TABLE IF NOT EXISTS outcome_interventions (
        id VARCHAR(36) PRIMARY KEY,
        intervention_code VARCHAR(100) NOT NULL UNIQUE,
        farmer_ref VARCHAR(100) NOT NULL,
        intervention_type VARCHAR(50) NOT NULL, -- PRICE_ADVISORY, PEST_WARNING, IRRIGATION_REC, FPO_AGGREGATION, etc.
        recommendation TEXT NOT NULL,
        confidence_score DECIMAL(5, 4) DEFAULT 0.95,
        action_taken VARCHAR(20) DEFAULT 'YES', -- YES, NO, PARTIAL
        non_adoption_reason VARCHAR(100),
        intervention_date DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 3. Outcome Measurements & Evidence
    op.execute("""
    CREATE TABLE IF NOT EXISTS outcome_measurements (
        id VARCHAR(36) PRIMARY KEY,
        intervention_id VARCHAR(36) NOT NULL,
        farmer_ref VARCHAR(100) NOT NULL,
        metric_name VARCHAR(50) NOT NULL, -- NET_INCOME, YIELD, COST_SAVINGS, WATER_SAVINGS, AVOIDED_LOSS
        value DECIMAL(12, 2) NOT NULL,
        evidence_status VARCHAR(30) DEFAULT 'OBSERVED', -- OBSERVED, VERIFIED_OBSERVED, SELF_REPORTED, ESTIMATED, ATTRIBUTED, PROJECTED, SIMULATED
        confidence DECIMAL(5, 4) DEFAULT 0.90,
        provenance JSON,
        measured_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (intervention_id) REFERENCES outcome_interventions(id) ON DELETE CASCADE
    );
    """)

    # 4. Counterfactual Evaluations & Attributions
    op.execute("""
    CREATE TABLE IF NOT EXISTS counterfactual_evaluations (
        id VARCHAR(36) PRIMARY KEY,
        evaluation_code VARCHAR(100) NOT NULL UNIQUE,
        method VARCHAR(50) NOT NULL, -- DIFF_IN_DIFF, MATCHED_CONTROL, PROPENSITY_SCORE, SYNTHETIC_CONTROL
        treatment_group_size INT NOT NULL,
        control_group_size INT NOT NULL,
        estimated_effect_inr DECIMAL(12, 2) NOT NULL,
        confidence_interval JSON,
        causal_claim_valid BOOLEAN DEFAULT TRUE,
        evaluated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 5. Model Economic Outcomes & AI Cost Metrics
    op.execute("""
    CREATE TABLE IF NOT EXISTS model_economic_outcomes (
        id VARCHAR(36) PRIMARY KEY,
        model_code VARCHAR(100) NOT NULL,
        model_version VARCHAR(50) NOT NULL,
        prediction_accuracy DECIMAL(5, 2),
        observed_farmer_income_impact_inr DECIMAL(12, 2) NOT NULL,
        economic_champion_status VARCHAR(20) DEFAULT 'CHAMPION',
        evaluated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    """)

    op.execute("""
    CREATE TABLE IF NOT EXISTS ai_cost_metrics (
        id VARCHAR(36) PRIMARY KEY,
        intervention_id VARCHAR(36) NOT NULL,
        inference_cost_inr DECIMAL(10, 4) DEFAULT 0.1000,
        net_farmer_benefit_inr DECIMAL(12, 2) NOT NULL,
        roi_ratio DECIMAL(8, 2) DEFAULT 0.00,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 6. Disparity & Anomaly Metrics
    op.execute("""
    CREATE TABLE IF NOT EXISTS outcome_fairness_metrics (
        id VARCHAR(36) PRIMARY KEY,
        segment_type VARCHAR(50) NOT NULL, -- SMALLHOLDER, MARGINAL, RAINFED, IRRIGATED, FEMALE_FARMER
        smallholder_benefit_inr DECIMAL(12, 2) NOT NULL,
        large_farmer_benefit_inr DECIMAL(12, 2) NOT NULL,
        disparity_ratio DECIMAL(5, 2) DEFAULT 1.00,
        evaluated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    """)

    op.execute("""
    CREATE TABLE IF NOT EXISTS impact_anomalies (
        id VARCHAR(36) PRIMARY KEY,
        farmer_ref VARCHAR(100) NOT NULL,
        anomaly_type VARCHAR(50) NOT NULL, -- IMPOSSIBLE_YIELD, IMPOSSIBLE_PRICE, DUPLICATE_OUTCOME
        severity VARCHAR(20) DEFAULT 'HIGH',
        status VARCHAR(20) DEFAULT 'FLAGGED',
        detected_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    """)

def downgrade():
    pass
