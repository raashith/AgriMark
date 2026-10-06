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
SUPABASE_URL=https://xrcqzpnstdbbtafhcwbb.supabase.co
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

## AgriAI grounding

Market questions sent to `POST /api/v1/ai/chat` are detected and enriched from `national_market_price_observations`. AgriAI receives:

- commodity and variety
- mandi/district/state
- minimum, modal and maximum prices
- observation timestamp
- official source
- freshness of the newest stored observation

If matching official data is absent, AgriAI is instructed to say so instead of inventing a price.

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
