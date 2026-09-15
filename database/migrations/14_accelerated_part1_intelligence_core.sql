-- AgriMark Accelerated Build Part 1: National Agricultural Intelligence Core Migration

-- 1. National Intelligence Queries Log
CREATE TABLE IF NOT EXISTS national_intelligence_queries (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    query_text TEXT NOT NULL,
    domain_scope TEXT[] DEFAULT ARRAY['policy', 'research', 'digital_twin', 'simulation'],
    ai_response_summary TEXT NOT NULL,
    evidence_claims_count INT DEFAULT 0,
    provenance_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Unified Evidence Index (Cross-Domain Search View / Auxiliary Table)
CREATE TABLE IF NOT EXISTS unified_evidence_index (
    id TEXT PRIMARY KEY,
    domain TEXT NOT NULL CHECK (domain IN ('POLICY', 'RESEARCH', 'DIGITAL_TWIN', 'SIMULATION')),
    claim_summary TEXT NOT NULL,
    source_reference TEXT NOT NULL,
    source_url TEXT,
    confidence_score NUMERIC CHECK (confidence_score BETWEEN 0 AND 1),
    evidence_level TEXT NOT NULL,
    data_origin TEXT DEFAULT 'LIVE_OPERATIONAL' CHECK (data_origin IN ('LIVE_OPERATIONAL', 'SIMULATION', 'STAGING', 'SYNTHETIC')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Cross Domain Provenance Audit Logs
CREATE TABLE IF NOT EXISTS cross_domain_provenance_logs (
    id TEXT PRIMARY KEY,
    query_id TEXT REFERENCES national_intelligence_queries(id) ON DELETE CASCADE,
    policy_doc_ids JSONB DEFAULT '[]'::jsonb,
    paper_dois JSONB DEFAULT '[]'::jsonb,
    model_version TEXT NOT NULL,
    dataset_version TEXT NOT NULL,
    retrieved_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_intel_queries_user ON national_intelligence_queries(user_id);
CREATE INDEX IF NOT EXISTS idx_evidence_idx_domain ON unified_evidence_index(domain);

-- ROW LEVEL SECURITY
ALTER TABLE national_intelligence_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE unified_evidence_index ENABLE ROW LEVEL SECURITY;
ALTER TABLE cross_domain_provenance_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY intel_queries_read ON national_intelligence_queries FOR SELECT USING (true);
CREATE POLICY evidence_idx_read ON unified_evidence_index FOR SELECT USING (true);
CREATE POLICY prov_logs_read ON cross_domain_provenance_logs FOR SELECT USING (true);
