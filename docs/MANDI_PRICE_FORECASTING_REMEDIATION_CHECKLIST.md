# Mandi price remediation checklist (implementation order)

This checklist supplements `MANDI_PRICE_FORECASTING_AUDIT_2026-10-24.md`. Keep changes in the audit branch until build, data assertions, and preview tests pass.

## P0 — Correctness
- [ ] Preserve and regression-test verified live reference columns: `national_commodities.code/name`, `national_states.state_code/state_name`, `national_districts.district_code/district_name`, `national_mandis.mandi_code/mandi_name/state_code/district_code`.
- [ ] Canonicalize state / commodity / mandi option identifiers and preserve a typed source discriminator for synthetic CSV-only options.
- [ ] Check the already-existing schema of `agmarknet_csv_import_staging`; treat it as optional and expose a warning if unavailable rather than failing the canonical query.
- [ ] Forecast a single (commodity, mandi) series for mandi mode; label state/national median aggregates explicitly. Never treat cross-market rows on a single day as a historical time series.
- [ ] When selected commodity/state/mandi changes, clear incompatible dependent selections and use the filtered data for all charts and derived KPIs.
- [ ] Remove the old project fallback from ingestion. All endpoints must use `tsdjtlmrvbspyzgwmccg` or fail closed.
- [ ] Rewrite the old ingestion payload against the live schema and check every dimension, observation, and staging write result before reporting success. Until that worker is ready, keep the legacy endpoint preview-only to avoid corrupt writes.
- [ ] Never set prediction status to `VALIDATED` or a model to `champion` without an actual stored chronological backtest.

## P1 — Durable ingestion & model readiness
- [ ] Add a server-only ingestion worker with official API key; page through all records and resumably catch up.
- [ ] Add a unique idempotency constraint matching the actual canonical table fields. Inspect existing constraints/indexes before modifying schema.
- [ ] Store ingestion run status/counts, errors and source timestamps.
- [ ] Compare suspicious prices with `raw_record` and official source payload; mark quality failures for review, not silent deletion.
- [ ] Add a market coverage query: counts, min/max dates and expected trading-day gaps grouped by commodity/state/mandi.
- [ ] Build a server-side history endpoint/RPC with strict selected identifier filters and bounded output; stop deriving a model from a browser’s 10,000-row page.
- [ ] Add per-market history/readiness gates. Current live data has one observation date, so the valid state today is baseline-only.
- [ ] Backtest last-value and seasonal-naive baselines first; evaluate ETS/Holt-Winters/SARIMA and gradient boosting next. Promote only if rolling-origin results beat baseline on suitable metrics.
- [ ] Persist training window, feature set, model version, metrics, prediction interval method and forecast run ID.

## Test matrix
- [ ] No filter returns observed prices with source/date provenance.
- [ ] Commodity only returns only that commodity ID.
- [ ] State only returns only that state ID.
- [ ] Mandi only resolves the mandi’s canonical state and returns only that mandi.
- [ ] Commodity + state + mandi returns intersection; incompatible selections show a clear empty state.
- [ ] CSV-only records are included only when staging schema is available and are not silently double-counted with canonical records.
- [ ] Empty result differs from upstream failure, schema mismatch, authentication failure and throttling.
- [ ] One date always produces baseline-only; five distinct dates alone must not imply a validated forecast.
- [ ] A future observation never leaks into training for an earlier `base_date`.
- [ ] Failed insert/model persistence returns an explicit status and request correlation ID.
- [ ] Tests include duplicates, zero/negative/outlier prices, missing days, mixed grades/varieties, time-zone boundaries, non-trading days and future-dated source records.

## Release gates
- [ ] TypeScript build + lint.
- [ ] API integration tests against a fixture that matches the current production schema.
- [ ] Preview smoke tests for no-filter, commodity, state, mandi and combined filters.
- [ ] Confirm preview uses `tsdjtlmrvbspyzgwmccg`; never print keys.
- [ ] Confirm data source freshness and last-observation date in the UI before enabling alerts.
- [ ] Promote only after preview data assertions and forecast-readiness behavior pass.
