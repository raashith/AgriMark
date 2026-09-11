# AgriMark Supabase Canonical Integration

Supabase/PostgreSQL is the single canonical application database for AgriMark.

## Production project

Project ref: `xrcqzpnstdbbtafhcwbb`

The backend connects through environment variables such as `SUPABASE_URL` and server-side database credentials. Browser and Android clients never connect directly to PostgreSQL.

## Canonical domains

The production schema includes core farmer/marketplace tables plus identity, seed/bio, logistics, finance, trade/climate, data commons, innovation, RFQ/offer/order domains.

## Rules

1. Keep all schema changes in source-controlled PostgreSQL migrations.
2. Do not create or maintain a second production database on Render.
3. API authorization belongs in FastAPI; agents never write directly to the database.
4. RLS is enabled on application tables and must remain covered by explicit least-privilege policies as user/auth flows are enabled.
5. The schema in production must be verified against migrations before release.
