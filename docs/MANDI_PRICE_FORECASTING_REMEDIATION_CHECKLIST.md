# Mandi price remediation checklist (implementation order)

This checklist supplements `MANDI_PRICE_FORECASTING_AUDIT_2026-10-24.md`. Do not merge before the existing implementation has been corrected and tests pass.

## P0 — Correctness
- [ ] Canonicalize all state / commodity / mandi option IDs to the actual database keys. Do not mix synthetic CSV option IDs with canonical IDs without a typed source discriminator.
- [ ] Fix `web/src/app/api/market-prices/route.ts` to use actual reference table columns (live schema: `national_states.state_name`, `national_districts.district_name`, `national_mandis.mandi_name`, `national_commodities.code/name`), and verify Data API filter params encode special characters safely.
- [ ] Check the actual schema of `agmarknet_csv_import_staging` and make it optional when missing; a failed optional source should not make the canonical table unreadable, but it must be reflected in response warnings.
- [ ] Forecast only a single (commodity, mandi) time series, or explicitly aggregate all mandis on each day via median and label the aggregate. Never let multiple prices from one date masquerade as historical dates.
- [ ] When selected commodity/state/mandi changes, invalidate the dependent options and calculate analytics from exactly the filtered rows.
- [ ] Eliminate project URL fallbacks and force all endpoints to the one configured project URL.
- [ ] Align ingestion columns with the live table and inspect every `error` result from dimension, observation, and staging writes.
- [ ] Set forecast persistence status truthfully; never claim `VALIDATED` until an out-of-sample backtest has produced stored metrics.

## P1 — Durable ingestion & model readiness
- [ ] Add a server-only ingestion worker with official API key; page through all records and resumably catch up.
- [ ] Add a unique idempotency constraint matching the actual canonical table fields. Avoid schema changes until live constraints are inspected.
- [ ] Store ingestion run status/counts, errors and source timestamps.
- [ ] Validate prices against source payload and mark quality failures for review.
- [ ] Add market coverage query: counts, min/max dates and missing business days grouped by commodity/state/mandi.
- [ ] Build server-side history endpoint/RPC with strict selected identifier filters and bounded output; stop deriving a model from 10,000 rows loaded into a browser.
- [ ] Add minimum-history/readiness gate per market. Current live DB has one date only, so expected state today is baseline-only.
- [ ] Backtest last-value and seasonal-naive baseline first; evaluate ETS/Holt-Winters/SARIMA and gradient boosting next. Promote only the model beating the baseline on rolling-origin metrics.
- [ ] Persist training window, feature set, model version, metrics, prediction interval method and forecast run ID.

## Test matrix
- [ ] No filter returns observed prices with source/date provenance.
- [ ] Commodity only returns only that commodity ID.
- [ ] State only returns only that state ID.
- [ ] Mandi only resolves the mandi's canonical state and returns only that mandi.
- [ ] Commodity + state + mandi returns intersection; incompatible selections show a clear empty state.
- [ ] CSV-only records are shown only when source staging schema is available and are not silently double-counted with canonical records.
- [ ] Empty result differs from upstream failure, schema mismatch, auth failure and throttling.
- [ ] Data with one date must produce baseline-only; 5 different dates must not alone imply validated/production-grade forecast.
- [ ] A future observation must never leak into training for an earlier `base_date`.
- [ ] Failed insert / model persistence must return explicit persistence status and a trace ID.
- [ ] Tests include duplicate rows, 0/negative/modal outliers, missing days, mixed grades/varieties, time-zone boundaries, non-trading days and future-dated source records.

## Release gates
- [ ] TypeScript compile + lint.
- [ ] API integration tests against a schema fixture matching current production.
- [ ] Preview smoke tests for the four filter combinations and forecast readiness states.
- [ ] Confirm preview uses `tsdjtlmrvbspyzgwmccg`, but never print keys.
- [ ] Confirm the source date and freshness in UI before enabling alerts for end users.
- [ ] Only promote after the preview's data assertions pass.
