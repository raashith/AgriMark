"""
Migration 018: Stage 27 National Logistics, Food Processing & Value Chain OS
"""

from alembic import op
import sqlalchemy as sa

def upgrade():
    op.execute("""
    CREATE TABLE IF NOT EXISTS logistics_networks (
        id VARCHAR(36) PRIMARY KEY,
        facility_code VARCHAR(100) NOT NULL UNIQUE,
        facility_name VARCHAR(150) NOT NULL,
        facility_type VARCHAR(50) NOT NULL, -- PACKHOUSE, WAREHOUSE, COLD_STORAGE, COLLECTION_CENTRE, PROCESSING_PLANT
        district VARCHAR(100) NOT NULL,
        state VARCHAR(100) NOT NULL,
        total_capacity_mt DECIMAL(12, 2) NOT NULL,
        available_capacity_mt DECIMAL(12, 2) NOT NULL,
        cold_chain_capable BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    """)

    op.execute("""
    CREATE TABLE IF NOT EXISTS reefer_transports (
        id VARCHAR(36) PRIMARY KEY,
        vehicle_code VARCHAR(100) NOT NULL UNIQUE,
        transporter_name VARCHAR(150) NOT NULL,
        vehicle_type VARCHAR(50) DEFAULT 'REEFER_TRUCK',
        payload_capacity_mt DECIMAL(10, 2) NOT NULL,
        temperature_range_c VARCHAR(50) DEFAULT '-5C to +15C',
        gps_telemetry_enabled BOOLEAN DEFAULT TRUE,
        status VARCHAR(30) DEFAULT 'AVAILABLE',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    """)

    op.execute("""
    CREATE TABLE IF NOT EXISTS processing_facilities (
        id VARCHAR(36) PRIMARY KEY,
        plant_code VARCHAR(100) NOT NULL UNIQUE,
        plant_name VARCHAR(150) NOT NULL,
        crop_processed VARCHAR(100) NOT NULL,
        processing_type VARCHAR(100) NOT NULL, -- MILLING, DEHYDRATION, CANNING, OIL_EXTRACTION, COLD_PRESSING
        daily_capacity_mt DECIMAL(10, 2) NOT NULL,
        operating_margin_pct DECIMAL(5, 2) DEFAULT 18.5,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    """)

    op.execute("""
    CREATE TABLE IF NOT EXISTS post_harvest_losses (
        id VARCHAR(36) PRIMARY KEY,
        batch_ref VARCHAR(100) NOT NULL,
        crop_name VARCHAR(100) NOT NULL,
        loss_stage VARCHAR(50) NOT NULL, -- HARVEST, TRANSPORT, STORAGE, PROCESSING
        loss_percentage DECIMAL(5, 2) NOT NULL,
        monetary_loss_inr DECIMAL(12, 2) NOT NULL,
        prevention_recommendation TEXT,
        recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    """)

def downgrade():
    pass
