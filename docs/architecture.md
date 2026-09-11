# AgriMark System Architecture Specification

## 1. Executive Summary

This document describes the actual runtime architecture of the **AgriMark Unified National Agricultural Operating System** across Stages 1 through 30.

---

## 2. System Architecture Layers

### Layer 1: Client & User Interaction
- **Android Native Client**: Built with Kotlin, Jetpack Compose, ViewModel, Retrofit2, and Room DB for offline-first state sync. Supports Tamil & English voice assistant interactions.
- **Web Control Tower & Dashboards**: Built with HTML5/CSS3/JavaScript fetching real REST API data from `/api/v1/`.

### Layer 2: API Gateway & Security Core
- **FastAPI Core Application**: Mounted at `/api/v1/` with a master router delegating to 24 domain routers.
- **Authentication & RBAC**: OAuth2 JWT bearer token authentication with role-based access controls (`FARMER`, `FPO`, `BUYER`, `ADMIN`, `LOGISTICS`, `QUALITY`).
- **Object-Level Authorization**: Enforces strict IDOR/BOLA tenant isolation across all endpoints.

### Layer 3: Domain Services Subsystem
- **Farmer Marketplace Service**: Manages farms, crops, cultivations, harvests, produce lots, listings, matches, offers, orders, and settlements.
- **Atomic Inventory Reservation Service**: Guarantees concurrency safety using database locks (`SELECT ... FOR UPDATE`), preventing over-reservation or negative inventory stock.
- **Bio & Seed Intelligence Service (Stage 26)**: Manages germplasm registries, Tamil trait ontologies, GxE stability calculations, and QR seed authenticity scanning.
- **Logistics & Cold Storage Service (Stage 27)**: Cold storage facility directory, reefer telemetry monitoring, and multimodal transport cost optimizer.
- **Finance & Allied Agriculture Service (Stage 28)**: Non-guaranteed decision-support credit risk scoring and allied registries (livestock, dairy, fisheries).
- **Global Trade & Climate Service (Stage 29)**: Export landed cost calculation, digital Product Passports, circular waste tracking, and Disaster Mode lifecycle management (`DETECTED` -> `CLOSED`).
- **Unified Decision Engine (Stage 30)**: Standardizes cross-domain recommendations into structured **Decision Cards**.

### Layer 4: AI & Machine Learning Subsystem
- **Master AI Supervisor Agent**: Multi-agent swarm coordinator executing queries via Pydantic-validated domain tools. **Direct LLM database write permissions are strictly blocked**.
- **Commodity ML Prediction Service**: Forecasts market prices and demand for Tomato, Onion, and Potato across 1d, 7d, 14d, and 30d horizons with uncertainty bounds.

### Layer 5: Data Governance & Commons
- **Data Commons Registry**: Provider, consumer, contract, and consent management.
- **External Adapter Mesh**: Adapter-based fallback integration for IMD, Agmarknet, ISRO, and e-NAM.

### Layer 6: Persistence & Storage Layer
- **MySQL Production Database**: Relational schema managed via 20 Alembic migrations (`001` through `020`).
- **SQLite Development Fallback**: In-memory database support for zero-dependency local testing.

---

## 3. Implemented vs. Planned System Boundaries

| Subsystem Component | Implementation Status | Runtime Status |
|---|---|---|
| FastAPI Gateway `/api/v1/` | **IMPLEMENTED** | Active & Passing Tests |
| OAuth2 JWT & RBAC | **IMPLEMENTED** | Active & Passing Tests |
| Atomic Inventory Reservation | **IMPLEMENTED** | Active & Passing Tests |
| Marketplace Workflow | **IMPLEMENTED** | Active & Passing Tests |
| Seed & Genetic Intelligence (Stage 26) | **IMPLEMENTED** | Active & Passing Tests |
| Cold Storage Telemetry (Stage 27) | **IMPLEMENTED** | Active & Passing Tests |
| Finance Decision Support (Stage 28) | **IMPLEMENTED** | Active & Passing Tests |
| Global Trade & Disaster Mode (Stage 29) | **IMPLEMENTED** | Active & Passing Tests |
| Decision Cards (Stage 30) | **IMPLEMENTED** | Active & Passing Tests |
| Master AI Supervisor Agent | **IMPLEMENTED** | Active & Passing Tests |
| Commodity ML Predictions (1d-30d) | **IMPLEMENTED** | Active & Passing Tests |
| Native Kotlin Android App | **IMPLEMENTED** | Active |
| Web Control Tower & Dashboards | **IMPLEMENTED** | Active |
| Direct Live Government API Connectors | **PLANNED / ADAPTER FALLBACK** | Provider Fallbacks Active |
| Automated Drone / IoT Actuation | **PLANNED (Stage 21 Architecture)** | Telemetry & Simulation Active |
