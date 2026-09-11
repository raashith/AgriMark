"""
Migration 017: Stage 26 Bio-Agriculture, Seed & Genetic Intelligence OS
"""

from alembic import op
import sqlalchemy as sa

def upgrade():
    # 1. Seed Registry & Varieties
    op.execute("""
    CREATE TABLE IF NOT EXISTS seed_varieties (
        id VARCHAR(36) PRIMARY KEY,
        variety_code VARCHAR(100) NOT NULL UNIQUE,
        crop_name VARCHAR(100) NOT NULL,
        species VARCHAR(100) NOT NULL,
        variety_name VARCHAR(150) NOT NULL,
        producer_name VARCHAR(150) NOT NULL,
        maturity_duration_days INT NOT NULL,
        season VARCHAR(50) NOT NULL,
        planting_window VARCHAR(100),
        min_yield_kg_per_acre DECIMAL(10, 2),
        max_yield_kg_per_acre DECIMAL(10, 2),
        quality_traits JSON,
        disease_resistance JSON,
        pest_resistance JSON,
        drought_tolerance VARCHAR(50) DEFAULT 'MODERATE',
        heat_tolerance VARCHAR(50) DEFAULT 'MODERATE',
        salinity_tolerance VARCHAR(50) DEFAULT 'LOW',
        water_requirement_mm DECIMAL(8, 2),
        soil_suitability JSON,
        geographical_suitability JSON,
        evidence_level VARCHAR(30) DEFAULT 'VERIFIED', -- OBSERVED, VERIFIED, RESEARCH, TRIAL, ESTIMATED, SIMULATED, PROJECTED
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
    """)

    op.execute("""
    CREATE TABLE IF NOT EXISTS seed_producers (
        id VARCHAR(36) PRIMARY KEY,
        producer_code VARCHAR(100) NOT NULL UNIQUE,
        company_name VARCHAR(150) NOT NULL,
        license_number VARCHAR(100) NOT NULL,
        verification_status VARCHAR(30) DEFAULT 'VERIFIED',
        contact_email VARCHAR(100),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    """)

    op.execute("""
    CREATE TABLE IF NOT EXISTS seed_batches (
        id VARCHAR(36) PRIMARY KEY,
        batch_number VARCHAR(100) NOT NULL UNIQUE,
        variety_code VARCHAR(100) NOT NULL,
        producer_code VARCHAR(100) NOT NULL,
        production_year INT NOT NULL,
        quantity_kg DECIMAL(12, 2) NOT NULL,
        qr_code_hash VARCHAR(128) UNIQUE,
        certification_status VARCHAR(50) DEFAULT 'TESTED',
        certification_ref VARCHAR(100),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    """)

    op.execute("""
    CREATE TABLE IF NOT EXISTS seed_lots (
        id VARCHAR(36) PRIMARY KEY,
        lot_code VARCHAR(100) NOT NULL UNIQUE,
        batch_number VARCHAR(100) NOT NULL,
        packaging_date DATE,
        expiry_date DATE,
        lot_size_units INT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    """)

    op.execute("""
    CREATE TABLE IF NOT EXISTS seed_tests (
        id VARCHAR(36) PRIMARY KEY,
        test_code VARCHAR(100) NOT NULL UNIQUE,
        batch_number VARCHAR(100) NOT NULL,
        testing_lab VARCHAR(150) NOT NULL,
        test_date DATE NOT NULL,
        germination_pct DECIMAL(5, 2) NOT NULL,
        purity_pct DECIMAL(5, 2) NOT NULL,
        moisture_pct DECIMAL(5, 2) NOT NULL,
        vigor_index DECIMAL(8, 2),
        disease_contamination_pct DECIMAL(5, 2) DEFAULT 0.00,
        certificate_reference VARCHAR(100),
        passed BOOLEAN DEFAULT TRUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    """)

    op.execute("""
    CREATE TABLE IF NOT EXISTS seed_provenance (
        id VARCHAR(36) PRIMARY KEY,
        batch_number VARCHAR(100) NOT NULL,
        stage VARCHAR(50) NOT NULL, -- BREEDER, FOUNDATION, CERTIFIED, DISTRIBUTOR, RETAILER, FARMER
        location_name VARCHAR(150),
        handler_name VARCHAR(150),
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        provenance_hash VARCHAR(128)
    );
    """)

    op.execute("""
    CREATE TABLE IF NOT EXISTS seed_availability (
        id VARCHAR(36) PRIMARY KEY,
        variety_code VARCHAR(100) NOT NULL,
        district VARCHAR(100) NOT NULL,
        state VARCHAR(100) NOT NULL,
        stock_kg DECIMAL(12, 2) DEFAULT 0.0,
        supplier_contact VARCHAR(100),
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
    """)

    # 2. Germplasm & Trait Ontology
    op.execute("""
    CREATE TABLE IF NOT EXISTS germplasm_accessions (
        id VARCHAR(36) PRIMARY KEY,
        accession_number VARCHAR(100) NOT NULL UNIQUE,
        species VARCHAR(100) NOT NULL,
        source_origin VARCHAR(100) NOT NULL,
        population_type VARCHAR(50),
        conservation_status VARCHAR(50) DEFAULT 'ACTIVE',
        utilization_history TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    """)

    op.execute("""
    CREATE TABLE IF NOT EXISTS trait_ontology (
        id VARCHAR(36) PRIMARY KEY,
        trait_code VARCHAR(100) NOT NULL UNIQUE,
        category VARCHAR(50) NOT NULL, -- yield, quality, nutrition, drought_tolerance, heat_tolerance, disease_resistance, pest_resistance, etc.
        trait_name VARCHAR(150) NOT NULL,
        parent_trait_code VARCHAR(100),
        synonyms JSON,
        tamil_aliases JSON,
        regional_terms JSON,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    """)

    op.execute("""
    CREATE TABLE IF NOT EXISTS germplasm_traits (
        id VARCHAR(36) PRIMARY KEY,
        accession_number VARCHAR(100) NOT NULL,
        trait_code VARCHAR(100) NOT NULL,
        observed_value VARCHAR(100) NOT NULL,
        measurement_unit VARCHAR(50),
        evidence_level VARCHAR(30) DEFAULT 'OBSERVED',
        observed_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 3. Genotype, Phenotype, GxE & Breeding
    op.execute("""
    CREATE TABLE IF NOT EXISTS genotype_records (
        id VARCHAR(36) PRIMARY KEY,
        sample_code VARCHAR(100) NOT NULL UNIQUE,
        variety_code VARCHAR(100),
        accession_number VARCHAR(100),
        marker_data_type VARCHAR(50) DEFAULT 'METADATA_ONLY', -- METADATA_ONLY, SUMMARY_STATS, RESEARCH_DATASET, AUTHORIZED_GENOMIC
        access_governance_tier VARCHAR(20) DEFAULT 'RESTRICTED',
        genotype_metadata JSON,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    """)

    op.execute("""
    CREATE TABLE IF NOT EXISTS phenotype_records (
        id VARCHAR(36) PRIMARY KEY,
        phenotype_code VARCHAR(100) NOT NULL UNIQUE,
        sample_code VARCHAR(100) NOT NULL,
        trait_code VARCHAR(100) NOT NULL,
        value DECIMAL(12, 4) NOT NULL,
        unit VARCHAR(50),
        source_modality VARCHAR(50) DEFAULT 'FIELD_MEASUREMENT', -- FIELD_IMAGE, DRONE_IMAGERY, SATELLITE, SENSOR, PLANT_MEASUREMENT
        confidence DECIMAL(5, 4) DEFAULT 0.95,
        measured_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    """)

    op.execute("""
    CREATE TABLE IF NOT EXISTS gxe_analyses (
        id VARCHAR(36) PRIMARY KEY,
        analysis_code VARCHAR(100) NOT NULL UNIQUE,
        variety_code VARCHAR(100) NOT NULL,
        environment_code VARCHAR(100) NOT NULL,
        season VARCHAR(50) NOT NULL,
        soil_type VARCHAR(50),
        stability_score DECIMAL(5, 4) NOT NULL,
        adaptation_score DECIMAL(5, 4) NOT NULL,
        risk_index DECIMAL(5, 4) NOT NULL,
        performance_distribution JSON,
        evidence_level VARCHAR(30) DEFAULT 'TRIAL',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    """)

    op.execute("""
    CREATE TABLE IF NOT EXISTS breeding_programs (
        id VARCHAR(36) PRIMARY KEY,
        program_code VARCHAR(100) NOT NULL UNIQUE,
        program_name VARCHAR(150) NOT NULL,
        crop_name VARCHAR(100) NOT NULL,
        target_traits JSON,
        lead_breeder VARCHAR(100),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    """)

    op.execute("""
    CREATE TABLE IF NOT EXISTS breeding_trials (
        id VARCHAR(36) PRIMARY KEY,
        trial_code VARCHAR(100) NOT NULL UNIQUE,
        program_code VARCHAR(100) NOT NULL,
        location VARCHAR(100) NOT NULL,
        lifecycle_stage VARCHAR(30) DEFAULT 'DESIGN', -- DESIGN, CROSS, TEST, PHENOTYPE, ANALYZE, SELECT, VALIDATE
        start_date DATE,
        end_date DATE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    """)

    op.execute("""
    CREATE TABLE IF NOT EXISTS breeding_candidates (
        id VARCHAR(36) PRIMARY KEY,
        candidate_code VARCHAR(100) NOT NULL UNIQUE,
        trial_code VARCHAR(100) NOT NULL,
        parent1_code VARCHAR(100),
        parent2_code VARCHAR(100),
        selection_status VARCHAR(30) DEFAULT 'CANDIDATE',
        predicted_performance JSON,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 4. Bio-Inputs & Efficacy Engine
    op.execute("""
    CREATE TABLE IF NOT EXISTS bio_products (
        id VARCHAR(36) PRIMARY KEY,
        product_code VARCHAR(100) NOT NULL UNIQUE,
        product_name VARCHAR(150) NOT NULL,
        product_type VARCHAR(50) NOT NULL, -- biofertilizer, biopesticide, biostimulant, microbial_consortium, microbial_seed_coating, soil_biological_input
        manufacturer VARCHAR(150) NOT NULL,
        composition_metadata JSON,
        storage_instructions TEXT,
        application_method VARCHAR(100),
        compatibility_notes JSON,
        approval_status VARCHAR(30) DEFAULT 'RESEARCH_ONLY', -- RESEARCH_ONLY, PROVISIONAL, APPROVED, REVIEW_PENDING
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    """)

    op.execute("""
    CREATE TABLE IF NOT EXISTS bio_product_batches (
        id VARCHAR(36) PRIMARY KEY,
        batch_number VARCHAR(100) NOT NULL UNIQUE,
        product_code VARCHAR(100) NOT NULL,
        manufacture_date DATE NOT NULL,
        expiry_date DATE NOT NULL,
        quality_status VARCHAR(30) DEFAULT 'PASSED',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    """)

    op.execute("""
    CREATE TABLE IF NOT EXISTS bio_product_evidence (
        id VARCHAR(36) PRIMARY KEY,
        id_code VARCHAR(100) NOT NULL UNIQUE,
        product_code VARCHAR(100) NOT NULL,
        trial_ref VARCHAR(100),
        baseline_yield DECIMAL(10, 2),
        control_yield DECIMAL(10, 2),
        treatment_yield DECIMAL(10, 2),
        yield_delta_pct DECIMAL(5, 2),
        disease_reduction_pct DECIMAL(5, 2),
        soil_biological_activity_delta DECIMAL(5, 2),
        evidence_level VARCHAR(30) DEFAULT 'TRIAL',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    """)

    op.execute("""
    CREATE TABLE IF NOT EXISTS soil_biology_records (
        id VARCHAR(36) PRIMARY KEY,
        record_code VARCHAR(100) NOT NULL UNIQUE,
        farm_ref VARCHAR(100) NOT NULL,
        soil_organic_carbon_pct DECIMAL(4, 2),
        microbial_respiration_index DECIMAL(8, 2),
        biological_activity_score DECIMAL(5, 2),
        nutrient_cycling_capacity VARCHAR(50),
        measurement_type VARCHAR(30) DEFAULT 'MEASURED', -- MEASURED, ESTIMATED, MODEL_DERIVED
        measured_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 5. Authenticity, Recommender, Research & Governance
    op.execute("""
    CREATE TABLE IF NOT EXISTS seed_authenticity_flags (
        id VARCHAR(36) PRIMARY KEY,
        batch_number VARCHAR(100) NOT NULL,
        risk_level VARCHAR(20) DEFAULT 'RISK_FLAG', -- RISK_FLAG, SUSPICIOUS, VERIFIED_VALID
        flag_reason VARCHAR(150) NOT NULL, -- DUPLICATE_QR, IMPOSSIBLE_DATE, UNKNOWN_PRODUCER, GEO_ANOMALY
        details JSON,
        flagged_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    """)

    op.execute("""
    CREATE TABLE IF NOT EXISTS seed_recommendations (
        id VARCHAR(36) PRIMARY KEY,
        rec_code VARCHAR(100) NOT NULL UNIQUE,
        farmer_ref VARCHAR(100) NOT NULL,
        crop_name VARCHAR(100) NOT NULL,
        recommended_variety_code VARCHAR(100) NOT NULL,
        suitability_score DECIMAL(5, 4) NOT NULL,
        strengths JSON,
        weaknesses JSON,
        evidence_level VARCHAR(30) DEFAULT 'VERIFIED',
        confidence DECIMAL(5, 4) DEFAULT 0.90,
        assumptions JSON,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    """)

    op.execute("""
    CREATE TABLE IF NOT EXISTS biological_research_records (
        id VARCHAR(36) PRIMARY KEY,
        record_code VARCHAR(100) NOT NULL UNIQUE,
        title VARCHAR(255) NOT NULL,
        authors VARCHAR(255),
        publication VARCHAR(150),
        pub_year INT,
        crop_name VARCHAR(100),
        trait_code VARCHAR(100),
        gene_symbol VARCHAR(100),
        findings TEXT,
        limitations TEXT,
        evidence_level VARCHAR(30) DEFAULT 'RESEARCH',
        citation_url VARCHAR(255),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    """)

    op.execute("""
    CREATE TABLE IF NOT EXISTS biological_reviews (
        id VARCHAR(36) PRIMARY KEY,
        review_id VARCHAR(100) NOT NULL UNIQUE,
        target_type VARCHAR(50) NOT NULL, -- VARIETY, BIO_PRODUCT, SCIENTIFIC_CLAIM, RECOMMENDATION
        target_code VARCHAR(100) NOT NULL,
        reviewer_role VARCHAR(50) NOT NULL, -- agronomist, plant_breeder, soil_scientist, plant_pathologist, entomologist, biotechnologist
        reviewer_name VARCHAR(100) NOT NULL,
        action VARCHAR(30) NOT NULL, -- APPROVE, REJECT, REQUEST_MORE_EVIDENCE, LIMIT_SCOPE
        comments TEXT,
        reviewed_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    """)

def downgrade():
    pass
