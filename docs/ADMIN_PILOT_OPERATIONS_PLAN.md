# AgriMark Admin Operations & Controlled Pilot Plan

## Purpose

Prepare the existing AgriMark platform for a controlled real-world pilot, with the first operational priority being a complete farmer-to-buyer marketplace and order journey. This plan extends the existing Next.js, FastAPI, Supabase, Firebase, Vercel and Render architecture. It does not introduce a duplicate app or synthetic production data.

## Current implementation scope

The existing admin route is `/admin/dashboard`. The pilot operations dashboard is being upgraded to read a minimal overview through the authenticated backend endpoint:

- `GET /api/v1/admin/operations/overview`
- Admin-only authorization is enforced by the backend, not only by client-side route hiding.
- Counts and recent records are read from database tables.
- Missing or inaccessible data sources are returned as explicit source errors; the UI must not turn them into fabricated zero values.
- The overview returns minimal fields for recent listings, orders and audit events. It must not return secrets or unnecessary user PII.

The endpoint expects the canonical operational tables `profiles`, `listings`, `marketplace_orders`, `admin_audit_log`, and `national_market_price_observations`. If a table is absent from the connected database, the admin dashboard should surface that as an integration gap.

## Important environment verification gate

The pilot runbook historically names Supabase project `xrcqzpnstdbbtafhcwbb`. The inspected frontend Supabase client currently pins the public host `tsdjtlmrvbspyzgwmccg.supabase.co`, while the database inspection for the latter project showed profiles, listings, produce lots and mandi tables but did not show `marketplace_orders` or `admin_audit_log`.

Do not assume the runbook and live app point to the same database. Before enabling real pilot orders:

1. Confirm the intended production Supabase project using the Vercel and Render environment configuration, without printing credentials.
2. Inspect the target schema and migration history.
3. Apply reviewed migrations only to the confirmed target project.
4. Confirm the backend service-role configuration and browser publishable key refer to that same project.
5. Run a read-only health check and a controlled order test using pilot accounts.

Do not create a second order table just to make a dashboard card work. Reconcile the canonical schema first.

## Admin dashboard sections

### 1. Overview
- Registered profiles and farmer profiles.
- Active listings.
- Marketplace order count.
- Latest stored mandi observation date.
- Data-source availability and recent audit events.

Every value must be derived from a live query. If a source fails, show unavailable plus the source label.

### 2. Marketplace operations
- Search and inspect listings.
- Review listing status and source produce lot.
- Inspect order lifecycle, quantity, price and participants.
- Surface stuck orders, inventory mismatches and failed cancellations.
- Moderate listings only through authenticated, audited server-side actions.

### 3. User operations
- Review account and role status.
- Keep role changes and account suspension behind a server-side admin authorization check.
- Never allow public self-registration as admin.
- Avoid exposing private user details unless required for a documented operational task.

### 4. Data and AI operations
- Display the most recent mandi observation date and source.
- Monitor ingestion failures, duplicate records, unit inconsistencies and unresolved crop mappings.
- Separate observed prices, derived statistics, AI explanations and forecasts.
- Do not publish price comparisons when source, unit, crop match or freshness is invalid.

### 5. Audit and incident review
- Show recent critical actions and their timestamps.
- Ensure administrative changes and order-state changes are auditable.
- Keep credentials, tokens, passwords and unnecessary personal data out of logs.
- Track incidents with severity, owner, mitigation and closure notes.

## Marketplace release acceptance criteria

- A farmer can create a listing only for an authorized, available produce lot.
- A buyer can place an order only while authenticated and permitted.
- Buyers cannot buy their own listings.
- Requested quantity meets the minimum and does not exceed available stock.
- Inventory reservation and order creation are atomic and safe under concurrent requests.
- Retries cannot accidentally create duplicate orders.
- Invalid order-state transitions are rejected server-side.
- Cancellation restores inventory exactly once when allowed.
- Buyer and seller views agree on order status.
- Admin dashboard figures match independent source queries for the same measurement window.
- Missing tables and permission errors are visible; they are never disguised as zero.
- Critical authorization and inventory-integrity tests pass before pilot launch.

## Eight-week delivery plan

| Week | Milestone | Owner | Exit criteria |
|---|---|---|---|
| 1 | Environment/schema audit | Technical lead | Correct production project and canonical schema confirmed |
| 2 | Listing/order workflow stabilization | Backend lead | Reservation, ownership, retry and cancellation tests pass |
| 3 | Admin overview | Frontend + backend leads | Real metrics render through the admin-only endpoint |
| 4 | Order/listing operations | Marketplace owner + engineers | Admin can investigate exceptions without direct database edits |
| 5 | Security and data-quality review | Security + data owner | RLS, authorization, units, provenance and outlier checks pass |
| 6 | Pilot rehearsal | Pilot owner | All critical end-to-end scenarios pass |
| 7 | Controlled pilot | Pilot owner + support | Real participants can complete the workflow with no critical incident |
| 8 | Pilot review and go/no-go | Product owner | Measured results, issue list and expansion decision approved |

## Roles

- **Product/pilot owner:** scope, milestones, acceptance criteria and go/no-go decision.
- **Technical lead:** architecture, environment configuration, migrations, deployments and rollback.
- **Marketplace operations owner:** listings, order exceptions, fulfilment and user support.
- **Data/AI owner:** market ingestion, price provenance, crop mapping and AI evaluation.
- **Security owner:** role permissions, RLS, audit coverage and incident response.

One person can hold multiple roles during the initial pilot, but each critical task must have a named owner.

## Initial KPIs

Targets below are proposed starting thresholds; baseline and measurement definitions must be recorded in Week 1.

| KPI | Initial target | Cadence |
|---|---|---|
| Critical end-to-end tests passing | 100% before launch | Each release |
| Overselling in concurrency tests | 0 | Each release |
| Unauthorized cross-user access in tests | 0 | Each release |
| Valid order success during stable service | At least 98% | Weekly |
| Audited orders with consistent inventory/state | 100% | Daily during pilot |
| Dashboard metrics matching source queries | 100% of verified metrics | Each release |
| Displayed market comparisons with validated source/unit | 100% | Each ingestion run |
| Critical incidents without an owner | 0 | Daily |
| Pilot orders with a recorded outcome by review date | At least 95% | Weekly |

## Daily and weekly operating routine

Daily:
- Check Vercel and Render deployment status and backend health.
- Review failed orders, stuck states and inventory exceptions.
- Review data-ingestion freshness and AI comparison failures.
- Assign an owner to every critical incident.

Weekly:
- Review active farmers/buyers, listings, orders, cancellations and completed deliveries.
- Audit a sample of transactions and inventory movements.
- Review pilot feedback and marketplace conversion.
- Prioritize the next release based on measured user impact.

## Release checklist

1. Work on a focused branch and open a reviewed pull request.
2. Run frontend lint, TypeScript checks and production build.
3. Run backend tests and marketplace integration tests.
4. Review all database migrations and confirm their target project.
5. Deploy and wait for the platform to report ready.
6. Smoke-test admin authorization, listing reads and the full buyer order journey.
7. Record commit SHA, deployment result, test result and rollback reference.

## Pilot go/no-go checklist

Do not begin the real-world pilot until:
- The production Supabase project and schema are confirmed.
- The order and audit tables expected by the backend exist in that target schema.
- The buyer order endpoint enforces authentication and server-side role/ownership checks.
- Inventory reservation is atomic and cancellation is idempotent.
- Admin overview is protected by backend authorization.
- Critical tests pass and monitoring/support ownership is documented.
- No critical security or transaction-integrity issue remains.

## Immediate next actions

1. Finish the authenticated admin overview endpoint and dashboard integration.
2. Run the new admin endpoint authorization tests.
3. Reconcile the live database project and canonical marketplace schema.
4. Test the backend order RPC and order status/cancellation behavior.
5. Complete the pilot readiness checklist before onboarding real users.
