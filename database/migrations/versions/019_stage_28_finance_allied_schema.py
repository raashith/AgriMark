"""
Migration 019: Stage 28 Finance, Insurance, Allied Agriculture & Rural Economy OS
"""

from alembic import op
import sqlalchemy as sa

def upgrade():
    op.execute("""
    CREATE TABLE IF NOT EXISTS agricultural_finances (
        id VARCHAR(36) PRIMARY KEY,
        credit_application_code VARCHAR(100) NOT NULL UNIQUE,
        farmer_ref VARCHAR(100) NOT NULL,
        finance_product_type VARCHAR(50) NOT NULL, -- WORKING_CAPITAL, CROP_FINANCE, WAREHOUSE_BACKED, TRADE_FINANCE, EQUIPMENT_FINANCE
        requested_amount_inr DECIMAL(12, 2) NOT NULL,
        risk_score DECIMAL(5, 2) NOT NULL,
        liquidity_assessment JSON,
        approval_status VARCHAR(30) DEFAULT 'DECISION_SUPPORT_READY', -- Decision support only, no loan approval
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    """)

    op.execute("""
    CREATE TABLE IF NOT EXISTS crop_insurances (
        id VARCHAR(36) PRIMARY KEY,
        policy_code VARCHAR(100) NOT NULL UNIQUE,
        farmer_ref VARCHAR(100) NOT NULL,
        insurance_type VARCHAR(50) NOT NULL, -- CROP, LIVESTOCK, WEATHER_INDEX, WAREHOUSE_LOGISTICS
        sum_insured_inr DECIMAL(12, 2) NOT NULL,
        premium_inr DECIMAL(10, 2) NOT NULL,
        policy_status VARCHAR(30) DEFAULT 'ACTIVE',
        claim_status VARCHAR(30) DEFAULT 'NO_CLAIM',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    """)

    op.execute("""
    CREATE TABLE IF NOT EXISTS allied_registries (
        id VARCHAR(36) PRIMARY KEY,
        asset_code VARCHAR(100) NOT NULL UNIQUE,
        farmer_ref VARCHAR(100) NOT NULL,
        allied_category VARCHAR(50) NOT NULL, -- LIVESTOCK, DAIRY, POULTRY, FISHERIES, AQUACULTURE, BEEKEEPING, AGROFORESTRY
        head_count_or_scale INT NOT NULL,
        health_status VARCHAR(50) DEFAULT 'HEALTHY',
        monthly_yield_units DECIMAL(10, 2) DEFAULT 0.0,
        yield_unit VARCHAR(30) DEFAULT 'LITERS',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    """)

    op.execute("""
    CREATE TABLE IF NOT EXISTS rural_service_providers (
        id VARCHAR(36) PRIMARY KEY,
        provider_code VARCHAR(100) NOT NULL UNIQUE,
        provider_name VARCHAR(150) NOT NULL,
        service_category VARCHAR(50) NOT NULL, -- VETERINARIAN, AGRONOMIST, DRONE_OPERATOR, MACHINERY, SOIL_TESTING, COLD_STORAGE, TRANSPORT
        district VARCHAR(100) NOT NULL,
        hourly_or_unit_rate_inr DECIMAL(10, 2) NOT NULL,
        verification_status VARCHAR(30) DEFAULT 'VERIFIED',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    """)

def downgrade():
    pass
