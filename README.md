# AgriMark

AgriMark is a national-scale agricultural intelligence, commerce, operations, and decision platform designed to connect farmers, FPOs, buyers, logistics providers, service providers, research, finance, insurance, climate intelligence, and agricultural data through a unified digital operating system.

## Vision

Build a farmer-centered agricultural network that combines marketplace capabilities, agricultural intelligence, AI-assisted decision support, operational orchestration, trusted data exchange, value-chain optimization, climate and sustainability intelligence, and controlled physical-agriculture execution.

## Canonical Stack

- Backend: Python + FastAPI
- Database: PostgreSQL through the existing Supabase project
- ML: Python
- AI agents: server-side controlled orchestration with OpenAI integrations
- Web: HTML/CSS/JavaScript
- Android: Kotlin + Android Studio + Jetpack Compose
- API prefix: `/api/v1`
- Source control: GitHub
- Primary AI-assisted development workflow: Antigravity

PostgreSQL/Supabase is canonical. Older MySQL schema or migration material is reference/migration material and should be adapted to PostgreSQL, not maintained as a second production database.

## Repository Structure

```text
AgriMark/
├── backend/          # FastAPI backend, domain services, APIs, auth, integrations
├── ml/               # Data ingestion, feature engineering, model training/evaluation
├── agents/           # AI agents, tool contracts, guardrails, orchestration
├── web/              # Web application
├── android/          # Native Android application (Kotlin/Compose)
├── database/         # PostgreSQL/Supabase migrations, schema and reference data
├── tests/            # Backend, ML, AI, integration, contract and safety tests
├── deployment/       # Environment, CI/CD and operations configuration
├── docs/             # Architecture, data, AI, governance and operations docs
├── .github/          # GitHub Actions and automation
├── .gitignore
├── .env.example
└── README.md
```

## Major Platform Capability Domains

- Farmer onboarding, farm profiles, crop cultivation, harvests, produce lots and inventory.
- Agricultural marketplace, listings, RFQs, offers, negotiations, orders and fulfillment.
- Quality, assaying, verification, provenance, traceability, trust and disputes.
- Farmer/FPO/buyer/logistics/service matching.
- Agricultural price and demand intelligence.
- Official/authorized agricultural data ingestion and MLOps.
- Weather, climate, soil, water, crop-health, pest and disease intelligence foundations.
- Agricultural knowledge, research, evidence synthesis and farmer knowledge cards.
- Agricultural policy, schemes, eligibility and compliance intelligence.
- National commodity balance, supply-demand, food-security and resilience intelligence.
- Agricultural digital twin and simulation.
- Data commons, interoperability, consent, provenance, data contracts and federation.
- Developer, research, university, FPO and innovation sandbox ecosystem.
- Farmer economic outcomes, ROI, impact attribution, fairness and evidence.
- Seed, variety, bio-agriculture and genetic intelligence foundations.
- Logistics, post-harvest handling, storage, cold-chain and processing/value-chain optimization.
- Finance, insurance and allied agriculture abstractions.
- Global trade, export opportunity, landed-cost, circular-economy and national resilience intelligence.
- Physical agriculture and controlled execution abstractions for drones, machinery, IoT, irrigation, robotics and field services.
- Unified national agricultural operating system and control towers.

## AI Architecture and Safety

AI is a controlled decision-support and orchestration layer, not an unrestricted autonomous operator.

Core agent families include Supervisor, Farmer Assistant, Price Intelligence, Demand Intelligence, Marketplace Assistant, Matching, Agricultural Decision, Logistics/Operations, Policy/Scheme, Knowledge/Research, Climate/Risk, Finance/Insurance, and Trust/Safety/Evaluation agents.

Agents use controlled backend tools, structured outputs, explicit policies, provenance and audit trails. They must never directly modify the database or bypass backend authorization.

Agents must not autonomously transfer money, place/cancel financial transactions, change seller pricing without authorization, delete critical records, approve loans or insurance, approve regulated certifications, release biological products, or directly control physical agricultural hardware without authorized integrations and safety gates.

Physical AI uses autonomy levels L0-L5; production starts conservatively at L0-L3. Higher autonomy remains constrained/research-only until explicit safeguards are verified.

## Agricultural Data and ML

The data platform separates immutable raw, normalized/canonical, feature, dataset and model layers. Requirements include provenance, lineage, freshness checks, schema drift detection, quarantine, normalization, reproducible dataset construction and quality scoring.

Forecast evaluation uses chronological/rolling validation and leakage prevention. Candidate models span classical statistical, econometric, machine learning, deep learning, hybrid/decomposition and modern time-series foundation model families. There is no universal best model; champions are selected by crop, market, horizon, data volume and features.

Potential/implemented sources include official or authorized services such as AGMARKNET, data.gov.in, India Meteorological Department, FAOSTAT and approved state/research/commercial sources where licensing permits.

AgriMark must never claim live connectivity, government authorization, certification, official status or continuous historical coverage unless actually configured and verified.

## Supabase/PostgreSQL

The existing AgriMark Supabase project is the canonical PostgreSQL database infrastructure. Requirements include source-controlled migrations, constraints, transaction-safe inventory/fulfillment logic, auditability, least privilege, appropriate RLS, indexes, backups, recovery procedures and security/performance review.

## API Architecture

Backend namespace: `/api/v1`.

Representative domains:

```text
/auth/ /farmers/ /farms/ /crops/ /harvests/ /inventory/ /lots/
/listings/ /buyers/ /rfqs/ /offers/ /orders/ /logistics/ /quality/
/traceability/ /market/ /forecast/ /demand/ /agents/ /policy/ /schemes/
/knowledge/ /research/ /data/ /twin/ /simulation/ /outcomes/ /economics/
/execution/ /national/
```

This is an architectural map, not a claim that every route already exists. The implemented OpenAPI contract is authoritative.

## Android

Native Kotlin app with Jetpack Compose, ViewModel, repositories, Room, WorkManager, Hilt, Retrofit/OkHttp, DataStore, environment separation, secure sessions, idempotent sync, conflict handling, Tamil/English localization, low-literacy UX and media/location abstractions.

Android must never connect directly to PostgreSQL with server credentials.

## Production Engineering

The repository is intended to use Git-based development, CI/CD, DEV/STAGING/PROD environments, secret management, security scanning, migration automation, HTTPS, authorization, rate limits, upload controls, observability, audit logs, incident response, backups, restore testing, DR, AI/model/data monitoring, cost controls, feature flags and rollback.

## Secret Policy

Never commit real API keys, `.env` secrets, database passwords, JWT secrets, private keys, Supabase service-role keys, payment secrets, access tokens, or sensitive production/user data. Real secrets belong in environment/secret management. `.env.example` contains variable names only.

## OpenAI

OpenAI integrations are server-side only. API keys are never embedded in Android or browser clients. The architecture supports the Responses API and Agents SDK with tool allowlists, structured outputs, input/output validation, prompt-injection defenses, usage tracking and fallbacks.

## 30-Stage Roadmap

1. Core platform foundation
2. Agricultural data and ML foundation
3. Farmer operations and marketplace
4. Android/backend integration
5. OpenAI agent layer
6. Production agricultural data and MLOps
7. Production security, deployment and compliance foundation
8. Controlled real-world pilot
9. Regional scale, FPO, logistics, payments and ecosystem
10. National agricultural intelligence and decision platform
11. National agricultural DPI, interoperability and federation
12. Agricultural trust, finance, insurance and commerce intelligence
13. National agricultural operating system
14. Autonomous agricultural network and network effects
15. Physical intelligence, precision agriculture and controlled field operations
16. Climate, sustainability and circular agriculture OS
17. National food and agricultural supply security OS
18. National agricultural policy, scheme and governance intelligence OS
19. National agricultural knowledge and research intelligence OS
20. National agricultural digital twin and simulation OS
21. Autonomous agricultural execution and physical AI OS
22. National Agri-AI trust, safety, evaluation and certification OS
23. National Agri-AI data commons and interoperability OS
24. National AgriTech innovation sandbox and developer ecosystem OS
25. Farmer outcome economics and AI impact OS
26. Bio-agriculture, seed and genetic intelligence OS
27. National logistics, food processing and value chain OS
28. Finance, insurance, allied agriculture and rural economy OS
29. Global trade, circular economy, climate and national resilience OS
30. AgriMark unified national agricultural OS

These stages describe the target evolution and do not prove that every capability is currently implemented.

## Development Principles

1. Inspect the actual codebase and database before changing architecture.
2. Preserve working implementation and make incremental reversible changes.
3. Keep PostgreSQL/Supabase canonical.
4. Keep security and business decisions server-side.
5. Make AI outputs evidence-backed, uncertainty-aware and auditable.
6. Separate recommendations, simulations and real execution.
7. Require explicit human approval for high-impact actions.
8. Never fabricate data, benchmarks, integrations, certifications or government authority.
9. Measure farmer outcomes and economic impact, not AI activity alone.

## Development Workflow

```text
Antigravity → inspect → implement/repair → test/lint/type/security checks
→ review migrations/API contracts → commit → push → CI/CD → environment validation
```

## Status

GitHub is the canonical source-control location. Repository content should be synchronized from the validated local implementation and must not contain secrets. Production readiness is declared only after the actual implementation and operational controls have been verified.
