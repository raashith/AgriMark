# AgriMark Stitch App Architecture

## Purpose

The Stitch application is a separate frontend/client for AgriMark. The existing production `web/` application remains the authoritative production web experience.

## Application boundaries

- `web/` = existing production Next.js web application. Do not replace or overwrite it with raw Stitch exports.
- `stitch-app/` = Stitch-derived application/client. It may evolve independently and consumes the same approved AgriMark APIs and Supabase data model.
- `backend/` = existing FastAPI backend and business logic.
- Supabase = authoritative Auth + PostgreSQL + Storage data layer.

## Data flow

Stitch App -> AgriMark API (`NEXT_PUBLIC_API_BASE_URL`) -> Supabase

For frontend-only reads that are explicitly safe under RLS, the Stitch App may use the Supabase publishable key. Privileged operations must stay behind the backend/API.

## Deployment

- Production Web: existing Vercel project for `web/`.
- Stitch App: separate Render Web Service, based on `stitch-app/` when the app folder is implemented.
- Backend: existing Render service `agrimark-api`.
- Database/Auth: existing Supabase project.

## Rules

1. Never copy secrets into the Stitch App.
2. Never put service-role/secret Supabase keys in browser code.
3. Preserve existing auth/RBAC and API contracts.
4. New Stitch UI should map to existing AgriMark routes/workflows where possible.
5. Production `web/` remains the fallback and canonical web deployment until the Stitch App has passed integration and QA.
6. Shared types/contracts should be documented or extracted rather than duplicating business logic.
