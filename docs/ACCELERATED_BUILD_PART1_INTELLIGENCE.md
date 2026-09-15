# National Agricultural Intelligence Core (Accelerated Build Part 1)

## 1. Executive Summary
**AgriMark Accelerated Build Part 1** integrates Policy & Scheme Intelligence, Agricultural Knowledge & Research, National Digital Twin, Scenario & Simulation Engines, and the AI Intelligence Layer into a unified National Agricultural Intelligence Core.

---

## 2. Integrated Domains & Architectures

### 2.1 Policy + Scheme Intelligence
- Policy documents with jurisdiction-aware rules (National, State, District, Local).
- Scheme eligibility matching returning `ELIGIBLE`, `POSSIBLY_ELIGIBLE`, or `NOT_ELIGIBLE`.
- Farmer document readiness tracking (`READY`, `PARTIAL`, `BLOCKED`).
- Compliance checklists & policy change detection.

### 2.2 Agricultural Knowledge + Research
- Grounded Knowledge Graph connecting 18 entity types and 11 relationship types.
- Peer-reviewed research repository, DOIs, citations, and versioning.
- 8-level evidence classification (`PRIMARY_RESEARCH`, `META_ANALYSIS`, `SYSTEMATIC_REVIEW`, `OFFICIAL_RESEARCH`, `EXPERT_GUIDANCE`, `OBSERVATIONAL`, `USER_REPORTED`, `AI_GENERATED`).
- Knowledge conflict engine surfacing scientific disagreements.

### 2.3 National Digital Twin
- 31 entity types & 14 relationship types.
- Versioned state snapshots (`CURRENT`, `HISTORICAL`, `PROJECTED`, `SIMULATED`).
- Farm, field, crop, soil, water, weather, infrastructure, market, and national supply twins.

### 2.4 Scenario + Simulation Engine
- 12 scenario types (drought, flood, heatwave, pest outbreak, fertilizer shortage, etc.).
- Reproducible Monte Carlo simulation engine with random seed support.
- Counterfactual engine carrying mandatory `COUNTERFACTUAL_SIMULATION` output tag.
- Intervention simulator for mitigation strategy evaluation.

### 2.5 AI Intelligence Layer
- Operates under strict non-fabrication safeguards.
- Prohibits inventing citations, guaranteed yields, or unvalidated chemical directives.
- Tags AI experiment drafts as `AI_DRAFT`.

---

## 3. Unified API Namespaces
- `/api/v1/policy/*`: Policy search, schemes, eligibility, documents, compliance, deadlines.
- `/api/v1/research/*`: Peer-reviewed papers, authors, institutions, citations, datasets, evidence.
- `/api/v1/knowledge/*`: Grounded semantic knowledge graph queries & relationship traversal.
- `/api/v1/digital-twin/*`: Entity graph, state snapshots, farms, crops, water, infrastructure, markets, supply.
- `/api/v1/simulations/*`: Multi-scale simulation workbench, Monte Carlo runs, interventions, counterfactuals.

---

## 4. Reusable UI Hubs
- **Policy Center**: `/policy`
- **Scheme Finder**: `/policy/schemes`
- **Research Center**: `/research`
- **Knowledge Explorer**: `/knowledge`
- **Digital Twin**: `/digital-twin`
- **Simulation Lab**: `/simulation-lab`
- **Evidence Viewer**: `/evidence`

---

## 5. Security & Isolation
- Supabase PostgreSQL Row-Level Security (RLS) on all private tables.
- Strict isolation between `LIVE_OPERATIONAL`, `SIMULATION`, and `SYNTHETIC` state data.
