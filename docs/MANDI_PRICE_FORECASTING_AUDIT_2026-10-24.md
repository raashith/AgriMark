# AgriMark Mandi Price & Forecasting Audit
**Audit date:** 2026-10-24  
**Scope:** public market-price endpoint, forecast path, observed data in Supabase, deployment wiring and next-stage roadmap.

## Executive finding
The canonical Supabase project is `tsdjtlmrvbspyzgwmccg`. It currently contains 11,436 rows in `public.national_market_price_observations`, 190 commodity codes, 25 state codes and 1,051 mandi codes. All 11,436 rows are dated **2026-10-16**; there is only one distinct observation date. This is enough to show genuine recorded prices, but it is not a historical time series and cannot support a learned seven-day trend yet.

## Confirmed defects / risks

### P0 — Forecast page makes an invalid time series from a cross-section
`web/src/app/market-prices/page.tsx` aggregates price rows across markets by `observation_date` and calls five distinct dates a trained/local trend readiness gate. Present canonical data has one date. The UI must display an explicit **baseline only / insufficient history** state and not describe it as a trained model. Forecasting should be per (commodity, market/mandi) with a separately labelled state or national aggregate.

### P0 — Selected state/mandi filters do not propagate to the client forecast series
The page computes `history` from all `forecastRows`, but commodity selection is the only selector required before creating a forecast; market/state selections can cause the forecast series to aggregate unrelated markets. Group by exact canonical identifiers and only forecast a single mandi series, or clearly switch to a named state-level aggregate.

### P0 — Ingestion/forecast schemas are inconsistent
`web/src/app/api/v1/mandi/forecast/route.ts` selects `observation_date` from the canonical table and fits from that column. But the ingestion route `web/src/app/api/v1/mandi/ingest/route.ts` writes fields such as `variant_code`, `price_signal_type`, `observed_at`, `unit`, `validation_status`, `data_layer`, `is_synthetic`, `commodity_name`, and `raw_payload`, and upserts dimensions using `name` where the inspected canonical dimension schema exposes `state_name`, `district_name`, `mandi_name` and `national_commodities.name`. Treat this endpoint as schema-drifted until it is aligned against the live schema and covered by an integration test. Do not use it as an ingestion mechanism until each write is checked for `error`.

### P0 — Default Supabase URL split-brain risk
The forecast route defaults to `tsdjtlmrvbspyzgwmccg`, but `web/src/app/api/v1/mandi/ingest/route.ts` still has a fallback URL for a different project (`xrcqzpnstdbbtafhcwbb`). Remove all legacy project fallbacks and use one server-side validated config for all market endpoints. Fail closed on a missing or unexpected URL instead of silently reading another project.

### P1 — Current prices have suspicious values requiring row-level validation
The database contains modal prices as low as 0.01/0.12 for multiple commodities. Do not silently delete them; compare to the raw source and mark invalid/outlier rows with a reason. Validate `min_price <= modal_price <= max_price`, positive values, source date validity, and duplicates per (commodity, variety, grade, mandi, date, source).

### P1 — Market prices API relies on two sources and silently truncates at configured maximum
`web/src/app/api/market-prices/route.ts` queries both canonical observations and `agmarknet_csv_import_staging`, loads all references, then merges/deduplicates and slices. The frontend requests 10,000 rows and calculates a local forecast from only the loaded rows. Move aggregation and forecasting to a server-side API/RPC over bounded filtered history; return explicit row counts and history coverage. Avoid using a page cap as the model training window.

### P1 — Forecast materialization can claim validated without validation
Forecast route inserts `validation_status: 'VALIDATED'` into prediction rows without computing a documented out-of-sample score in that request. Keep status as `UNVALIDATED` or use a model-run validation result that has a proper backtest artifact. A model fit is not the same as validation.

### P1 — Forecast write failures are not surfaced
The forecast route ignores errors from inserts into `national_forecast_runs` and `national_forecast_predictions`, and returns predictions even when materialization fails. Return forecast output with an explicit `persistence_status`, log a request/run correlation ID, and expose a structured, non-sensitive warning.

### P2 — Forecast engine date/time handling
`web/src/lib/mandi-forecast.ts` uses local-time `setDate` and then ISO UTC serialization. Use UTC date arithmetic for day-based forecasts. Its lower confidence bound also has a hard minimum of 50, which is not a valid generic constraint for every commodity; bound it at zero (or a domain-specific floor) and document the interval method.

## Required workflow
1. Verify one canonical project and exact columns through schema introspection.
2. Ingest official data with a protected server-side job, paginated cursors/offsets, idempotency key, validation counts and a run ledger.
3. Canonicalize state/commodity/mandi identifiers before inserting the observation.
4. Verify fresh observations exist and are increasing across dates; do not infer history from many records on one date.
5. Query exact filtered history from server-side SQL/RPC or API; keep commodity + market scope stable.
6. Run rolling-origin/backtesting against a naive benchmark, persist metrics, then generate/persist forecast results with model version and provenance.
7. UI labels actual observed prices separately from baseline/forecast, shows as-of timestamp/source, gaps, confidence band, and insufficient-history messages.
8. Run regression tests against production-shaped data and a preview deployment before promoting.

## Acceptance criteria
- Market table shows observed price, date, source and explicit empty/error states for every valid filter combination.
- Selected commodity/state/mandi returns rows that match all selected canonical identifiers; resetting one selector clears invalid dependent selectors.
- No forecast is labelled trained/validated without enough distinct dated observations and a stored chronological validation result.
- With the current one-date dataset, forecast UI explicitly says baseline-only and does not claim a learned trend.
- All market endpoints are configured to the same Supabase project; no old-project fallback is present.
- Ingestion reports fetched/accepted/rejected/inserted/duplicate/error counts, never reports success if individual writes fail, and is safely rerunnable.
- Forecast comparisons use rolling-origin evaluation and record MAE/RMSE plus a naive seasonal/last-value baseline.
- Security: service-role/secret keys remain server-only; public read uses a publishable/anon key under RLS; no credentials are logged.

## Future roadmap (in priority order)
1. **Data reliability:** daily automated ingestion, catch-up backfill, retries with bounded exponential backoff, source freshness alerts, dead-letter records and admin replay.
2. **History:** official historical prices and arrivals; coverage dashboard by commodity/state/mandi/date; holiday/non-trading-day gap handling; source reconciliation.
3. **Forecast quality:** seasonal-naive, ETS/Holt-Winters, SARIMA, and tree models with lag/rolling/seasonal/arrival/weather/MSP features; promotion based on rolling backtest only. Use per-mandi models when sufficient data exists and robust state/commodity fallback otherwise.
4. **Prediction transparency:** last actual date, days of history, model/version, last validation date, MAE/RMSE/MASE, interval calibration, confidence/readiness and reasons for a baseline fallback.
5. **Farmer decision support:** net realization calculator including transport/commission/quality/wastage; nearest-mandi comparison; best market suggestion with distance and price age; save-watchlists and price alerts.
6. **Market intelligence:** price spread and convergence between mandis, arrival-price relationships, seasonal calendar, volatility/spike/anomaly alerts, MSP reference where applicable, and market map.
7. **Product polish:** Tamil and other regional language labels, units consistently ₹/quintal, CSV exports, mobile-friendly charts, low-bandwidth caching, accessible filters and skeleton/error/retry states.
8. **Governance:** source licensing/provenance, data quality review queue, forecast drift monitoring, model rollback/champion history and audit trails.

## Source evidence
- Repository implementation: `web/src/app/market-prices/page.tsx`, `web/src/app/api/market-prices/route.ts`, `web/src/app/api/v1/mandi/forecast/route.ts`, `web/src/app/api/v1/mandi/ingest/route.ts`, `web/src/lib/mandi-forecast.ts`.
- Live Supabase introspection performed 2026-10-24: 11,436 observations; min/max date 2026-10-16; one distinct date; 190 commodities; 25 states; 1,051 mandis. Canonical table columns include `observation_date`, `state_code`, `district_code`, `mandi_code`, `commodity_code`, `variety`, `grade`, `arrival_quantity`, `min_price`, `max_price`, `modal_price`, `source`, `source_record_id`, `raw_record`.
- Official dataset: https://www.data.gov.in/resource/current-daily-price-various-commodities-various-markets-mandi
- Forecasting design reference: https://agmarknet.gov.in/
