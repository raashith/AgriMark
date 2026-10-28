# AgriAI Professional Agriculture Intelligence Roadmap

## Goal

Extend the existing AgriMark AI assistant into an evidence-grounded, multilingual agriculture decision-support system. This roadmap preserves the current FastAPI/Sarvam integration, Supabase data model, AGMARKNET ingestion, Next.js App Router, and existing governance/model registry. It does not replace them with a second stack.

## Current verified baseline (2026-10-28)

- Supabase project: `tsdjtlmrvbspyzgwmccg` (AgriMark).
- `public.national_market_price_observations`: 11,436 rows.
- `public.national_commodities`: 190 rows.
- `public.national_mandis`: 1,051 rows.
- `public.national_states`: 25 rows.
- Existing backend endpoints: `backend/app/api/v1/ai.py`, `ai_chat.py`, `ai_voice.py`.
- Existing AI provider: Sarvam AI `sarvam-105b-conversations`; existing chat path contains AGMARKNET grounding and a WeatherService.
- Existing project capabilities include research dataset catalog, agricultural knowledge/evidence tables, a model registry, and governance specs. These must be audited for real provenance before using any record to train or ground users.
- No separate training run or evaluated production agricultural model has been confirmed by this change.

## Product architecture

1. **AgriAI conversation layer** — keep current model/provider and Indian-language support. LLM generates explanations, not facts.
2. **Tool/data layer** — typed tools for AGMARKNET prices, market history, weather, crop stage, approved knowledge/evidence, farm context, and marketplace workflows. Use authenticated/least-privilege access and role boundaries.
3. **Evidence retrieval** — source allowlist, canonical URL, provider, license, publication/update time, geography/crop scope, evidence type, methods, limitations, and an explicit verification status. Never ingest a source merely because a model or search result mentions it.
4. **Specialist ML models** — train separately for forecasting, image classification, crop yield, and risk classification. Do not fine-tune the general chat model on tables or unreviewed web text.
5. **Evaluation and release gates** — historical holdout by time/location, baseline comparison, calibration/uncertainty, model-card + dataset card, human review for high-risk agronomic recommendations, staging before production.
6. **Observability** — request correlation ID, data freshness, selected evidence IDs, model/version, retrieval outcome, latency, tokens/cost where exposed, user feedback, and redacted failure type. Do not log secrets or unnecessary personal/farm details.

## Data workstreams and sources

| Domain | Preferred starting source | Use | Required validation |
|---|---|---|---|
| India mandi price/arrivals | [data.gov.in daily mandi price catalog](https://www.data.gov.in/catalog/current-daily-price-various-commodities-various-markets-mandi), generated through AGMARKNET | Actual recorded min/max/modal price, commodity, market, state, district, date, arrivals where present | License/terms on source, API key/limits, exact field mapping, INR/quintal normalization, duplicate handling, date freshness, no invented missing records |
| Indian agronomy and crop protection | ICAR institutes, state agricultural universities, KVKs, Ministry of Agriculture and other authoritative institutions | Region/crop/season-specific recommendations and integrated pest management | Original publisher URL, document date/version, geography/crop scope, cited claims, recheck superseded advice |
| Weather | Existing WeatherService/provider and official services where accessible | Current/forecast weather for farm location, heat/rain alerts, planning | Timestamp, coordinates/area, forecast horizon, API terms, missing/stale behavior |
| Soil and land | Farmer-provided soil-test reports; public soil/geospatial datasets where licenses permit | Soil pH/nutrients/texture/context | Units, depth, sampling date, location resolution and uncertainty; distinguish measurements from maps |
| Crop disease images | PlantVillage only with original license terms respected; field photos with farmer consent; IP102 and institutional datasets after per-dataset license review | Image classification/triage | Class taxonomy, field-vs-lab gap, train/validation/test by source/plant/farm, consent, license obligations |
| Yield/remote sensing | YieldSAT (research dataset; non-Indian geographies only), suitable Indian field trials and satellite/weather/soil sources with terms confirmed | Yield estimation and growth-stage features | External validity for Indian crops; spatial/time leakage prevention; ground-truth validation |
| User/farm events | AgriMark first-party consented farm/cultivation/harvest records | Local calibration and farmer personalization | Role/RLS validation, purpose limitation, consent, deletion policy, de-identification where practical |

Dataset URLs and discoverability are not equivalent to permission to train. Persist an explicit license/access decision and block downloads/training when terms are unknown or incompatible.

## Training sequence

### Phase 1 — market time-series forecasting
- Use canonical AGMARKNET observations grouped by commodity + market/mandi + date.
- Deduplicate by source record identity/hash; validate dates, positive prices, min ≤ modal ≤ max where applicable, units, and missing periods.
- Establish naïve last-observation and seasonal-naïve baselines before ML.
- Start with interpretable statistical/gradient-boosting baselines only after enough regular history exists for that specific commodity/mandi.
- Use rolling-origin time-series validation. Do not randomly shuffle time-series records. Report MAE, RMSE, WAPE/SMAPE with zero-denominator handling, and performance by commodity/market/horizon.
- Forecast outputs must expose issue time, forecast dates, training end date, evaluation window, baseline comparison and uncertainty interval if validated. Otherwise show “not enough validated history.”
- Keep predictions separate from observed market prices and label them as forecasts, never as AGMARKNET observations.

### Phase 2 — source-grounded knowledge assistant
- Curate authoritative documents with licensing, versioning, topic/crop/state metadata and reviewer status.
- Chunk and index only eligible documents, preserving source links in every retrieved passage.
- Use hybrid keyword/vector retrieval only after reviewing the existing knowledge schema and access policy. Private farmer records must remain tenant/owner-scoped.
- The assistant should say what is known, source and date; identify uncertainty; ask a targeted question when crop/state/growth-stage context is required.

### Phase 3 — crop disease image triage
- Audit each dataset license and labels first.
- Train an image model with farm/source-grouped holdout and a separate field-photo test set. Avoid treating lab-background PlantVillage accuracy as field reliability.
- Return top candidates, model version, calibrated confidence, quality checks and recommended next step. Low-confidence/unsupported crops route to human/extension advice; never issue unverified chemical dose prescriptions.

### Phase 4 — crop/yield/soil/pest models
- Only proceed when labeled data volume, quality, consent/license and geographic coverage meet a documented threshold.
- Keep separate target labels, leakage rules, metrics, bias slices, versioning and rollback for every model.

## Production release gates

A model may not be promoted based solely on training accuracy or an LLM summary. Require:
- Reproducible run metadata: dataset version, source manifest, split/time window, code commit, dependency lock, seed, model artifact hash.
- Baseline comparison and task-appropriate metrics.
- Slice evaluation by crop, state/market, forecast horizon, season and image source where applicable.
- Robustness checks, missing-data behavior and an uncertainty/abstention policy.
- Dataset license and provenance review.
- Human sign-off for high-risk agronomic recommendations.
- Staging smoke test, monitoring thresholds and tested rollback path.
- Model card plus dataset card, including known limits and intended-use restrictions.

## Non-goals and safety

- Do not train or fine-tune the language model by dumping raw farmer data or market tables into training.
- Do not fabricate dataset names, institutional provenance, quality scores, citations, price records, forecasts or credentials.
- Do not claim “professional-grade”, “trained”, “accurate”, or “production-ready” before evaluation and pilot evidence supports the label.
- No automatic pesticide application, IoT actuation or financial transaction from an unreviewed LLM output.
- Keep service keys only in server-side environment variables; never commit keys or echo them to client logs.
- Keep public market reads separate from private farm/user records.

## Success metrics

- 100% of factual market answers cite the observation date, commodity, geography, source and freshness.
- 0 fabricated live market/weather values in automated tests.
- 100% of training datasets have an approved source/license record before training.
- Forecasting model beats the declared seasonal/naïve baseline on the held-out evaluation window, with metrics reported per segment.
- 100% of model releases are versioned, reproducible, reviewed and rollback-capable.
- Track answer citations/source coverage, unsupported-answer rate, language-level quality, latency, reliability, and cost; establish targets after a pilot baseline rather than inventing numbers.

## Official starting links

- [India OGD daily mandi prices](https://www.data.gov.in/catalog/current-daily-price-various-commodities-various-markets-mandi)
- [AGMARKNET](https://www.agmarknet.gov.in/)
- [PlantVillage](https://plantvillage.psu.edu/)
- [PlantVillage dataset repository and license references](https://github.com/spMohanty/plantvillage-dataset)
- [YieldSAT multimodal yield benchmark](https://yieldsat.github.io/)
- [Supabase vector search and RLS documentation](https://supabase.com/docs/guides/ai)
