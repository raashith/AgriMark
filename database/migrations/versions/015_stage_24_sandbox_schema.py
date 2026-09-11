"""
Migration 015: Stage 24 National AgriTech Innovation Sandbox & Developer Ecosystem OS
"""

from alembic import op
import sqlalchemy as sa

def upgrade():
    # 1. Innovation Participants & Organizations
    op.execute("""
    CREATE TABLE IF NOT EXISTS innovation_organizations (
        id VARCHAR(36) PRIMARY KEY,
        org_code VARCHAR(100) NOT NULL UNIQUE,
        name VARCHAR(150) NOT NULL,
        type VARCHAR(50) NOT NULL, -- STARTUP, RESEARCHER, UNIVERSITY, KVK, FPO, NGO, GOVT, ENTERPRISE, MODEL_PROVIDER, etc.
        legal_metadata JSON,
        contact_info JSON,
        verified_status VARCHAR(20) DEFAULT 'UNVERIFIED',
        trust_status VARCHAR(20) DEFAULT 'ACTIVE',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
    """)

    op.execute("""
    CREATE TABLE IF NOT EXISTS innovation_participants (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        org_id VARCHAR(36) NOT NULL,
        role VARCHAR(50) DEFAULT 'DEVELOPER', -- DEVELOPER, ADMIN, EVALUATOR, MENTOR
        api_quota_tier VARCHAR(20) DEFAULT 'STANDARD',
        status VARCHAR(20) DEFAULT 'ACTIVE',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (org_id) REFERENCES innovation_organizations(id) ON DELETE CASCADE
    );
    """)

    # 2. Sandbox Projects & Environments
    op.execute("""
    CREATE TABLE IF NOT EXISTS sandbox_projects (
        id VARCHAR(36) PRIMARY KEY,
        project_code VARCHAR(100) NOT NULL UNIQUE,
        title VARCHAR(150) NOT NULL,
        owner_id VARCHAR(36) NOT NULL,
        org_id VARCHAR(36) NOT NULL,
        environment VARCHAR(20) DEFAULT 'SANDBOX', -- SANDBOX, VALIDATION, STAGING, PILOT, PRODUCTION
        purpose VARCHAR(100) NOT NULL,
        crop_domains JSON,
        geography VARCHAR(100),
        status VARCHAR(20) DEFAULT 'ACTIVE',
        expires_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (org_id) REFERENCES innovation_organizations(id)
    );
    """)

    # 3. Sandbox Credentials & Quotas
    op.execute("""
    CREATE TABLE IF NOT EXISTS sandbox_credentials (
        id VARCHAR(36) PRIMARY KEY,
        project_id VARCHAR(36) NOT NULL,
        api_key VARCHAR(100) NOT NULL UNIQUE,
        secret_hash VARCHAR(255) NOT NULL,
        scopes JSON,
        status VARCHAR(20) DEFAULT 'ACTIVE',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES sandbox_projects(id) ON DELETE CASCADE
    );
    """)

    # 4. Sandbox Datasets & Models
    op.execute("""
    CREATE TABLE IF NOT EXISTS sandbox_datasets (
        id VARCHAR(36) PRIMARY KEY,
        dataset_code VARCHAR(100) NOT NULL UNIQUE,
        title VARCHAR(150) NOT NULL,
        provider_org_id VARCHAR(36) NOT NULL,
        domain VARCHAR(50) NOT NULL,
        is_synthetic BOOLEAN DEFAULT FALSE,
        schema_ref VARCHAR(100),
        geography VARCHAR(100),
        quality_score DECIMAL(5, 2) DEFAULT 95.0,
        license_type VARCHAR(50) DEFAULT 'SANDBOX_ONLY',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (provider_org_id) REFERENCES innovation_organizations(id)
    );
    """)

    op.execute("""
    CREATE TABLE IF NOT EXISTS sandbox_models (
        id VARCHAR(36) PRIMARY KEY,
        model_code VARCHAR(100) NOT NULL UNIQUE,
        title VARCHAR(150) NOT NULL,
        owner_org_id VARCHAR(36) NOT NULL,
        framework VARCHAR(50) DEFAULT 'PYTORCH',
        task_category VARCHAR(50) NOT NULL, -- PRICE_FORECAST, YIELD, DISEASE_DETECTION, etc.
        safety_status VARCHAR(20) DEFAULT 'EVALUATING',
        benchmark_results JSON,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (owner_org_id) REFERENCES innovation_organizations(id)
    );
    """)

    # 5. Sandbox Agents & APIs
    op.execute("""
    CREATE TABLE IF NOT EXISTS sandbox_agents (
        id VARCHAR(36) PRIMARY KEY,
        agent_code VARCHAR(100) NOT NULL UNIQUE,
        name VARCHAR(150) NOT NULL,
        project_id VARCHAR(36) NOT NULL,
        capabilities JSON,
        risk_level VARCHAR(20) DEFAULT 'LOW',
        evaluation_status VARCHAR(20) DEFAULT 'SANDBOX_ONLY',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES sandbox_projects(id) ON DELETE CASCADE
    );
    """)

    # 6. Experiments & Benchmarks
    op.execute("""
    CREATE TABLE IF NOT EXISTS sandbox_experiments (
        id VARCHAR(36) PRIMARY KEY,
        experiment_code VARCHAR(100) NOT NULL UNIQUE,
        project_id VARCHAR(36) NOT NULL,
        title VARCHAR(150) NOT NULL,
        dataset_version VARCHAR(50),
        model_version VARCHAR(50),
        parameters JSON,
        metrics JSON,
        reproducibility_status VARCHAR(20) DEFAULT 'VERIFIED',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES sandbox_projects(id) ON DELETE CASCADE
    );
    """)

    op.execute("""
    CREATE TABLE IF NOT EXISTS sandbox_benchmarks (
        id VARCHAR(36) PRIMARY KEY,
        benchmark_code VARCHAR(100) NOT NULL UNIQUE,
        title VARCHAR(150) NOT NULL,
        category VARCHAR(50) NOT NULL, -- PRICE_FORECAST, TAMIL_LANGUAGE, DISEASE_DETECTION, AGENT_SAFETY
        task_description TEXT,
        dataset_ref VARCHAR(100),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 7. Living Labs & Challenges
    op.execute("""
    CREATE TABLE IF NOT EXISTS living_labs (
        id VARCHAR(36) PRIMARY KEY,
        lab_code VARCHAR(100) NOT NULL UNIQUE,
        name VARCHAR(150) NOT NULL,
        district VARCHAR(100) NOT NULL,
        state VARCHAR(100) NOT NULL,
        partner_fpo VARCHAR(150),
        cohort_farmer_count INT DEFAULT 50,
        status VARCHAR(20) DEFAULT 'ACTIVE',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    """)

    op.execute("""
    CREATE TABLE IF NOT EXISTS innovation_challenges (
        id VARCHAR(36) PRIMARY KEY,
        challenge_code VARCHAR(100) NOT NULL UNIQUE,
        title VARCHAR(150) NOT NULL,
        problem_statement TEXT NOT NULL,
        crop_scope VARCHAR(100),
        sponsor VARCHAR(150),
        stage VARCHAR(20) DEFAULT 'OPEN', -- DRAFT, OPEN, SUBMISSIONS, EVALUATION, PILOT, COMPLETED
        prize_pool_inr DECIMAL(12, 2) DEFAULT 0.00,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 8. Promotion Requests & Gate Audits
    op.execute("""
    CREATE TABLE IF NOT EXISTS innovation_promotions (
        id VARCHAR(36) PRIMARY KEY,
        promotion_code VARCHAR(100) NOT NULL UNIQUE,
        project_id VARCHAR(36) NOT NULL,
        target_environment VARCHAR(20) NOT NULL, -- VALIDATION, STAGING, PILOT, PRODUCTION
        status VARCHAR(20) DEFAULT 'SUBMITTED', -- DRAFT, SUBMITTED, UNDER_REVIEW, APPROVED, REJECTED, PILOT, STAGING, PRODUCTION, ROLLED_BACK
        reviews_summary JSON,
        human_approver_id VARCHAR(36),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES sandbox_projects(id)
    );
    """)

def downgrade():
    pass
