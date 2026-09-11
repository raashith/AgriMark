# AgriMark Implementation Status

## Purpose

This file tracks implementation evidence separately from the long-term roadmap. A roadmap item is not considered implemented merely because it is documented.

## Current Repository-Level State

- GitHub repository: `raashith/AgriMark`
- Default branch: `main`
- Visibility: public
- Canonical database architecture: PostgreSQL / Supabase
- Backend target: Python / FastAPI
- Android target: Kotlin / Jetpack Compose
- Web target: web client consuming backend APIs
- AI target: server-side agent/tool architecture

## Evidence Rules

A capability should be marked implemented only when repository code, tests, migrations, configured integrations or deployment evidence support the claim.

Suggested status values:

- `PLANNED` — roadmap/design only
- `SCAFFOLDED` — code structure exists but feature is incomplete
- `IMPLEMENTED` — feature exists and basic tests/checks support it
- `INTEGRATED` — connected to required dependencies/services and verified
- `PILOT` — validated in a controlled real-world cohort
- `PRODUCTION` — deployed and operationally verified
- `BLOCKED` — dependency, credential, authorization or infrastructure prevents completion

## Verification Checklist

Before marking a component production-ready, verify:

- source code exists in the repository
- configuration is present without secrets
- database migrations are reproducible
- API contract is defined
- automated tests pass
- security checks have run
- logs/metrics are available where required
- external integrations are actually connected
- failure and rollback behavior is tested
- audit and provenance records exist where required
- human approval exists for high-impact actions

## Known Architecture Direction

The platform roadmap contains 30 stages ranging from the core marketplace/ML foundation through national intelligence, interoperability, climate, finance, physical AI and the unified agricultural operating system. Those stages are strategic architecture and should not be treated as proof of current implementation.

The existing Supabase project is the intended canonical PostgreSQL backend infrastructure. Any legacy MySQL artifacts must be migrated/adapted rather than creating a parallel production database.

## Update Procedure

After each meaningful implementation milestone:

1. Inspect actual changed files and migrations.
2. Run relevant automated tests and static checks.
3. Verify external dependencies and credentials without exposing secrets.
4. Record evidence and blockers here.
5. Link the relevant commit/PR/deployment when available.
6. Never replace `BLOCKED` or `PLANNED` with `PRODUCTION` based on documentation alone.
