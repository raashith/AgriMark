# /agrimark_cycle

Use this workflow to develop AgriMark end-to-end with Antigravity agents.

## Stage 1 — Product
Read `README.md`, `.agents/agents.md`, and `.agents/skills/agri_mark_build.md`. Inspect the current repository and identify one user-complete slice. Do not redesign working backend behavior without evidence.

## Stage 2 — Architecture
Inspect the relevant Flutter, FastAPI, Supabase schema/migrations, tests, and deployment configuration. Record dependencies and acceptance criteria before writing code.

## Stage 3 — Build
Implement the slice across the necessary layers. Keep API contracts typed and validate authorization at the backend. Keep secrets out of the client.

## Stage 4 — Verify
Run available tests and static checks. Exercise authentication/navigation and the feature's happy path plus failure states. Check that real database IDs flow through commerce mutations.

## Stage 5 — Review
Act as QA and UX Accessibility Lead. Fix issues rather than merely reporting them when they are local and unambiguous. Verify Tamil/English-ready labels, units, loading states, empty states, and low-bandwidth behavior.

## Stage 6 — Delivery
Create a focused commit on a feature branch. Do not force-merge unrelated Git histories. Open a PR into `main` and report exactly what was changed, what was verified, and what remains.
