# AgriMark Mandi Price & Forecasting Audit
**Audit date:** 2026-10-24  
**Scope:** public market-price endpoint, forecast path, observed data in Supabase, deployment wiring and next-stage roadmap.

## Executive finding
The canonical Supabase project is `tsdjtlmrvbspyzgwmccg`. Its canonical observation table has 11,436 rows covering 190 commodity codes, 25 state codes and 1,051 mandi codes, but every row is dated **2026-10-16**. Its CSV staging table has 17,458 rows, but every staging row is dated **2026-10-23**. Each table therefore contains only one distinct date. The data is useful as a current-price cross-section, but it is not yet a multi-date history suitable for training a reliable seven-day forecast.

## Confirmed defects / risks

### P0 — Forecast readiness is overstated by thin history
The main page fits a local linear trend when it has five distinct dates. The dedicated forecast endpoint also fits a trend at five dates, but that is only a minimum fit gate, not proof of accuracy. With one date per source table today, each selected geography should remain **baseline only / insufficient history**. The patch labels a simple fit as unvalidated and reserves validation status for a future backtest.

### P0 — Legacy ingestion writes a schema that does not match production
`web/src/app/api/v1/mandi/ingest/route.ts` posts `variant_code`, `price_signal_type`, `observed_at`, `source_url`, `unit`, `validation_status`, `data_layer`, `is_synthetic`, `commodity_name`, `raw_payload`, etc. to `national_market_price_observations`; the live table instead has `observation_date`, `variety`, `grade`, `arrival_quantity`, `source_record_id`, and `raw_record`. It also writes dimension labels to `name`, while live tables use `state_name`, `district_name`, and `mandi_name`. Several write errors were ignored. The patch makes the old endpoint read-only/preview-only (HTTP 409) until a schema-aligned ingestion worker replaces it, so it cannot partially mutate production.

### P0 — Old Supabase project fallback remains in the ingestion endpoint
The market-price endpoint already targets canonical project `tsdjtlmrvbspyzgwmccg`, and the forecast endpoint defaults to that project. The ingestion endpoint still falls back to `xrcqzpnstdbbtafhcwbb`. The patch rejects a non-canonical resolved URL instead of silently writing into another project.

### P1 — Current prices need source-level quality validation
Some canonical modal prices are extremely low (e.g. 0.01/0.12 in some commodity groups). These might be bad source rows, unit mistakes, or legitimate edge cases; they must not be silently deleted. Compare suspicious values to `raw_record` and the official source payload before marking them invalid. Validate `min_price <= modal_price <= max_price`, positive values, valid observation dates, and duplicates across commodity/variety/grade/mandi/date/source.

### P1 — Market-price API has two source paths and a fixed row cap
`web/src/app/api/market-prices/route.ts` reads canonical observations plus `agmarknet_csv_import_staging`, then merges, deduplicates and caps results. The live reference columns used by this endpoint (`national_commodities.code/name`, `national_states.state_code/state_name`, and `national_mandis.mandi_code/mandi_name/state_code`) were checked against the live schema and are correct. The patch keeps those names, type-checks merged records, and treats staging failure as a visible warning instead of failing the canonical query. Longer term, analytics and history should be server-side filtered queries, not based on 10,000 browser-loaded rows.

### P1 — Forecast validation and persistence need to be truthful
The prior forecast route set `validation_status: 'VALIDATED'` and `is_champion: true` on generated predictions/runs without demonstrating out-of-sample error. The patch changes generated predictions to `UNVALIDATED`, avoids champion promotion, and returns persistence status/warnings when writes fail. A trend fit is not model validation.

### P1 — Preserve selected market scope
The data has many mandi observations per date. A state/national view can be aggregated with a clearly named median or another documented statistic, but a mandi forecast must use only that mandi's series. The page patch scopes the displayed reference series to the selected commodity and either the selected mandi, a selected state aggregate, or an explicitly national aggregate. The estimates remain labelled as not backtested.

### P2 — Forecast engine date arithmetic and uncertainty need review
`web/src/lib/mandi-forecast.ts` uses local-time `setDate` followed by UTC ISO serialization. Use UTC date arithmetic for day-based forecasts. Confidence intervals should be documented and calibrated with backtesting; a universal lower bound of ₹50 is not suitable for all commodities.

## Required workflow
1. Keep one canonical Supabase URL and server-only API credentials for all price endpoints.
2. Ingest official data with a protected scheduled worker, pagination/catch-up, bounded retries, idempotency, validation counts and an ingestion-run ledger.
3. Normalize official state/commodity/district/mandi labels and map them to canonical reference IDs before inserts.
4. Verify data freshness and date coverage separately by source and by commodity/state/mandi. Many rows on one date are not historical depth.
5. Backfill official historical observations across multiple valid dates. Do not fabricate earlier price history from current observations.
6. Query observations for the exact (commodity, market scope); aggregate daily prices only when the user has selected a state/national view.
7. Evaluate candidate models with chronological rolling-origin backtests against last-value and seasonal-naive baselines before promoting.
8. Present actual price, as-of date, source, history coverage and baseline/model output separately. Label forecasts unvalidated until backtest metrics are stored.
9. Test the canonical filters and ingestion schema against production-shaped fixtures and a preview deployment before promoting.

## Acceptance criteria
- Market table shows observed modal/min/max price, observation date, source, and different empty/error states for each selector combination.
- Commodity/state/mandi filters use canonical IDs and return the expected intersection; selecting a mandi clears incompatible previous selections.
- With one distinct date, the API/UI report baseline-only; no learned or validated label appears.
- The legacy ingestion route cannot write incompatible columns or report success; its replacement reports fetched/accepted/rejected/inserted/duplicate/error counts and is safe to rerun.
- The system shows observation coverage by source/date and last successful ingestion time.
- Model reports model/version, training window, validation date, metrics and interval quality only when these have actually been calculated and stored.
- Server-side service-role/secret keys never appear in client bundles or logs; public reads remain governed by RLS.

## Future roadmap (priority order)
1. **Data reliability:** daily automated ingestion, historical catch-up, retry/backoff, freshness alerts, dead-letter records and admin replay.
2. **Historical coverage:** official historical prices and arrivals; coverage panel by commodity/state/mandi/date; trading-day gaps and source reconciliation.
3. **Forecast quality:** last-value and seasonal-naive baselines first; evaluate ETS/Holt-Winters, SARIMA and tree models with lag, seasonal, arrivals, weather and MSP features; promote only after rolling-origin validation.
4. **Prediction transparency:** last actual date, distinct history dates, model version, last validation date, MAE/RMSE/MASE, interval calibration and baseline-fallback reason.
5. **Farmer decision support:** net realization calculator including transport, commission, quality and wastage; nearest-mandi comparisons with distance and price age; opt-in watchlists and price alerts.
6. **Market intelligence:** mandi price spreads/convergence, arrivals-price relationship, seasonal calendar, volatility alerts, MSP reference where applicable and market map.
7. **Product polish:** Tamil and other regional language labels, consistent ₹/quintal units, exports, mobile charts, low-bandwidth caching, accessible filters and retry states.
8. **Governance:** source provenance/licensing, data-quality review queue, drift monitoring, model rollback/champion history and audit trail.

## Evidence
- Repository files inspected: `web/src/app/market-prices/page.tsx`, `web/src/app/api/market-prices/route.ts`, `web/src/app/api/v1/mandi/forecast/route.ts`, `web/src/app/api/v1/mandi/ingest/route.ts`, `web/src/lib/mandi-forecast.ts`.
- Live Supabase introspection on 2026-10-24: canonical observations = 11,436 rows, one distinct date (2026-10-16); CSV staging = 17,458 rows, one distinct date (2026-10-23); 190 commodities, 25 states, 1,051 mandis represented in canonical data.
- Official dataset: https://www.data.gov.in/resource/current-daily-price-various-commodities-various-markets-mandi
- Forecasting reference: https://agmarknet.gov.in/
