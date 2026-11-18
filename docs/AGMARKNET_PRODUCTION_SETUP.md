# AgriMark AGMARKNET Production Data Pipeline

## Official sources

AgriMark uses the Government of India's AGMARKNET resources published through data.gov.in.

- Historical/backfill resource: `35985678-0d79-46b4-9ed6-6f13308a1d24`
- Daily/current resource: `9ef84268-d588-465a-a308-a864a43d0070`
- API host: `https://api.data.gov.in/resource/`

The pipeline never generates synthetic market observations. The Mandi Prices UI reads only the normalized `public.national_market_price_observations` table. The CSV staging table is not used by the public dashboard.

## Required GitHub Actions secrets

The official worker runs in GitHub Actions. It does **not** inherit Vercel or Render environment variables.

In GitHub, open **AgriMark → Settings → Secrets and variables → Actions → Repository secrets** and configure these values:

| Secret name | Value |
|---|---|
| `DATA_GOV_IN_API_KEY` | Your private data.gov.in API key |
| `SUPABASE_URL` | `https://tsdjtlmrvbspyzgwmccg.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | The private service-role/secret key for the canonical AgriMark Supabase project |

Do not commit these values, expose them through a `NEXT_PUBLIC_*` variable, or paste them into chat. The service-role key must remain server-side.

## Historical backfill and daily ingestion

Workflow: **Actions → AGMARKNET history and daily ingestion**.

1. Configure all three GitHub Actions secrets before running the workflow.
2. Run the workflow with mode `historical`. It resumes from the checkpoint stored in `national_agmarknet_ingestion_state` and pages through the full official historical resource.
3. Once historical backfill completes, run mode `daily` once to load the current daily resource.
4. The scheduled workflow runs every day and consumes every page reported by the official daily resource, not just its first 1,000 records.
5. If a run fails or reaches the safety limit, the job fails explicitly and can be rerun. Upserts and stored offsets make reruns resumable.

The worker command for local/manual operations is:

```bash
python scripts/data/ingest_agmarknet.py --mode historical
python scripts/data/ingest_agmarknet.py --mode daily
```

The public legacy route `GET /api/v1/mandi/ingest` is intentionally disabled. A browser GET must never trigger a data.gov.in download or write to the database.

## Data quality and dashboard rules

- The dashboard uses official AGMARKNET observations with positive modal prices.
- It displays the exact count and pages through the entire filtered result set.
- Minimum, modal, and maximum prices must satisfy `min_price <= modal_price <= max_price`.
- Missing arrival quantity stays `N/A`; the UI must not infer or invent arrivals.
- “Latest” and “freshness” labels must use the date of the latest source observation, not the time the dashboard was opened.
- Cross-sectional mandi prices from one date are not a time series. A forecast must use distinct observation dates and must show a baseline-only status when history is insufficient.
- Forecast targets must start after the current India-local date. The forecast read API is read-only and must not write forecast materializations as a side effect of GET.

## Supabase checkpoint table

Migration:
`database/migrations/202610170001_agmarknet_ingestion_state.sql`

Checkpoint table:
`public.national_agmarknet_ingestion_state`

Canonical market table:
`public.national_market_price_observations`

The checkpoint table is RLS-protected and only the backend service role should update it.
