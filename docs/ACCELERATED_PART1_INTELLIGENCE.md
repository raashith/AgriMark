# AgriMark — Accelerated Part 1: Intelligence + Simulation

## Scope

This document defines the integrated implementation target for the Intelligence + Simulation layer:

1. Policy and Scheme Intelligence
2. Agricultural Knowledge and Research
3. National Digital Twin
4. Scenario and Simulation Engine
5. Evidence-backed AI Intelligence

## Architecture principles

- Supabase/PostgreSQL remains the single source of truth.
- Reuse existing canonical entities and APIs; do not create duplicate farmer, farm, crop, market, policy, research, device, model or outcome entities.
- Every policy, research and simulation result carries provenance, timestamp/version metadata and uncertainty where applicable.
- Live operational state and simulation state are strictly separated.
- Simulations are decision-support, not guaranteed predictions.
- AI cannot invent citations, guarantee eligibility, or directly execute consequential financial, legal or physical actions.
- Private farmer data remains protected by RLS and role/tenant authorization.

## Delivery modules

### Policy and schemes

- Policy documents and versioning
- Government scheme catalog
- Jurisdiction-aware eligibility rules
- Document readiness
- Compliance requirements
- Deadlines and policy change events
- Source trust and provenance
- Multilingual policy summaries

Primary API namespace: `/api/v1/policy/*`

### Knowledge and research

- Agricultural knowledge graph
- Crop, disease, soil and practice knowledge
- Research papers, authors, institutions and citations
- Evidence records and conflicts
- Research datasets and quality reports
- Field-trial foundations
- Scientific provenance

Primary API namespaces: `/api/v1/research/*`, `/api/v1/knowledge/*`

### Digital twin

- Farm/field/crop/soil/water/weather/infrastructure/market/supply state
- Historical snapshots
- Live versus simulated state separation
- Model bindings and provenance

Primary API namespace: `/api/v1/digital-twin/*`

### Simulation

- Scenario definitions
- What-if and counterfactual simulation
- Intervention comparison
- Uncertainty/Monte Carlo foundations
- Asynchronous simulation jobs
- Baseline versus scenario comparison
- Simulation governance and review

Primary API namespace: `/api/v1/simulations/*`

## Validation requirements

Before completion:

- Full test suite passes
- Lint passes
- Production build passes
- RLS/security review passes
- Supabase security advisor is clean of security findings
- Existing performance findings are reviewed; unused indexes are not removed blindly
- Migration and provenance checks pass
- Live/simulation isolation tests pass
- Production smoke tests pass
- Vercel deployment is successful

## Suggested migration naming

Use the next available migration number rather than assuming a fixed number. Keep one coherent migration for the Part 1 intelligence/simulation domain where practical, while reusing existing tables when an equivalent canonical entity already exists.
