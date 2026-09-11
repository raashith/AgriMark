# Render + Supabase Production Wiring

AgriMark production topology:

`Web / Android -> FastAPI on Render -> Supabase PostgreSQL`

Render service: `agrimark-api`

Required server-side environment variables:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (server-side only; never expose to clients)
- `DATABASE_URL` or equivalent PostgreSQL connection variable used by the backend
- `OPENAI_API_KEY` (server-side only)

The application must not connect from browser/Android directly to PostgreSQL.

Render should deploy only from the canonical GitHub `main` branch after CI passes.
