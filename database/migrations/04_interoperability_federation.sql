-- Migration 04: Agricultural Interoperability, DPI, & Federation
-- Phase 11: Machine-readable data contracts, consent management, policy-based access control,
-- federation adapters, developer platform, webhooks, canonical mappings, research access.

CREATE TABLE IF NOT EXISTS data_contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_name VARCHAR(100) NOT NULL,
    schema_version VARCHAR(20) NOT NULL DEFAULT 'v1.0',
    entity_version VARCHAR(20) NOT NULL DEFAULT '1.0.0',
    json_schema JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (contract_name, schema_version)
);

CREATE TABLE IF NOT EXISTS consent_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    data_owner_id UUID NOT NULL, -- Farmer / Subject user ID
    data_subject_type VARCHAR(50) DEFAULT 'FARMER',
    data_category VARCHAR(50) NOT NULL CHECK (data_category IN ('PERSONAL', 'FARM_LOCATION', 'CULTIVATION', 'FINANCIAL', 'MARKETPLACE', 'RESEARCH')),
    purpose VARCHAR(255) NOT NULL,
    recipient_id VARCHAR(100) NOT NULL, -- Developer App / Partner / Researcher ID
    scope VARCHAR(50) NOT NULL CHECK (scope IN ('PUBLIC', 'COMMUNITY', 'COMMERCIAL', 'RESEARCH', 'PRIVATE', 'REGULATED')),
    status VARCHAR(20) NOT NULL DEFAULT 'GRANTED' CHECK (status IN ('GRANTED', 'REVOKED', 'EXPIRED')),
    granted_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS data_access_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id VARCHAR(100) NOT NULL,
    requester_role VARCHAR(50) NOT NULL,
    endpoint VARCHAR(255) NOT NULL,
    scope VARCHAR(50) NOT NULL,
    consent_record_id UUID REFERENCES consent_records(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL,
    records_accessed INT DEFAULT 1,
    ip_address VARCHAR(50),
    user_agent TEXT,
    accessed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS data_exchange_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exchange_id VARCHAR(100) NOT NULL UNIQUE,
    origin_system VARCHAR(100) NOT NULL,
    destination_system VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    records_count INT NOT NULL DEFAULT 1,
    schema_version VARCHAR(20) NOT NULL DEFAULT 'v1.0',
    quality_score NUMERIC(3, 2) DEFAULT 0.95,
    provenance_id VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'SUCCESS' CHECK (status IN ('SUCCESS', 'REJECTED', 'PARTIAL')),
    occurred_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS federation_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id VARCHAR(100) NOT NULL UNIQUE,
    provider_name VARCHAR(255) NOT NULL,
    provider_type VARCHAR(50) NOT NULL CHECK (provider_type IN ('AGRICULTURAL', 'MARKET_DATA', 'WEATHER_DATA', 'RESEARCH_DATA')),
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'MAINTENANCE', 'UNCONFIGURED')),
    capabilities JSONB DEFAULT '[]'::jsonb,
    schema_version VARCHAR(20) DEFAULT 'v1.0',
    last_sync TIMESTAMPTZ,
    coverage_geography VARCHAR(100) DEFAULT 'INDIA_NATIONAL',
    license VARCHAR(100) DEFAULT 'OPEN_DATA',
    authentication_method VARCHAR(50) DEFAULT 'OAUTH2_BEARER',
    is_configured BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS developer_apps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    app_id VARCHAR(100) NOT NULL UNIQUE,
    developer_id UUID NOT NULL,
    app_name VARCHAR(150) NOT NULL,
    organization VARCHAR(255),
    app_type VARCHAR(50) DEFAULT 'AGRITECH_SANDBOX' CHECK (app_type IN ('PRODUCTION', 'AGRITECH_SANDBOX', 'RESEARCH')),
    allowed_scopes JSONB DEFAULT '["public"]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS api_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    app_id VARCHAR(100) NOT NULL REFERENCES developer_apps(app_id) ON DELETE CASCADE,
    client_id VARCHAR(100) NOT NULL UNIQUE,
    secret_hash TEXT NOT NULL, -- SHA-256 / bcrypt hashed secret, never plaintext
    key_prefix VARCHAR(10) NOT NULL,
    is_revoked BOOLEAN DEFAULT false,
    last_used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS api_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id VARCHAR(100) NOT NULL REFERENCES api_credentials(client_id) ON DELETE CASCADE,
    endpoint VARCHAR(255) NOT NULL,
    status_code INT NOT NULL,
    response_time_ms INT NOT NULL,
    bytes_transferred INT DEFAULT 0,
    requested_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS webhooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    app_id VARCHAR(100) NOT NULL REFERENCES developer_apps(app_id) ON DELETE CASCADE,
    target_url TEXT NOT NULL,
    secret_hash TEXT NOT NULL,
    event_subscriptions JSONB NOT NULL DEFAULT '["listing.created", "order.created"]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS webhook_deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    webhook_id UUID NOT NULL REFERENCES webhooks(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    event_id VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    http_status INT,
    attempt INT DEFAULT 1,
    status VARCHAR(20) DEFAULT 'DELIVERED' CHECK (status IN ('PENDING', 'DELIVERED', 'FAILED', 'DEAD_LETTER')),
    delivered_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS canonical_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mapping_type VARCHAR(50) NOT NULL CHECK (mapping_type IN ('COMMODITY', 'CROP', 'UNIT', 'GEOGRAPHY', 'MARKET', 'GRADE')),
    canonical_code VARCHAR(100) NOT NULL,
    external_system VARCHAR(100) NOT NULL,
    external_code VARCHAR(100) NOT NULL,
    effective_from DATE DEFAULT CURRENT_DATE,
    effective_to DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (mapping_type, canonical_code, external_system)
);

CREATE TABLE IF NOT EXISTS research_access_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    researcher_id UUID NOT NULL,
    institution VARCHAR(255) NOT NULL,
    purpose TEXT NOT NULL,
    requested_datasets JSONB NOT NULL,
    requested_geographies JSONB NOT NULL,
    requested_time_start DATE NOT NULL,
    requested_time_end DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'APPROVED' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    approved_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE data_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_access_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE federation_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE developer_apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE canonical_mappings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read active data contracts" ON data_contracts FOR SELECT USING (is_active = true);
CREATE POLICY "Public read federation providers" ON federation_providers FOR SELECT USING (true);
CREATE POLICY "Public read canonical mappings" ON canonical_mappings FOR SELECT USING (true);
CREATE POLICY "Owners manage consent" ON consent_records FOR ALL USING (auth.uid() = data_owner_id);
