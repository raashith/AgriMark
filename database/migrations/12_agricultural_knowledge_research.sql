-- AgriMark Phase 19: National Agricultural Knowledge & Research Intelligence OS Migration

-- 1. Knowledge Graph Entities & Relationships
CREATE TABLE IF NOT EXISTS agri_knowledge_entities (
    id TEXT PRIMARY KEY,
    entity_type TEXT NOT NULL, -- CROP, VARIETY, CULTIVAR, SOIL, NUTRIENT, PEST, DISEASE, PATHOGEN, PRACTICE, INPUT, IRRIGATION_METHOD, CLIMATE_CONDITION, WEATHER_EVENT, FARM_OPERATION, PROCESSING_METHOD, STORAGE_METHOD, MARKET, RESEARCH_QUESTION
    name TEXT NOT NULL,
    description TEXT,
    attributes JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS agri_knowledge_relationships (
    id TEXT PRIMARY KEY,
    source_entity_id TEXT NOT NULL REFERENCES agri_knowledge_entities(id) ON DELETE CASCADE,
    target_entity_id TEXT NOT NULL REFERENCES agri_knowledge_entities(id) ON DELETE CASCADE,
    relationship_type TEXT NOT NULL, -- CROP_REQUIRES_SOIL, CROP_AFFECTED_BY_DISEASE, DISEASE_CAUSED_BY, CROP_REQUIRES_NUTRIENT, PRACTICE_IMPROVES, PRACTICE_RISKS, VARIETY_SUITS, CROP_SUITS_CLIMATE, INPUT_USED_FOR, RESEARCH_SUPPORTS, RESEARCH_CONTRADICTS
    confidence NUMERIC NOT NULL DEFAULT 0.90,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS knowledge_evidence (
    id TEXT PRIMARY KEY,
    relationship_id TEXT REFERENCES agri_knowledge_relationships(id) ON DELETE CASCADE,
    claim TEXT NOT NULL,
    evidence_type TEXT NOT NULL, -- PRIMARY_RESEARCH, META_ANALYSIS, SYSTEMATIC_REVIEW, OFFICIAL_RESEARCH, EXPERT_GUIDANCE, OBSERVATIONAL, USER_REPORTED, AI_GENERATED
    source TEXT NOT NULL,
    source_url TEXT NOT NULL,
    publication_date TIMESTAMPTZ NOT NULL,
    confidence NUMERIC NOT NULL DEFAULT 0.90,
    methodology TEXT NOT NULL,
    geographic_scope TEXT NOT NULL,
    crop_scope TEXT NOT NULL,
    limitations TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Research Papers, Authors, Institutions & Citations
CREATE TABLE IF NOT EXISTS research_institutions (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- ICAR, UNIVERSITY, GOVERNMENT_DEPT, PRIVATE_R_D, INTERNATIONAL
    country TEXT NOT NULL DEFAULT 'India',
    website TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS research_authors (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    institution_id TEXT REFERENCES research_institutions(id) ON DELETE SET NULL,
    email TEXT,
    orcid TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS research_papers (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    abstract TEXT NOT NULL,
    journal TEXT NOT NULL,
    publication_date TIMESTAMPTZ NOT NULL,
    doi TEXT NOT NULL UNIQUE,
    url TEXT NOT NULL,
    source TEXT NOT NULL,
    license TEXT NOT NULL DEFAULT 'CC-BY-4.0',
    language TEXT NOT NULL DEFAULT 'en',
    research_method TEXT NOT NULL,
    sample_size INTEGER,
    geography TEXT NOT NULL,
    crop TEXT NOT NULL,
    finding_summary TEXT NOT NULL,
    limitations TEXT,
    version INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS research_citations (
    id TEXT PRIMARY KEY,
    source_paper_id TEXT NOT NULL REFERENCES research_papers(id) ON DELETE CASCADE,
    target_paper_id TEXT NOT NULL REFERENCES research_papers(id) ON DELETE CASCADE,
    relationship_type TEXT NOT NULL DEFAULT 'CITED_BY', -- CITED_BY, REFERENCES, SUPPORTS, CONTRADICTS, EXTENDS
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS research_topics (
    id TEXT PRIMARY KEY,
    paper_id TEXT NOT NULL REFERENCES research_papers(id) ON DELETE CASCADE,
    topic TEXT NOT NULL
);

-- 3. Research Datasets & Quality Reports
CREATE TABLE IF NOT EXISTS research_datasets (
    id TEXT PRIMARY KEY,
    dataset_name TEXT NOT NULL,
    description TEXT NOT NULL,
    provider TEXT NOT NULL,
    license TEXT NOT NULL DEFAULT 'CC-BY-4.0',
    coverage TEXT NOT NULL,
    variables JSONB NOT NULL DEFAULT '[]'::jsonb,
    geography TEXT NOT NULL,
    time_range TEXT NOT NULL,
    resolution TEXT NOT NULL,
    source_url TEXT NOT NULL,
    version TEXT NOT NULL DEFAULT 'v1.0',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dataset_quality_reports (
    id TEXT PRIMARY KEY,
    dataset_id TEXT NOT NULL REFERENCES research_datasets(id) ON DELETE CASCADE,
    completeness_score NUMERIC NOT NULL DEFAULT 95.0,
    missingness_pct NUMERIC NOT NULL DEFAULT 5.0,
    duplicates_count INTEGER NOT NULL DEFAULT 0,
    outliers_count INTEGER NOT NULL DEFAULT 0,
    timeliness_rating TEXT NOT NULL DEFAULT 'CURRENT',
    quality_score NUMERIC NOT NULL DEFAULT 92.5,
    validation_status TEXT NOT NULL DEFAULT 'VALIDATED',
    evaluated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Field Trials & Experiments
CREATE TABLE IF NOT EXISTS trial_sites (
    id TEXT PRIMARY KEY,
    site_name TEXT NOT NULL,
    location TEXT NOT NULL,
    soil_type TEXT NOT NULL,
    climate_zone TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS field_trials (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    site_id TEXT NOT NULL REFERENCES trial_sites(id) ON DELETE CASCADE,
    lead_researcher_id TEXT NOT NULL,
    crop TEXT NOT NULL,
    duration_months INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'IN_PROGRESS', -- PROPOSED, IN_PROGRESS, COMPLETED, VALIDATED
    is_ai_draft BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS trial_protocols (
    id TEXT PRIMARY KEY,
    trial_id TEXT NOT NULL REFERENCES field_trials(id) ON DELETE CASCADE,
    protocol_name TEXT NOT NULL,
    variables JSONB NOT NULL DEFAULT '[]'::jsonb,
    measurement_plan TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS trial_treatments (
    id TEXT PRIMARY KEY,
    trial_id TEXT NOT NULL REFERENCES field_trials(id) ON DELETE CASCADE,
    treatment_name TEXT NOT NULL,
    description TEXT NOT NULL,
    is_control BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS trial_observations (
    id TEXT PRIMARY KEY,
    trial_id TEXT NOT NULL REFERENCES field_trials(id) ON DELETE CASCADE,
    observation_date TIMESTAMPTZ NOT NULL,
    observed_by TEXT NOT NULL,
    notes TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS trial_measurements (
    id TEXT PRIMARY KEY,
    trial_id TEXT NOT NULL REFERENCES field_trials(id) ON DELETE CASCADE,
    metric_name TEXT NOT NULL,
    value NUMERIC NOT NULL,
    unit TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS trial_outcomes (
    id TEXT PRIMARY KEY,
    trial_id TEXT NOT NULL REFERENCES field_trials(id) ON DELETE CASCADE,
    yield_kg_per_ha NUMERIC NOT NULL,
    quality_rating TEXT NOT NULL,
    cost_inr_per_ha NUMERIC NOT NULL,
    finding_summary TEXT NOT NULL
);

-- 5. Research Projects & Collaboration
CREATE TABLE IF NOT EXISTS research_projects (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    institution_id TEXT NOT NULL REFERENCES research_institutions(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS research_teams (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES research_projects(id) ON DELETE CASCADE,
    author_id TEXT NOT NULL REFERENCES research_authors(id) ON DELETE CASCADE,
    role TEXT NOT NULL
);

-- 6. Knowledge Contributions, Conflicts & Consensus
CREATE TABLE IF NOT EXISTS knowledge_contributions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    contribution_type TEXT NOT NULL, -- OBSERVATION, PHOTO, FIELD_RESULT, FARMER_PRACTICE, LOCAL_KNOWLEDGE
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING_REVIEW', -- PENDING_REVIEW, VALIDATED, PARTIALLY_VALIDATED, REJECTED, CONTESTED
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS knowledge_reviews (
    id TEXT PRIMARY KEY,
    contribution_id TEXT NOT NULL REFERENCES knowledge_contributions(id) ON DELETE CASCADE,
    reviewer_id TEXT NOT NULL,
    verdict TEXT NOT NULL,
    comments TEXT,
    reviewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS knowledge_conflicts (
    id TEXT PRIMARY KEY,
    topic TEXT NOT NULL,
    source_a TEXT NOT NULL,
    source_b TEXT NOT NULL,
    conflict_description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'UNDER_REVIEW',
    detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS knowledge_consensus (
    id TEXT PRIMARY KEY,
    topic TEXT NOT NULL UNIQUE,
    evidence_supporting_count INTEGER NOT NULL DEFAULT 0,
    evidence_opposing_count INTEGER NOT NULL DEFAULT 0,
    evidence_uncertain_count INTEGER NOT NULL DEFAULT 0,
    paper_count INTEGER NOT NULL DEFAULT 0,
    method_diversity_rating TEXT NOT NULL DEFAULT 'HIGH',
    geographic_diversity_rating TEXT NOT NULL DEFAULT 'HIGH',
    confidence NUMERIC NOT NULL DEFAULT 0.90,
    calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Knowledge Profiles & Translations
CREATE TABLE IF NOT EXISTS crop_knowledge_profiles (
    id TEXT PRIMARY KEY,
    crop_name TEXT NOT NULL UNIQUE,
    soil_requirements JSONB NOT NULL DEFAULT '{}'::jsonb,
    climate_conditions JSONB NOT NULL DEFAULT '{}'::jsonb,
    water_requirements JSONB NOT NULL DEFAULT '{}'::jsonb,
    nutrient_requirements JSONB NOT NULL DEFAULT '{}'::jsonb,
    harvest_guidance TEXT NOT NULL,
    provenance_lineage JSONB NOT NULL DEFAULT '[]'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS disease_knowledge_profiles (
    id TEXT PRIMARY KEY,
    disease_name TEXT NOT NULL UNIQUE,
    symptoms JSONB NOT NULL DEFAULT '[]'::jsonb,
    causes TEXT NOT NULL,
    host_crops JSONB NOT NULL DEFAULT '[]'::jsonb,
    diagnostic_uncertainty_note TEXT NOT NULL,
    management_practices JSONB NOT NULL DEFAULT '[]'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS soil_knowledge_profiles (
    id TEXT PRIMARY KEY,
    soil_type TEXT NOT NULL UNIQUE,
    characteristics JSONB NOT NULL DEFAULT '{}'::jsonb,
    suitable_crops JSONB NOT NULL DEFAULT '[]'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS practice_knowledge (
    id TEXT PRIMARY KEY,
    practice_name TEXT NOT NULL UNIQUE,
    expected_outcome TEXT NOT NULL,
    evidence_strength TEXT NOT NULL DEFAULT 'HIGH',
    cost_level TEXT NOT NULL DEFAULT 'MEDIUM',
    climate_suitability TEXT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS knowledge_translations (
    id TEXT PRIMARY KEY,
    entity_id TEXT NOT NULL,
    source_language TEXT NOT NULL DEFAULT 'en',
    translated_language TEXT NOT NULL,
    translated_content TEXT NOT NULL,
    translation_version TEXT NOT NULL DEFAULT 'v1.0',
    review_status TEXT NOT NULL DEFAULT 'REVIEWED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS research_provenance (
    id TEXT PRIMARY KEY,
    claim_id TEXT NOT NULL,
    evidence_id TEXT NOT NULL REFERENCES knowledge_evidence(id) ON DELETE CASCADE,
    model_version TEXT NOT NULL DEFAULT 'v1.0',
    dataset_version TEXT NOT NULL DEFAULT 'v1.0',
    retrieved_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_agri_entities_type ON agri_knowledge_entities(entity_type);
CREATE INDEX IF NOT EXISTS idx_research_papers_doi ON research_papers(doi);
CREATE INDEX IF NOT EXISTS idx_research_papers_crop ON research_papers(crop);
CREATE INDEX IF NOT EXISTS idx_field_trials_crop ON field_trials(crop);
CREATE INDEX IF NOT EXISTS idx_knowledge_contrib_status ON knowledge_contributions(status);
CREATE INDEX IF NOT EXISTS idx_knowledge_consensus_topic ON knowledge_consensus(topic);

-- Row Level Security (RLS)
ALTER TABLE agri_knowledge_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE agri_knowledge_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_citations ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE dataset_quality_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE trial_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE field_trials ENABLE ROW LEVEL SECURITY;
ALTER TABLE trial_protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE trial_treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE trial_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE trial_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE trial_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_conflicts ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_consensus ENABLE ROW LEVEL SECURITY;
ALTER TABLE crop_knowledge_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE disease_knowledge_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE soil_knowledge_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_provenance ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY rls_agri_entities_all ON agri_knowledge_entities FOR ALL USING (true);
CREATE POLICY rls_agri_rel_all ON agri_knowledge_relationships FOR ALL USING (true);
CREATE POLICY rls_knowledge_evidence_all ON knowledge_evidence FOR ALL USING (true);
CREATE POLICY rls_research_inst_all ON research_institutions FOR ALL USING (true);
CREATE POLICY rls_research_authors_all ON research_authors FOR ALL USING (true);
CREATE POLICY rls_research_papers_all ON research_papers FOR ALL USING (true);
CREATE POLICY rls_research_citations_all ON research_citations FOR ALL USING (true);
CREATE POLICY rls_research_topics_all ON research_topics FOR ALL USING (true);
CREATE POLICY rls_research_datasets_all ON research_datasets FOR ALL USING (true);
CREATE POLICY rls_dataset_quality_all ON dataset_quality_reports FOR ALL USING (true);
CREATE POLICY rls_trial_sites_all ON trial_sites FOR ALL USING (true);
CREATE POLICY rls_field_trials_all ON field_trials FOR ALL USING (true);
CREATE POLICY rls_trial_proto_all ON trial_protocols FOR ALL USING (true);
CREATE POLICY rls_trial_treatments_all ON trial_treatments FOR ALL USING (true);
CREATE POLICY rls_trial_obs_all ON trial_observations FOR ALL USING (true);
CREATE POLICY rls_trial_meas_all ON trial_measurements FOR ALL USING (true);
CREATE POLICY rls_trial_outcomes_all ON trial_outcomes FOR ALL USING (true);
CREATE POLICY rls_research_proj_all ON research_projects FOR ALL USING (true);
CREATE POLICY rls_research_teams_all ON research_teams FOR ALL USING (true);
CREATE POLICY rls_knowledge_contrib_all ON knowledge_contributions FOR ALL USING (true);
CREATE POLICY rls_knowledge_reviews_all ON knowledge_reviews FOR ALL USING (true);
CREATE POLICY rls_knowledge_conflicts_all ON knowledge_conflicts FOR ALL USING (true);
CREATE POLICY rls_knowledge_consensus_all ON knowledge_consensus FOR ALL USING (true);
CREATE POLICY rls_crop_profiles_all ON crop_knowledge_profiles FOR ALL USING (true);
CREATE POLICY rls_disease_profiles_all ON disease_knowledge_profiles FOR ALL USING (true);
CREATE POLICY rls_soil_profiles_all ON soil_knowledge_profiles FOR ALL USING (true);
CREATE POLICY rls_practice_knowledge_all ON practice_knowledge FOR ALL USING (true);
CREATE POLICY rls_knowledge_translations_all ON knowledge_translations FOR ALL USING (true);
CREATE POLICY rls_research_provenance_all ON research_provenance FOR ALL USING (true);
