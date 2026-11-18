# AgriMark AGMARKNET Production Data Pipeline

## Official sources

AgriMark ingests Government of India AGMARKNET records published through data.gov.in.

- Historical/backfill resource: `35985678-0d79-46b4-9ed6-6f13308a1d24`
- Daily/current resource: `9ef84268-d588-465a-a308-a864a43d0070`
- API host: `https://api.data.gov.in/resource/`

The pipeline is fail-closed: it never generates synthetic market observations and never substitutes the CSV staging table for verified canonical observations.

## Secrets and environment variables

The GitHub Actions workflow and any separately configured Render Cron Job have independent environment-variable stores. Configuring a secret on Render does not make it available to GitHub Actions.

Add these **repository Actions secrets** in GitHub → Settings → Secrets and variables → Actions:

| Secret | Required | Purpose |
| --- | --- | --- |
| `DATA_GOV_IN_API_KEY` | Yes | Official data.gov.in API authentication |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Server-side writes to the canonical Supabase project |
| `SUPABASE_SECRET_KEY` | Alternative | Accepted when `SUPABASE_SERVICE_ROLE_KEY` is not set |

The canonical Supabase URL is configured by the workflow as `https://tsdjtlmrvbspyzgwmccg.supabase.co`; a separate `SUPABASE_URL` Actions secret is not required.

For a Render Cron Job, set `DATA_GOV_IN_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY` (or `SUPABASE_SECRET_KEY`) in that cron service's own environment. `SUPABASE_URL` can be set explicitly but defaults to the canonical project URL.

Never place API keys or Supabase service-role/secret keys in the browser, source control, public logs, or chat.

## Ingestion worker

The resumable worker is:

```bash
python scripts/data/ingest_agmarknet.py --mode both
```

Modes:
- `historical`: continue the official historical resource from its stored offset.
- `daily`: continue the official daily resource from its stored offset.
- `both`: select historical until its stored total is complete, then process daily.

The worker reads the existing national state, district, mandi and commodity catalogs first. When source names match existing catalog entries, it reuses their canonical IDs. It de-duplicates lookup dimensions and observation keys within each 1,000-record page before issuing Supabase upserts. This avoids duplicate-conflict rows in one batch and prevents new short-code aliases from replacing existing catalog IDs.

Each worker invocation processes one page and saves the next offset in `national_agmarknet_ingestion_state`. The GitHub Actions workflow loops over multiple pages during each run:
- Manual historical backfill: up to 250 pages per dispatch, then resumes from the saved offset on the next dispatch if needed.
- Scheduled daily ingestion: up to 40 pages per scheduled run, then resumes from the saved offset on the next scheduled run.
- Manual daily refresh: configurable 1–250 page batch.

The observation upsert uses the canonical unique key `(observation_date, mandi_code, commodity_code, variety, grade, source)`. Re-running a page is safe: an existing observation is updated rather than duplicated.

## Run the GitHub Actions workflows

1. Configure the required GitHub Actions secrets above.
2. Open Actions → **AGMARKNET history and daily ingestion**.
3. For initial backfill, choose `historical` (or `both` to continue into the daily resource after history completes).
4. For a one-time current-data refresh, run **Manual AGMARKNET latest data refresh**.
5. Review the run summary and the `national_agmarknet_ingestion_state` checkpoint.

The scheduled workflow runs daily at 01:20 UTC. It will not make progress until the GitHub Actions secrets are configured.

## Supabase tables

- Canonical prices: `public.national_market_price_observations`
- Lookup catalogs: `public.national_states`, `public.national_districts`, `public.national_mandis`, `public.national_commodities`
- Resume checkpoint: `public.national_agmarknet_ingestion_state`

The Market Prices page reads only `national_market_price_observations`. `agmarknet_csv_import_staging` remains a separate staging table and is not used as a fallback source for public price cards.

## Data freshness and forecasting

The UI displays the latest observation date supplied by the canonical source. A successful page request or a non-empty database is not evidence of current-day data: freshness is determined from `observation_date`.

A previous-price comparison is restricted to the same commodity, mandi, state, variety and grade. A seven-day forecast is not presented as trained unless enough distinct official dates exist for that exact series and a model has separately been validated. Different mandis observed on the same day are not a time series.

The source may omit arrival quantity. In that case the UI displays `N/A`; it must not infer or fabricate arrivals.

## AgriAI grounding

Market questions sent to `POST /api/v1/ai/chat` are enriched from the canonical `national_market_price_observations` table and related lookup catalogs. AgriAI can compare recorded mandi prices and explain observed differences, but it must not treat different mandis on the same date as a time series or claim a trained forecast when distinct dates are insufficient.

If matching official data is absent or the database query fails, AgriAI must say so rather than invent a price. Service-role credentials remain backend-only.
