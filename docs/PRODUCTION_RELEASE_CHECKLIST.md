# AgriMark — Production Release & Deployment Guide
Version: 1.0.0 (Release Candidate 1)

## 1. Production Architecture Overview

```
[ Web Client / Android App ]
             │
   (HTTPS / REST API / JWT)
             ▼
    [ FastAPI Backend ]
   (Port 8000 / Gunicorn)
        │         │
        │         ▼
        │   [ AgriAI Engine & External Adapters ]
        │   (AGMARKNET, IMD Weather)
        ▼
[ PostgreSQL / Supabase DB ]
(xrcqzpnstdbbtafhcwbb.supabase.co)
```

- **Client Boundaries**: Web and mobile clients connect strictly via HTTPS REST APIs at `/api/v1/`. No direct database connection strings or service role keys are exposed to client code.
- **Fail-Fast Database Safety**: Production configuration (`ENV=production`, `DATABASE_ENV=production`) disables in-memory SQLite fallbacks. Unreachable primary database connections trigger immediate fatal error logging and app health alerts.

---

## 2. Release Verification Checklist

- [x] **Automated Tests**: 65/65 Pytest unit, integration, and API tests passing.
- [x] **FastAPI Route Registry**: 174 OpenAPI endpoints registered and documented.
- [x] **Correlation Headers**: `X-Request-ID` and `X-Process-Time` HTTP middleware active for request tracing.
- [x] **Health Check Endpoints**: `/api/v1/health` and `/api/v1/health/db` online for readiness & liveness probes.
- [x] **Database Schema**: 28 SQLAlchemy ORM models mapped to PostgreSQL DDL tables in `database/schema.sql`.
- [x] **Atomic Inventory**: Thread-locked reservation preventing negative stock allocations during order creation.
- [x] **Farmer Data Security**: JWT Bearer token authentication and strict `farmer_id` ownership checks on all private routes.
- [x] **Offline Queue**: Idempotent deduplication queue for offline notes, tasks, expenses, and harvests.
- [x] **Environment Variables**: Documented in `.env.example` with zero hardcoded production secrets in Git.

---

## 3. Production Deployment Commands

### A. Environment Configuration
Copy `.env.example` to `.env` on the production server and populate secure keys:
```bash
cp .env.example .env
```

### B. Database Migration (Alembic / Supabase)
Apply Alembic migrations to the canonical PostgreSQL instance:
```bash
alembic upgrade head
```

### C. Start Production Server (Gunicorn / Uvicorn Workers)
```bash
gunicorn backend.app.main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000 --access-logfile - --error-logfile -
```

### D. Verify Production Liveness Probe
```bash
curl -f http://localhost:8000/api/v1/health/db
```

---

## 4. Rollback Procedure

In the event of a deployment incident:
1. Revert to the previous git commit tag (`git checkout tags/v1.0.0-rc1`).
2. Rollback database migrations if schema changes occurred: `alembic downgrade -1`.
3. Restart production application workers: `systemctl restart agrimark-backend`.
