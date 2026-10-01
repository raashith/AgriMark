# /agrimark_cycle

description: Build one complete AgriMark feature from product acceptance through verified delivery.

## Steps
1. Product: read `README.md`, `docs/AGRIMARK_PRODUCT_SPEC.md`, and `.agents/agents.md`. Define one user-complete slice and acceptance criteria.
2. Architecture: inspect the relevant Flutter screens/repositories, FastAPI routes/services/schemas, Supabase migrations/tables/RLS, tests, and deployment configuration before editing.
3. Build: implement the slice across only the necessary layers. Preserve real database IDs, backend authorization, atomic inventory/order mutations, and typed API contracts.
4. Verify: run available tests, lint/static checks, app build checks, and targeted happy/failure paths. Verify authentication/navigation and data invariants.
5. UX review: check farmer readability, touch targets, Tamil/English-ready labels, units, loading/empty/error states, and low-bandwidth behavior.
6. Data/AI review: verify source, date, geography, unit, provenance, freshness, confidence, and uncertainty whenever intelligence is displayed. Never fill missing historical data with invented values.
7. Delivery: create a focused feature branch/commit, open a PR to `main`, and report exactly what changed, what was verified, and remaining limitations.

Never force-merge unrelated Git histories. Never treat demo fixtures as production data. Never claim a feature is complete without verification evidence.
