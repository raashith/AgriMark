-- AgriMark Phase 18: Policy, Scheme & Governance Intelligence OS Migration

-- 1. Policy Documents & Versioning
CREATE TABLE IF NOT EXISTS policy_documents (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    full_source TEXT,
    source_url TEXT NOT NULL,
    publisher TEXT NOT NULL,
    publication_date TIMESTAMPTZ NOT NULL,
    effective_from TIMESTAMPTZ NOT NULL,
    effective_to TIMESTAMPTZ,
    jurisdiction TEXT NOT NULL, -- National, State, District, Local
    state TEXT,
    language TEXT NOT NULL DEFAULT 'en',
    document_hash TEXT NOT NULL,
    retrieved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    version INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS policy_versions (
    id TEXT PRIMARY KEY,
    policy_id TEXT NOT NULL REFERENCES policy_documents(id) ON DELETE CASCADE,
    version INTEGER NOT NULL,
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    changed_fields JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS policy_sections (
    id TEXT PRIMARY KEY,
    policy_id TEXT NOT NULL REFERENCES policy_documents(id) ON DELETE CASCADE,
    section_number TEXT NOT NULL,
    heading TEXT NOT NULL,
    content TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS policy_topics (
    id TEXT PRIMARY KEY,
    policy_id TEXT NOT NULL REFERENCES policy_documents(id) ON DELETE CASCADE,
    topic TEXT NOT NULL
);

-- 2. Government Schemes & Rules
CREATE TABLE IF NOT EXISTS government_schemes (
    id TEXT PRIMARY KEY,
    scheme_id TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    jurisdiction TEXT NOT NULL, -- National, State
    state TEXT,
    department TEXT NOT NULL,
    category TEXT NOT NULL,
    target_beneficiaries JSONB NOT NULL DEFAULT '[]'::jsonb,
    benefit_type TEXT NOT NULL,
    benefit_value TEXT NOT NULL,
    eligibility_summary TEXT NOT NULL,
    application_method TEXT NOT NULL,
    application_window TEXT NOT NULL,
    official_source TEXT NOT NULL,
    source_url TEXT NOT NULL,
    effective_from TIMESTAMPTZ NOT NULL,
    effective_to TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, UPCOMING, EXPIRED, SUSPENDED, UNKNOWN
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS scheme_versions (
    id TEXT PRIMARY KEY,
    scheme_id TEXT NOT NULL REFERENCES government_schemes(id) ON DELETE CASCADE,
    version INTEGER NOT NULL,
    changes JSONB NOT NULL DEFAULT '{}'::jsonb,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS scheme_rules (
    id TEXT PRIMARY KEY,
    scheme_id TEXT NOT NULL REFERENCES government_schemes(id) ON DELETE CASCADE,
    rule_key TEXT NOT NULL,
    operator TEXT NOT NULL,
    value JSONB NOT NULL,
    description TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS scheme_benefits (
    id TEXT PRIMARY KEY,
    scheme_id TEXT NOT NULL REFERENCES government_schemes(id) ON DELETE CASCADE,
    benefit_description TEXT NOT NULL,
    max_amount_inr NUMERIC,
    unit TEXT
);

CREATE TABLE IF NOT EXISTS scheme_documents (
    id TEXT PRIMARY KEY,
    scheme_id TEXT NOT NULL REFERENCES government_schemes(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL,
    is_mandatory BOOLEAN NOT NULL DEFAULT TRUE,
    description TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS scheme_deadlines (
    id TEXT PRIMARY KEY,
    scheme_id TEXT NOT NULL REFERENCES government_schemes(id) ON DELETE CASCADE,
    deadline_type TEXT NOT NULL,
    deadline_date TIMESTAMPTZ NOT NULL,
    alert_level TEXT NOT NULL DEFAULT 'REMINDER'
);

-- 3. Eligibility & Document Readiness
CREATE TABLE IF NOT EXISTS eligibility_evaluations (
    id TEXT PRIMARY KEY,
    farmer_id TEXT NOT NULL,
    scheme_id TEXT NOT NULL REFERENCES government_schemes(id) ON DELETE CASCADE,
    status TEXT NOT NULL, -- ELIGIBLE, POSSIBLY_ELIGIBLE, NOT_ELIGIBLE, INSUFFICIENT_INFORMATION
    matched_rules JSONB NOT NULL DEFAULT '[]'::jsonb,
    failed_rules JSONB NOT NULL DEFAULT '[]'::jsonb,
    missing_info JSONB NOT NULL DEFAULT '[]'::jsonb,
    confidence NUMERIC NOT NULL DEFAULT 0.90,
    evaluated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS eligibility_evidence (
    id TEXT PRIMARY KEY,
    evaluation_id TEXT NOT NULL REFERENCES eligibility_evaluations(id) ON DELETE CASCADE,
    source TEXT NOT NULL,
    version TEXT NOT NULL,
    effective_date TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS document_readiness (
    id TEXT PRIMARY KEY,
    farmer_id TEXT NOT NULL,
    document_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'MISSING', -- READY, PARTIAL, BLOCKED, MISSING, EXPIRED
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    verified_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS scheme_readiness (
    id TEXT PRIMARY KEY,
    farmer_id TEXT NOT NULL,
    scheme_id TEXT NOT NULL REFERENCES government_schemes(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'PARTIAL', -- READY, PARTIAL, BLOCKED, UNKNOWN
    readiness_pct NUMERIC NOT NULL DEFAULT 0,
    missing_documents JSONB NOT NULL DEFAULT '[]'::jsonb,
    evaluated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Policy Changes & Compliance
CREATE TABLE IF NOT EXISTS policy_change_events (
    id TEXT PRIMARY KEY,
    policy_id TEXT NOT NULL,
    old_version INTEGER NOT NULL,
    new_version INTEGER NOT NULL,
    changed_fields JSONB NOT NULL DEFAULT '[]'::jsonb,
    source_url TEXT NOT NULL,
    effective_date TIMESTAMPTZ NOT NULL,
    confidence NUMERIC NOT NULL DEFAULT 0.92,
    detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS compliance_requirements (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL, -- FOOD_HANDLING, QUALITY, STORAGE, TRANSPORT, TRACEABILITY, PACKAGING, INPUTS, ORGANIC, EXPORT, ENVIRONMENT
    title TEXT NOT NULL,
    jurisdiction TEXT NOT NULL,
    authority_source TEXT NOT NULL,
    effective_period TEXT NOT NULL,
    applicable_entities JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS compliance_checklists (
    id TEXT PRIMARY KEY,
    farmer_id TEXT NOT NULL,
    checklist_type TEXT NOT NULL,
    item_title TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'OPEN', -- OPEN, IN_PROGRESS, READY, EXPIRED, NOT_APPLICABLE
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fpo_governance_records (
    id TEXT PRIMARY KEY,
    fpo_id TEXT NOT NULL,
    registration_no TEXT NOT NULL,
    member_count INTEGER NOT NULL DEFAULT 0,
    board_directors JSONB NOT NULL DEFAULT '[]'::jsonb,
    compliance_status TEXT NOT NULL DEFAULT 'COMPLIANT',
    audit_date TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Sources, Alerts & Translations
CREATE TABLE IF NOT EXISTS policy_sources (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    source_type TEXT NOT NULL, -- OFFICIAL_PRIMARY, OFFICIAL_SECONDARY, AUTHORIZED_PROVIDER, RESEARCH, COMMERCIAL, USER_PROVIDED, AI_SUMMARY
    url TEXT NOT NULL,
    trust_rank INTEGER NOT NULL DEFAULT 1,
    verification_status TEXT NOT NULL DEFAULT 'VERIFIED_PRIMARY', -- VERIFIED_PRIMARY, VERIFIED_SECONDARY, UNVERIFIED, STALE, CONFLICTING
    checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS policy_alerts (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    alert_type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    read_status BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS policy_translations (
    id TEXT PRIMARY KEY,
    policy_id TEXT NOT NULL REFERENCES policy_documents(id) ON DELETE CASCADE,
    source_language TEXT NOT NULL DEFAULT 'en',
    translated_language TEXT NOT NULL,
    translated_text TEXT NOT NULL,
    translation_version TEXT NOT NULL DEFAULT 'v1.0',
    review_status TEXT NOT NULL DEFAULT 'REVIEWED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_policy_doc_jurisdiction ON policy_documents(jurisdiction, state);
CREATE INDEX IF NOT EXISTS idx_gov_schemes_status ON government_schemes(status, jurisdiction);
CREATE INDEX IF NOT EXISTS idx_eligibility_farmer ON eligibility_evaluations(farmer_id, scheme_id);
CREATE INDEX IF NOT EXISTS idx_doc_readiness_farmer ON document_readiness(farmer_id);
CREATE INDEX IF NOT EXISTS idx_compliance_req_cat ON compliance_requirements(category);
CREATE INDEX IF NOT EXISTS idx_policy_sources_type ON policy_sources(source_type);

-- Row Level Security (RLS)
ALTER TABLE policy_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE government_schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheme_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheme_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheme_benefits ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheme_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheme_deadlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE eligibility_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE eligibility_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_readiness ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheme_readiness ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_change_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE fpo_governance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_translations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY rls_policy_docs_all ON policy_documents FOR ALL USING (true);
CREATE POLICY rls_policy_versions_all ON policy_versions FOR ALL USING (true);
CREATE POLICY rls_policy_sections_all ON policy_sections FOR ALL USING (true);
CREATE POLICY rls_policy_topics_all ON policy_topics FOR ALL USING (true);
CREATE POLICY rls_gov_schemes_all ON government_schemes FOR ALL USING (true);
CREATE POLICY rls_scheme_versions_all ON scheme_versions FOR ALL USING (true);
CREATE POLICY rls_scheme_rules_all ON scheme_rules FOR ALL USING (true);
CREATE POLICY rls_scheme_benefits_all ON scheme_benefits FOR ALL USING (true);
CREATE POLICY rls_scheme_documents_all ON scheme_documents FOR ALL USING (true);
CREATE POLICY rls_scheme_deadlines_all ON scheme_deadlines FOR ALL USING (true);
CREATE POLICY rls_eligibility_evals_all ON eligibility_evaluations FOR ALL USING (true);
CREATE POLICY rls_eligibility_evidence_all ON eligibility_evidence FOR ALL USING (true);
CREATE POLICY rls_doc_readiness_all ON document_readiness FOR ALL USING (true);
CREATE POLICY rls_scheme_readiness_all ON scheme_readiness FOR ALL USING (true);
CREATE POLICY rls_policy_change_events_all ON policy_change_events FOR ALL USING (true);
CREATE POLICY rls_compliance_req_all ON compliance_requirements FOR ALL USING (true);
CREATE POLICY rls_compliance_checklists_all ON compliance_checklists FOR ALL USING (true);
CREATE POLICY rls_fpo_gov_records_all ON fpo_governance_records FOR ALL USING (true);
CREATE POLICY rls_policy_sources_all ON policy_sources FOR ALL USING (true);
CREATE POLICY rls_policy_alerts_all ON policy_alerts FOR ALL USING (true);
CREATE POLICY rls_policy_translations_all ON policy_translations FOR ALL USING (true);
