# AgriMark Mandi Price & Forecasting Audit
**Audit date:** 2026-10-24  
**Scope:** public market-price endpoint, forecast path, observed data in Supabase, deployment wiring and next-stage roadmap.

## Executive finding
The canonical Supabase project is `tsdjtlmrvbspyzgwmccg`. It currently contains 11,436 rows in `public.national_market_price_observations`, 190 commodity codes, 25 state codes and 1,051 mandi codes. All 11,436 rows are dated **2026-10-16**; there is only one distinct observation date. This is a broad cross-section of market records, but it is not a historical time series and cannot support a learned seven-day trend.

## Confirmed defects / risks

### P0 — Forecast readiness is overstated by thin history
The main page fits a local linear trend when it has five distinct dates. The dedicated forecast endpoint also fits a trend at five dates, but that is only a minimum fit gate, not proof of accuracy. With only one date in the live database, every selected geography should remain **baseline only / insufficient history**. The patch now labels a simple fit as unvalidated and reserves validation status for a future backtest.

### P0 — Legacy ingestion writes a schema that does not match production
`web/src/app/api/v1/mandi/ingest/route.ts` posts `variant_code`, `price_signal_type`, `observed_at`, `source_url`, `unit`, `validation_status`, `data_layer`, `is_synthetic`, `commodity_name`, `raw_payload`, etc. to `national_market_price_observations`; the live table instead has `observation_date`, `variety`, `grade`, `arrival_quantity`, `source_record_id`, and `raw_record`. It also writes dimension labels to `name`, while live tables use `state_name`, `district_name`, and `mandi_name`. Several write errors were ignored. The patch makes the old endpoint read-only/preview-only (HTTP 409) until a schema-aligned ingestion worker replaces it, so it cannot partially mutate production.

### P0 — Old Supabase project fallback remains in the ingestion endpoint
The market-price endpoint already targets canonical project `tsdjtlmrvbspyzgwmccg`, and the forecast endpoint defaults to that project. The ingestion endpoint still falls back to `xrcqzpnstdbbtafhcwbb`. The patch now rejects a non-canonical resolved URL instead of silently writing into another project.

### P1 — Forecast model output is persisted as validated without an observed backtest
The prior forecast route set `validation_status: 'VALIDATED'` and `is_champion: true` on generated predictions/runs without demonstrating out-of-sample error. The patch changes new generated predictions to `UNVALIDATED`, avoids champion promotion, and returns a persistence status/warning when writes fail. A trend fit is not model validation.

### P1 — Forecast aggregation must preserve the selected market scope
The dataset contains many mandi observations per date. A national/state view can be aggregated with a clearly named median or other documented statistic, but a mandi forecast must use only that mandi's series. The page patch now derives its displayed reference series from the selected commodity and either the selected mandi, the selected state aggregate, or the expressly national aggregate. These simple trend values remain marked as not backtested.

### P1 — Current prices need source-level quality validation
The canonical table contains very low modal values such as 0.01/0.12 for some commodity records. These might be bad source rows, unit mistakes, or legitimate edge cases; they must not be silently deleted. Compare each suspicious value to `raw_record` and the source API before marking it invalid. Enforce `min_price <= modal_price <= max_price`, positive values, valid observation dates, and duplicate checks across commodity/variety/grade/mandi/date/source.

### P1 — Market-price API has two source paths and a fixed row cap
`web/src/app/api/market-prices/route.ts` reads canonical observations plus `agmarknet_csv_import_staging`, then merges, deduplicates and caps results. The reference-table field names used by this endpoint (`national_commodities.code/name`, `national_states.state_code/state_name`, and `national_mandis.mandi_code/mandi_name/state_code`) were checked against the live schema and are correct. The patch preserves those field names and makes staging-source failure a visible warning rather than failing the canonical source as well. Longer term, history and analytics should be server-side, filtered queries, not based on 10,000 rows loaded to the browser.

### P2 — Forecast engine date arithmetic and uncertainty need review
`web/src/lib/mandi-forecast.ts` uses local-time `setDate` followed by UTC ISO serialization. Use UTC date arithmetic for day-based projections. The confidence interval method should be documented and calibrated by backtesting; lower bounds should not have a universal hard minimum of ₹50 when prices for different commodities vary substantially.

## Workflow to make reliable
1. Keep one canonical Supabase URL and server-only API credentials for all price endpoints.
2. Ingest official data with a protected scheduled worker, pagination/catch-up, bounded retries, idempotency, validation counters and an ingestion-run ledger.
3. Normalize official state/commodity/district/mandi labels and map them to canonical reference IDs before insert.
4. Confirm freshness and date coverage by commodity/state/mandi. Many rows on one date are not history.
5. Query observations for the exact (commodity, market scope); aggregate daily price only when the user selected a state/national view.
6. Train candidate models only when sufficient history exists, then compare via chronological rolling-origin backtests against a last-value and seasonal-naive baseline.
7. Show actual price, as-of date, source, history coverage and any baseline/model result separately. Label predictions as unvalidated until a backtest artifact exists.
8. Test canonical filters and ingestion schema against production-shaped fixtures and on a preview deployment before promoting.

## Acceptance criteria
- Price table shows observed modal/min/max price, observation date, source, and different empty/error states for each selector combination.
- Commodity/state/mandi filters use canonical IDs and return the expected intersection; selecting a mandi clears incompatible prior selections.
- With one distinct observation date, UI/API says baseline-only; no learned or validated label is shown.
- The old ingestion route never reports success or writes incompatible columns. The replacement reports fetched/accepted/rejected/inserted/duplicate/error counts and is safe to rerun.
- Model reports model/version, train window, validation date, MAE/RMSE/MASE and interval quality only when those metrics have actually been calculated and stored.
- Server-side service-role/secret keys are never exposed in client bundles or logs; public reads remain governed by RLS.

## Future roadmap (priority order)
1. **Data reliability:** daily automated ingestion, historical catch-up, retry/backoff, freshness alerts, dead-letter records and admin replay.
2. **Historical coverage:** official historical prices and arrivals; coverage panel by commodity/state/mandi/date; trading-day gaps and source reconciliation.
3. **Forecast quality:** start with last-value and seasonal-naive baselines; evaluate ETS/Holt-Winters, SARIMA and tree models using lag, seasonal, arrivals, weather and MSP features; promote only after rolling-origin validation.
4. **Prediction transparency:** last actual date, distinct history days, model version, last validation date, metrics, interval calibration and baseline-fallback reason.
5. **Farmer decision support:** net realization calculator (transport, commission, quality/wastage); nearest-mandi price comparison with price age and distance; watchlists and opt-in price alerts.
6. **Market intelligence:** mandi price spreads/convergence, arrival-price relationship, seasonal calendar, volatility/spike alerts, MSP references where applicable and map view.
7. **Product polish:** Tamil and other regional language labels, ₹/quintal consistency, exports, mobile charts, low-bandwidth caching, accessible filter dependencies and retry states.
8. **Governance:** source provenance/licensing, data-quality review queue, forecast drift monitoring, model rollback/champion history and audit trail.

## Evidence
- Repository files inspected: `web/src/app/market-prices/page.tsx`, `web/src/app/api/market-prices/route.ts`, `web/src/app/api/v1/mandi/forecast/route.ts`, `web/src/app/api/v1/mandi/ingest/route.ts`, `web/src/lib/mandi-forecast.ts`.
- Live Supabase introspection on 2026-10-24: 11,436 observations; min/max date 2026-10-16; one distinct date; 190 commodities; 25 states; 1,051 mandis. Canonical table columns include `observation_date`, `state_code`, `district_code`, `mandi_code`, `commodity_code`, `variety`, `grade`, `arrival_quantity`, `min_price`, `max_price`, `modal_price`, `source`, `source_record_id`, `raw_record`.
- Official dataset: https://www.data.gov.in/resource/current-daily-price-various-commodities-various-markets-mandi
- Forecasting reference: https://agmarknet.gov.in/
