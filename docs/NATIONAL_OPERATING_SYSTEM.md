# AgriMark Phase 13 — National Agricultural Operating System

## Architecture Overview

The **AgriMark National Agricultural Operating System** is the unified operating layer that connects all domain modules implemented across prior phases (Pilots, Regional Scale, National Intelligence, DPI/Interoperability, and Trust & Finance). It moves AgriMark beyond a collection of dashboards into an active, event-driven operating system connecting **Intelligence → Decision → Approval → Execution → Outcome**.

```
                           [ NATIONAL OPERATING GRAPH ]
                                        │
           ┌────────────────────────────┼───────────────────────────┐
           ▼                            ▼                           ▼
[ UNIFIED EVENT BUS ]       [ WORKFLOW ORCHESTRATOR ]      [ AI SUPERVISOR ]
(Durable Event Log)         (Harvest-to-Sale Pipelines)    (Allowlisted Tools)
           │                            │                           │
           ├────────────────────────────┼───────────────────────────┤
           ▼                            ▼                           ▼
[ FARMER ACTION CENTER ]    [ HUMAN APPROVAL FRAMEWORK ]   [ INCIDENT & SLO ]
(Prioritized Action Queue)  (7-State Gatekeeper)           (Error Budget Telemetry)
```

---

## 1. Canonical Relationship Graph

The core graph anchors every agricultural artifact to verified provenance and ownership:

- **Farmer** (`usr_f_*`)
  - **Farms** (`farm_*`)
    - **Crops** (`crop_*`)
    - **Cultivations** (`cult_*`)
    - **Tasks** (`task_*`)
    - **Observations** (`obs_*`)
    - **Harvests** (`harv_*`)
      - **Produce Lots** (`lot_*`)
        - **Quality Assessments** (`qual_*`)
        - **Listings** (`list_*`)
        - **Orders** (`ord_*`)
        - **Logistics & Shipments** (`shp_*`)
  - **FPO Membership** (`fpo_*`)
  - **Financial Records** (`fin_*`)
  - **Insurance Policies** (`ins_*`)
  - **Documents & Certifications** (`doc_*`)
  - **AI Interactions** (`ai_sess_*`)

External Connected Domains:
- **Markets & Price Tickers** (`mkt_*`)
- **Buyers & Institutional Procurement** (`byr_*`)
- **Warehouses & Storage Facilities** (`wh_*`)
- **Weather & Climate Providers**
- **Policies & Government Schemes** (`pol_*`)
- **National Intelligence Aggregators**
- **Federated External Data Providers**

---

## 2. Unified Entity Identifiers

All primary entity keys adopt deterministic, stable, prefixed non-sequential UUIDs across REST, GraphQL, WebSocket, and Database schemas:

| Entity | Prefix Format | Example ID |
| :--- | :--- | :--- |
| **Farmer** | `usr_f_` | `usr_f_9b1deb4d3b7d` |
| **Farm** | `farm_` | `farm_a1b2c3d4e5f6` |
| **Crop** | `crop_` | `crop_778899aabbcc` |
| **Cultivation** | `cult_` | `cult_112233445566` |
| **Harvest** | `harv_` | `harv_556677889900` |
| **Produce Lot** | `lot_` | `lot_abcdef012345` |
| **Listing** | `list_` | `list_fe6b5a4c3d2e` |
| **Order** | `ord_` | `ord_9876543210fe` |
| **Shipment** | `shp_` | `shp_1234567890ab` |
| **Warehouse** | `wh_` | `wh_445566778899` |
| **FPO** | `fpo_` | `fpo_334455667788` |
| **Market** | `mkt_` | `mkt_223344556677` |
| **Buyer** | `byr_` | `byr_112233445566` |

*Constraint*: Phone numbers and emails are strictly prohibited as primary database identity keys to guarantee data portability, consent isolation, and immutable graph relationships.

---

## 3. Operations Control Plane APIs

The control plane exposes root endpoints under `/api/v1/`:

- `GET /api/v1/operations`: Operating graph node traversal & system summary.
- `GET/POST /api/v1/events`: Durable event querying & ingestion.
- `GET/POST /api/v1/workflows`: Workflow execution state & lifecycle control.
- `GET/POST /api/v1/actions`: Farmer action item management.
- `GET/POST /api/v1/alerts`: National priority alert dispatch.
- `GET/POST /api/v1/approvals`: Human approval requests & transition execution.
- `GET/POST /api/v1/incidents`: Incident response management & correlation.
- `GET/POST /api/v1/slo`: Real-time SLO error budget tracking.
- `POST /api/v1/ai/supervisor`: Governed AI task orchestration.
