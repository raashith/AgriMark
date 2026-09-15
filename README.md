# AgriMark — Unified National Agricultural Operating System

AgriMark is a unified, farmer-first, national-scale agricultural operating system connecting farmers, FPOs, buyers, logistics, physical IoT devices, climate/water intelligence, policy/schemes, peer-reviewed research knowledge, digital twins, AI supervision, and national resilience under a single canonical architecture.

---

## Key Operating Capabilities

- **Farmer Operating Center (`/farmer/operating-center`)**: Unified farmer dashboard showing today's weather, crop status, disease alerts, market prices, input needs, schemes, financial position, and AI recommendations.
- **Farmer Action Center (`/farmer/actions`)**: 12 core actions covering inputs, sales, buyer matching, FPO connection, logistics, schemes, irrigation, services, and payments.
- **National Control Plane (`/control-plane`)**: System-wide operational monitoring for food security, crop production, logistics bottlenecks, water balances, and national resilience.
- **National Digital Twin OS (`/digital-twin`)**: Interconnected 31-entity computational twin supporting current-state representation, historical reconstruction, scenario simulation, what-if analysis, risk forecasting, and intervention comparison.
- **Simulation Lab (`/simulation-lab`)**: Reproducible Monte Carlo uncertainty simulations and counterfactual analysis (`COUNTERFACTUAL_SIMULATION`).
- **Policy Center & Scheme Finder (`/policy`, `/policy/schemes`)**: Evidence-backed policy search, rule-driven scheme eligibility, and farmer document readiness tracking.
- **Research Center & Knowledge Explorer (`/research`, `/knowledge`)**: Canonical grounded agricultural knowledge graph and peer-reviewed research repository with non-fabrication citation guarantees.
- **AI Supervisor & Human Approval Center (`/approval-center`)**: Supervised AI coordinator with mandatory human sign-off gates for high-risk financial, physical, and policy actions.
- **Incident Center (`/incident-center`)**: Operational incident tracking, root cause analysis, and postmortems.

---

## Canonical Technology Stack

- **Frontend Application**: Next.js 14 App Router, TypeScript, Vanilla CSS + AgriMark Stitch Design System (`#1B4D3E`, `#3E7B54`, `#E5A93C`, `#F7F5EE`, `#19201D`).
- **Offline Sync & Low Bandwidth**: Client-side action queue (`OfflineSyncEngine`) in `web/src/lib/offline-sync.ts` supporting queued offline actions, low-bandwidth mode auto-detection, and background auto-sync.
- **Canonical Database**: Supabase PostgreSQL featuring 15 domain migrations with Row-Level Security (RLS) on 100% of private tables.
- **Test Suite**: Pytest test suite covering end-to-end workflows and scenario simulations (178 passing tests).
- **Deployment Host**: Vercel Production (`https://agrimark-six.vercel.app/`).

---

## Verification & Quality Assurance

- **End-to-End Tests**: `pytest` (178 passing unit & integration tests)
- **Integration & Stabilization**: `pytest tests/test_accelerated_integration_stabilization.py`
- **Synthetic Staging Simulation**: `python scripts/simulate_accelerated_integration_stabilization.py` (100,000 synthetic records with `data_origin = 'SYNTHETIC'`)
- **Production Build**: `npm --prefix web run build` (Exit code 0, 0 build errors)

