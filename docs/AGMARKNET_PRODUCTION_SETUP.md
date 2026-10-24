# AgriMark AGMARKNET Production Data Pipeline

## Official sources

AgriMark uses the Government of India's AGMARKNET feeds published through data.gov.in.

- Historical/backfill resource: `35985678-0d79-46b4-9ed6-6f13308a1d24`
- Daily/current resource: `9ef84268-d588-465a-a308-a864a43d0070`
- API host: `https://api.data.gov.in/resource/`

The pipeline never generates fallback/synthetic market observations.

## Runtime secrets

Set these on the Render backend service:

```
DATA_GOV_IN_API_KEY=<your data.gov.in API key>
SUPABASE_URL=https://tsdjtlmrvbspyzgwmccg.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<Supabase secret/service-role key>
```

Never put either secret in GitHub, the browser, or chat.

## Ingestion

The resumable worker is:

```
python scripts/data/ingest_agmarknet.py --mode both
```

Each run ingests one page of the historical feed until the stored checkpoint reaches the source total. After historical backfill is complete, `both` continuously processes the daily feed.

Checkpoint state is stored in `national_agmarknet_ingestion_state`, so a restarted cron job resumes instead of starting over.

## AgriAI grounding and app context

Market questions sent to `POST /api/v1/ai/chat` are enriched from the live `national_market_price_observations` schema. The query uses the deployed table's actual columns (`observation_date`, `variety`, `arrival_quantity`, `source`) and resolves user-facing crop/state/mandi names from the reference tables.

AgriAI receives a bounded, newest-first sample of matching official observations plus the matching record count, date coverage, freshness, and observed modal-price range. It can compare recorded mandi prices and explain observed differences. It must not treat different mandis on the same date as a time series or claim a trained forecast when distinct dates are insufficient.

AgriAI also receives app capability context and, when the user is authenticated and asks relevant questions, read-only context for that user's own farms, cultivation plans, harvests, produce lots, orders, offers/RFQs, and relevant public marketplace listings. Context retrieval is scoped and bounded; the assistant does not receive unrestricted access to all users' private data and cannot directly mutate database records. Any transaction or high-impact change must go through the authorized application workflow and be confirmed by the backend.

If matching official data is absent or the database query fails, AgriAI must say so instead of inventing a price. Service-role credentials remain backend-only.

## Scheduling

Use a Render Cron Job against the same repository:

```
Build: pip install -r backend/requirements.txt
Command: python scripts/data/ingest_agmarknet.py --mode both
Schedule: 0 * * * *
Region: Singapore
```

The cron service needs the same three runtime variables above. Render cron jobs do not inherit another service's variables automatically; link an environment group or add the variables to the cron service.

## Database

Migration:
`database/migrations/18_agmarknet_ingestion_state.sql`

Canonical market table:
`national_market_price_observations`

Only records marked `is_synthetic = false` and `source = AGMARKNET_*` are used for official market grounding.
