# Simulation Governance & Operational Safety

## 1. Operational State Isolation
AgriMark enforces a strict computational separation between environment modes:
- `LIVE_OPERATIONAL`: Production transactional databases powering real-world farm activities.
- `SIMULATION`: Isolated simulation runs and result records.
- `STAGING` / `SYNTHETIC`: Benchmark and synthetic testing data tagged `data_origin = 'SYNTHETIC'`.

**Strict Invariant**: Under no circumstances can a simulation run alter live operational tables (`farms`, `orders`, `listings`).

---

## 2. Risk-Based Review Framework
Simulations are categorized into four risk tiers:
- `LOW`: Standard what-if exploratory queries.
- `MEDIUM`: Regional yield forecasting.
- `HIGH`: Crop redistribution & water allocation recommendations.
- `CRITICAL`: National food vulnerability & emergency supply planning.

**Human Sign-off Requirement**: `HIGH` and `CRITICAL` simulation results require explicit review and sign-off by a certified domain authority before being used in decision-making.
