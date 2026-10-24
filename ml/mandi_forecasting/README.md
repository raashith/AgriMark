# AgriMark Mandi Price ML Trainer

This is the real-data training pipeline for the 1–7 day modal-price forecast. It reads the canonical `public.national_market_price_observations` table and never fabricates missing price dates.

## Run

From the repository root (PowerShell):

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r ml/requirements.txt
$env:SUPABASE_URL = "https://tsdjtlmrvbspyzgwmccg.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY = "<server-side service role key>"
python ml/mandi_forecasting/train.py
```

Use a server-side secret only; never use a `NEXT_PUBLIC_*` key as a service-role credential or commit secrets.

## Training rules

- Aggregates duplicate reports by commodity, state, mandi and date using median modal price.
- Uses exact observed target dates for each 1–7 day horizon; missing dates are not filled with fake values.
- Uses lag, rolling mean/volatility, arrivals, horizon and commodity/state/mandi features.
- Uses a chronological holdout, reports MAE/RMSE and compares with a last-observed-price baseline.
- Saves a model artifact and report only when minimum history and sample thresholds are met.
- Model output is not production-approved merely because training succeeds; it must beat the baseline on holdout data.

## Current database limitation

The last audited canonical table had 11,436 rows but only one distinct observation date (2026-10-16). With that snapshot, a temporal forecasting model cannot be validly trained or tested. The script intentionally exits without producing an artifact until genuine historical dates have been ingested. This is safer than training a model that only memorizes a single-day cross-section.
