"""
Migration 020: Stage 29 Global Trade, Circular Economy, Climate & National Resilience OS
"""

from alembic import op
import sqlalchemy as sa

def upgrade():
    op.execute("""
    CREATE TABLE IF NOT EXISTS global_trade_corridors (
        id VARCHAR(36) PRIMARY KEY,
        corridor_code VARCHAR(100) NOT NULL UNIQUE,
        origin_country VARCHAR(100) DEFAULT 'India',
        destination_country VARCHAR(100) NOT NULL,
        commodity VARCHAR(100) NOT NULL,
        import_duty_pct DECIMAL(5, 2) DEFAULT 0.0,
        quality_standard VARCHAR(100),
        landed_cost_usd_per_mt DECIMAL(10, 2) NOT NULL,
        competitiveness_score DECIMAL(5, 2) DEFAULT 88.5,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    """)

    op.execute("""
    CREATE TABLE IF NOT EXISTS product_passports (
        id VARCHAR(36) PRIMARY KEY,
        passport_code VARCHAR(100) NOT NULL UNIQUE,
        batch_ref VARCHAR(100) NOT NULL,
        crop_name VARCHAR(100) NOT NULL,
        origin_farm VARCHAR(100) NOT NULL,
        sustainability_cert VARCHAR(100),
        carbon_footprint_kg_co2_per_kg DECIMAL(6, 3),
        traceability_hash VARCHAR(128) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    """)

    op.execute("""
    CREATE TABLE IF NOT EXISTS circular_marketplaces (
        id VARCHAR(36) PRIMARY KEY,
        flow_code VARCHAR(100) NOT NULL UNIQUE,
        waste_source_type VARCHAR(50) NOT NULL, -- CROP_RESIDUE, ANIMAL_WASTE, FOOD_WASTE, PROCESSING_WASTE
        quantity_mt DECIMAL(10, 2) NOT NULL,
        destination_product VARCHAR(50) NOT NULL, -- COMPOST, BIOFERTILIZER, BIOGAS, CBG, ANIMAL_FEED, BIOMATERIALS
        processor_name VARCHAR(150) NOT NULL,
        circular_value_inr DECIMAL(12, 2) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    """)

    op.execute("""
    CREATE TABLE IF NOT EXISTS disaster_events (
        id VARCHAR(36) PRIMARY KEY,
        event_code VARCHAR(100) NOT NULL UNIQUE,
        hazard_type VARCHAR(50) NOT NULL, -- HEAT, DROUGHT, FLOOD, CYCLONE, EXTREME_RAINFALL, PEST_AMPLIFICATION
        affected_district VARCHAR(100) NOT NULL,
        severity_level VARCHAR(20) DEFAULT 'HIGH',
        lifecycle_stage VARCHAR(30) DEFAULT 'DETECTED', -- DETECTED, CONFIRMED, ALERT, RESPONSE, RECOVERY, CLOSED
        estimated_crop_loss_ha DECIMAL(10, 2),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    """)

def downgrade():
    pass
