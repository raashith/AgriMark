"""
Migration 014: Stage 23 National Agri-AI Data Commons & Interoperability OS
"""

from alembic import op
import sqlalchemy as sa

def upgrade():
    # 1. Data Providers
    op.execute("""
    CREATE TABLE IF NOT EXISTS data_providers (
        id VARCHAR(36) PRIMARY KEY,
        provider_id VARCHAR(100) NOT NULL UNIQUE,
        name VARCHAR(150) NOT NULL,
        type VARCHAR(50) NOT NULL, -- GOVERNMENT, RESEARCH, FPO, PRIVATE_COMPANY, BANK, INSURER, DEVICE, SATELLITE, etc.
        jurisdiction VARCHAR(100) DEFAULT 'IN',
        ownership VARCHAR(100),
        authority VARCHAR(100),
        contact JSON,
        data_domains JSON,
        api_capabilities JSON,
        trust_level VARCHAR(20) DEFAULT 'UNVERIFIED', -- HIGH, MEDIUM, LOW, UNVERIFIED
        legal_basis VARCHAR(100),
        consent_requirements VARCHAR(100),
        status VARCHAR(20) DEFAULT 'ACTIVE',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
    """)

    # 2. Data Consumers
    op.execute("""
    CREATE TABLE IF NOT EXISTS data_consumers (
        id VARCHAR(36) PRIMARY KEY,
        consumer_id VARCHAR(100) NOT NULL UNIQUE,
        name VARCHAR(150) NOT NULL,
        organization VARCHAR(150),
        purpose_declarations JSON,
        permissions JSON,
        retention_days INT DEFAULT 365,
        allowed_transformations JSON,
        audit_state VARCHAR(20) DEFAULT 'COMPLIANT',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
    """)

    # 3. Data Products
    op.execute("""
    CREATE TABLE IF NOT EXISTS data_products (
        id VARCHAR(36) PRIMARY KEY,
        product_code VARCHAR(100) NOT NULL UNIQUE,
        title VARCHAR(150) NOT NULL,
        owner_id VARCHAR(36) NOT NULL,
        provider_id VARCHAR(36) NOT NULL,
        schema_ref VARCHAR(100) NOT NULL,
        version VARCHAR(20) DEFAULT '1.0.0',
        quality_score DECIMAL(5, 2) DEFAULT 95.0,
        freshness_tier VARCHAR(20) DEFAULT 'HOURLY',
        coverage_geo VARCHAR(100),
        license_type VARCHAR(50) DEFAULT 'RESTRICTED',
        access_policy JSON,
        pricing_model VARCHAR(50) DEFAULT 'FREE',
        provenance_summary TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (provider_id) REFERENCES data_providers(id)
    );
    """)

    # 4. Data Contracts
    op.execute("""
    CREATE TABLE IF NOT EXISTS data_contracts (
        id VARCHAR(36) PRIMARY KEY,
        contract_code VARCHAR(100) NOT NULL UNIQUE,
        provider_id VARCHAR(36) NOT NULL,
        consumer_id VARCHAR(36) NOT NULL,
        product_id VARCHAR(36) NOT NULL,
        purpose VARCHAR(50) NOT NULL, -- ADVISORY, CREDIT, INSURANCE, RESEARCH, POLICY_ANALYSIS, MODEL_TRAINING
        scope JSON,
        fields_allowed JSON,
        geography VARCHAR(100),
        time_range JSON,
        frequency VARCHAR(50) DEFAULT 'ON_DEMAND',
        retention_days INT DEFAULT 90,
        processing_permissions JSON,
        sharing_permissions JSON,
        consent_required BOOLEAN DEFAULT TRUE,
        security_requirements JSON,
        status VARCHAR(20) DEFAULT 'ACTIVE',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (provider_id) REFERENCES data_providers(id),
        FOREIGN KEY (consumer_id) REFERENCES data_consumers(id),
        FOREIGN KEY (product_id) REFERENCES data_products(id)
    );
    """)

    # 5. Data Access Requests
    op.execute("""
    CREATE TABLE IF NOT EXISTS data_access_requests (
        id VARCHAR(36) PRIMARY KEY,
        requester_id VARCHAR(36) NOT NULL,
        purpose VARCHAR(50) NOT NULL,
        dataset_id VARCHAR(36) NOT NULL,
        requested_fields JSON,
        geography VARCHAR(100),
        duration_days INT DEFAULT 30,
        decision VARCHAR(30) DEFAULT 'REQUESTED', -- REQUESTED, UNDER_REVIEW, APPROVED, PARTIALLY_APPROVED, REJECTED, EXPIRED, REVOKED
        reviewer_id VARCHAR(36),
        reason TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
    """)

    # 6. Data Consent Records
    op.execute("""
    CREATE TABLE IF NOT EXISTS data_consent_records (
        id VARCHAR(36) PRIMARY KEY,
        farmer_ref VARCHAR(100) NOT NULL,
        consumer_id VARCHAR(36) NOT NULL,
        data_scope JSON NOT NULL,
        purpose VARCHAR(50) NOT NULL,
        duration_days INT DEFAULT 365,
        status VARCHAR(20) DEFAULT 'GRANTED', -- GRANTED, DENIED, WITHDRAWN, EXPIRED, REVOKED
        granted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        withdrawn_at DATETIME,
        expires_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (consumer_id) REFERENCES data_consumers(id),
        INDEX idx_consent_farmer (farmer_ref, status)
    );
    """)

    # 7. Data Schemas & Schema Versions
    op.execute("""
    CREATE TABLE IF NOT EXISTS data_schemas (
        id VARCHAR(36) PRIMARY KEY,
        schema_name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        domain VARCHAR(50) NOT NULL,
        canonical_version VARCHAR(20) DEFAULT '1.0.0',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    """)

    op.execute("""
    CREATE TABLE IF NOT EXISTS data_schema_versions (
        id VARCHAR(36) PRIMARY KEY,
        schema_id VARCHAR(36) NOT NULL,
        version VARCHAR(20) NOT NULL,
        fields_definition JSON NOT NULL,
        compatibility VARCHAR(20) DEFAULT 'BACKWARD', -- BACKWARD, FORWARD, FULL, NONE
        status VARCHAR(20) DEFAULT 'ACTIVE', -- ACTIVE, DEPRECATED, RETIRED
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (schema_id) REFERENCES data_schemas(id) ON DELETE CASCADE
    );
    """)

    # 8. Data Lineage Nodes & Edges
    op.execute("""
    CREATE TABLE IF NOT EXISTS data_lineage_nodes (
        id VARCHAR(36) PRIMARY KEY,
        node_code VARCHAR(100) NOT NULL UNIQUE,
        name VARCHAR(150) NOT NULL,
        node_type VARCHAR(50) NOT NULL, -- SOURCE, DATASET, TRANSFORM, MODEL, ADVISORY, ACTION
        metadata_payload JSON,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    """)

    op.execute("""
    CREATE TABLE IF NOT EXISTS data_lineage_edges (
        id VARCHAR(36) PRIMARY KEY,
        source_node_id VARCHAR(36) NOT NULL,
        target_node_id VARCHAR(36) NOT NULL,
        transformation_type VARCHAR(50) DEFAULT 'DERIVATION',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (source_node_id) REFERENCES data_lineage_nodes(id) ON DELETE CASCADE,
        FOREIGN KEY (target_node_id) REFERENCES data_lineage_nodes(id) ON DELETE CASCADE
    );
    """)

    # 9. Data Quality Reports & Freshness Policies
    op.execute("""
    CREATE TABLE IF NOT EXISTS data_quality_reports (
        id VARCHAR(36) PRIMARY KEY,
        product_id VARCHAR(36) NOT NULL,
        overall_score DECIMAL(5, 2) NOT NULL,
        completeness_score DECIMAL(5, 2),
        accuracy_score DECIMAL(5, 2),
        timeliness_score DECIMAL(5, 2),
        consistency_score DECIMAL(5, 2),
        validity_score DECIMAL(5, 2),
        quality_flags JSON,
        evaluation_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES data_products(id) ON DELETE CASCADE
    );
    """)

    op.execute("""
    CREATE TABLE IF NOT EXISTS data_freshness_policies (
        id VARCHAR(36) PRIMARY KEY,
        domain_name VARCHAR(50) NOT NULL UNIQUE,
        max_age_seconds INT NOT NULL,
        description VARCHAR(255),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 10. Data Events & Incidents
    op.execute("""
    CREATE TABLE IF NOT EXISTS data_events (
        id VARCHAR(36) PRIMARY KEY,
        event_type VARCHAR(50) NOT NULL,
        version VARCHAR(20) DEFAULT '1.0.0',
        source_system VARCHAR(100) NOT NULL,
        payload JSON NOT NULL,
        trace_id VARCHAR(100),
        emitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_data_events_type (event_type)
    );
    """)

    op.execute("""
    CREATE TABLE IF NOT EXISTS data_incidents (
        id VARCHAR(36) PRIMARY KEY,
        incident_code VARCHAR(100) NOT NULL UNIQUE,
        incident_type VARCHAR(50) NOT NULL, -- POISONING, LEAK, CORRUPTION, SCHEMA_BREAK, QUALITY_FAILURE, CONSENT_FAILURE
        severity VARCHAR(20) DEFAULT 'HIGH', -- CRITICAL, HIGH, MEDIUM, LOW
        affected_product_id VARCHAR(36),
        status VARCHAR(20) DEFAULT 'DETECTED', -- DETECTED, CONTAINED, ASSESSED, REMEDIATED, VERIFIED, CLOSED
        description TEXT,
        remediation_notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
    """)

def downgrade():
    pass
