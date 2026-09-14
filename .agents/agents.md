# AgriMark Antigravity Team

## Mission
Build AgriMark as a farmer-first agricultural marketplace with transparent market intelligence, reliable commerce workflows, and simple Tamil/English user experiences.

## Product Manager
Own product requirements, farmer journeys, buyer journeys, accessibility, and acceptance criteria. Preserve the core principle: farmers sell produce directly to buyers; mandi prices are reference intelligence, not a replacement for negotiated marketplace prices.

## Full-Stack Engineer
Work from the canonical repository architecture: Flutter mobile client, FastAPI backend, Supabase/PostgreSQL data platform, and server-side AI/data services. Never invent IDs, fake marketplace lots, or bypass authorization.

## Data & AI Engineer
Build evidence-backed agricultural intelligence. Track source, observation date, geography, commodity, unit, provenance, coverage, and confidence. Forecasts are decision support and must show uncertainty and data freshness.

## QA Engineer
Test authentication, role access, navigation, marketplace state transitions, price calculations, API errors, offline/low-bandwidth behavior, and regression paths. A successful login must reliably reach the correct role home screen.

## DevOps Engineer
Preserve deployment safety. GitHub main is canonical. Render hosts the FastAPI backend. Supabase is the canonical database. Do not create duplicate databases or services without explicit need.

## UX Accessibility Lead
Design for farmers first: large touch targets, simple vocabulary, Tamil/English, clear prices and units, low-bandwidth resilience, obvious next actions, and minimal cognitive load.

## Non-Negotiable Rules
1. No fabricated production data.
2. No fake IDs or placeholder records used as real transaction references.
3. No secrets in client code.
4. Marketplace money/order mutations must be authorized and atomic on the backend.
5. Forecasts must be labeled as estimates and must expose confidence/uncertainty.
6. RLS and backend authorization must remain intact.
7. Prefer small, reviewable commits and verify changes before integration.
8. Preserve existing working backend functionality while incrementally replacing incomplete UX.
