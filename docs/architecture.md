# AgriMark Master System Architecture Specification

## 1. Overview & Vision
AgriMark is a unified, 30-stage National Agricultural Operating System. It connects smallholder farmers, FPOs, buyers, logistics providers, financial institutions, and agricultural researchers into a secure, scalable ecosystem.

## 2. System Architecture Layers

```
+-------------------------------------------------------------------------+
|                        Client Tier (Android & Web)                      |
| Native Kotlin App (Offline Room DB, Hilt, Compose) | Web Control Tower  |
+-------------------------------------------------------------------------+
                                    | REST (/api/v1/)
+-------------------------------------------------------------------------+
|                         API Gateway & Auth Core                         |
| FastAPI Gateway | OAuth2 JWT & RBAC | IDOR / BOLA Multi-Tenant Isolation|
+-------------------------------------------------------------------------+
                                    |
+-------------------------------------------------------------------------+
|                            Domain Services                              |
| Farmer Marketplace | Atomic Inventory Reservation | Seed Intelligence   |
| Cold Storage Telemetry | Finance Decision Support | Disaster Mode      |
+-------------------------------------------------------------------------+
                    |                               |
+-------------------+---------------+   +-----------+---------------------+
|        AI & ML Subsystems         |   |     Data Governance Tier        |
| Master Supervisor Agent & Swarm   |   | Data Commons Registry           |
| Pydantic Tool Execution Engine    |   | Consent & Contract Policy Engine    |
| Commodity Forecasting (1d-30d)    |   | Provider Adapter Resilience Mesh    |
+-----------------------------------+   +---------------------------------+
                    |                               |
+-------------------+-------------------------------+---------------------+
|                      Persistence Tier (PostgreSQL / Supabase)            |
| Relational Database (SQLAlchemy Async, Alembic 001-020, SQLite Fallback)|
+-------------------------------------------------------------------------+
```

## 3. Subsystem Breakdown

### 3.1 Core Backend (`/backend`)
- **API Framework**: FastAPI, Pydantic v2, Starlette.
- **Routing**: `backend/app/api/v1/router.py` aggregating 24 domain routers.

### 3.2 Database Tier (`/database`)
- **Canonical Engine**: PostgreSQL / Supabase.
- **ORM & Migrations**: SQLAlchemy 2.0 + Alembic (20 versions: `001_initial_schema.py` through `020_stage_29_trade_climate_resilience_schema.py`).
- **DDL Definitions**: `database/schema_postgresql.sql` (PostgreSQL/Supabase) and `database/schema.sql` (legacy/compat).

### 3.3 AI Agents Subsystem (`/agents`)
- **Coordinator**: `UnifiedSupervisorAgent` (`backend/app/agents/unified_supervisor.py`).
- **Execution Mechanism**: Agents call backend domain services exclusively via schema-validated Pydantic tools. Direct SQL write permissions for LLMs are blocked.

### 3.4 ML & Intelligence Subsystem (`/ml`)
- **Forecasting Engine**: `backend/app/services/ml_prediction_service.py`.
- **Target Commodities**: Tomato, Onion, Potato.
- **Horizons**: 1-day, 7-day, 14-day, 30-day.

### 3.5 Client Subsystems (`/android`, `/web`)
- **Android**: Kotlin, Jetpack Compose, Room DB, Retrofit2, Hilt DI. Native Tamil & English speech interaction.
- **Web**: Vanilla HTML5/CSS3/JS responsive dashboards fetching `/api/v1/` REST endpoints.
