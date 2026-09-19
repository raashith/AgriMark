# AgriMark Mandi Forecasting

## Source

AgriMark uses AGMARKNET / Government of India Open Government Data for observed mandi prices and arrivals.

Official source:
https://agmarknet.gov.in/

OGD resource:
https://www.data.gov.in/resource/current-daily-price-various-commodities-various-markets-mandi

## Stored observation model

Each observation preserves:
- commodity
- variety
- grade
- state
- district
- mandi
- observation date
- min price
- modal price
- max price
- arrival quantity
- price unit
- arrival unit
- source
- source URL
- retrieved timestamp
- raw payload
- validation state

## Forecast model

Production UI currently uses a transparent leakage-safe time-series baseline:
- recent modal-price window
- recent trend slope
- recent volatility
- 7-day horizon
- 95% uncertainty interval

It is intentionally labelled as a projection, not as a trained ML model.

## Next model stage

After enough historical observations are ingested, train and evaluate:
1. seasonal naive baseline
2. exponential smoothing / ETS
3. gradient-boosted regression with lag/rolling features
4. LSTM only when sufficient continuous per-mandi history exists

Validation must be chronological or rolling-window. Never randomly shuffle future observations into training.

## Required API credential

The data.gov.in OGD API requires an API key for programmatic bulk ingestion. Store it server-side only and use it from an ingestion worker or protected Edge Function.

Never expose the API key to browser code.
