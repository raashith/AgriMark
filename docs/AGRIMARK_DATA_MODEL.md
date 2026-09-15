# AgriMark Canonical Data Model

## 1. Relational Entity Schemas
AgriMark uses a single canonical PostgreSQL database managed across 15 migrations:
- **Core Farmer & Farm**: `farmers`, `farms`, `fields`, `crops`, `cultivations`, `harvests`, `produce_lots`
- **Commerce & Logistics**: `listings`, `rfqs`, `orders`, `shipments`, `telemetry`, `payments`, `settlements`
- **FPO & Network**: `fpos`, `fpo_memberships`, `network_nodes`, `network_edges`, `liquidity_pools`
- **Physical Agriculture**: `device_registry`, `telemetry_logs`, `physical_commands`, `safety_gates`
- **Climate & Sustainability**: `climate_risk_assessments`, `carbon_records`, `water_usage_records`
- **Policy & Schemes**: `policy_documents`, `government_schemes`, `eligibility_evaluations`, `compliance_requirements`
- **Research & Knowledge**: `agri_knowledge_entities`, `knowledge_evidence`, `research_papers`, `field_trials`, `research_datasets`
- **Digital Twin & Simulations**: `digital_twin_entities`, `digital_twin_state_snapshots`, `simulation_scenarios`, `simulation_runs`
- **Unified OS & Governance**: `unified_events_log`, `unified_workflow_states`, `outcome_economics_records`, `national_resilience_indices`, `human_approval_requests`, `incident_records`

---

## 2. Operating Graph
All entities link into a unified semantic graph (`agri_operating_graph_nodes` & `agri_operating_graph_edges`) preventing entity duplication.
