# AgriMark Matching 2.0 Engine

## Overview

**Matching 2.0** (`web/src/lib/matching-v2-engine.ts`, `/api/v1/matching/v2`) upgrades static match scoring to multi-factor learning-based ranking.

---

## Multi-Factor Ranking Equation

Scores are computed across 7 weighted signals:

$$\text{Match Score} = 0.20 S_{\text{fulfillment}} + 0.15 S_{\text{price}} + 0.15 S_{\text{distance}} + 0.15 S_{\text{quality}} + 0.15 S_{\text{delivery}} + 0.10 S_{\text{liquidity}} + 0.10 S_{\text{trust}}$$

```json
{
  "id": "mat_v2_9a8b7c6d",
  "farmer_id": "usr_f_9b1deb4d3b7d",
  "buyer_id": "byr_spices_corp",
  "score": 88.2,
  "confidence": 0.942,
  "factors": {
    "fulfillment_history_score": 92,
    "price_realization_score": 88,
    "distance_score": 80,
    "quality_consistency_score": 90,
    "delivery_reliability_score": 94,
    "liquidity_fit_score": 85,
    "trust_framework_score": 85
  },
  "evidence": {
    "historical_orders_fulfilled": 14,
    "distance_km": 18,
    "evaluated_at": "2026-09-15T12:00:00.000Z"
  },
  "model_version": "matching_v2.1.0-prod"
}
```

*Core Principle*: Scores are transparently decomposed into factor breakdowns and never presented as absolute certainty.
