# AgriMark Controlled Real-World Pilot Runbook

## Overview
This runbook establishes operational procedures, environment deployment specs, role credentials, transaction boundaries, monitoring alerts, and rollback protocols for the AgriMark Controlled Real-World Pilot.

---

## 1. Pilot Architecture & Roles
- **Production Baseline**: Next.js 14 App Router on Vercel connected to Supabase PostgreSQL (`xrcqzpnstdbbtafhcwbb`).
- **Participant Roles**:
  1. **Farmer**: Manages farm boundaries, crop cultivations, field observations, harvest lots, and listings.
  2. **Buyer**: Submits RFQs, inspects produce provenance, places transaction-safe wholesale orders.
  3. **FPO / Co-op**: Aggregates member harvests, coordinates bulk input procurement.
  4. **Logistics**: Accepts pickup tasks, submits real-time GPS telemetry, manages delivery transitions.
  5. **Admin**: Audits platform interactions, monitors system health, moderates listings.

---

## 2. Environment Setup & Data Isolation
- **Production Database**: Supabase (`xrcqzpnstdbbtafhcwbb`).
- **Seeding Strategy**: Synthetic identity seed scripts located in `scripts/pilot/seed_pilot_data.ts` (strictly excluded from production via `NODE_ENV` guards).
- **Row Level Security (RLS)**: Active across all primary tables (`profiles`, `farms`, `cultivations`, `produce_lots`, `listings`, `marketplace_orders`).

---

## 3. Transaction-Safe Order & Inventory Protocol
- Inventory mutations are performed exclusively via server-side APIs (`/api/marketplace/order`).
- Oversell protection enforces `requested_quantity <= available_quantity`.
- Order lifecycle states: `pending` → `confirmed` → `processing` → `ready_for_pickup` → `in_transit` → `delivered` → `completed`.
- Cancellations automatically restore reserved quantity to active produce lot inventory.

---

## 4. Monitoring & Audit Controls
- Every critical mutation emits a structured audit record to `admin_audit_log`.
- PII, passwords, and service-role keys are stripped before log insertion.
