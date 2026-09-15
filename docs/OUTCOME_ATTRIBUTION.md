# AgriMark Outcome Attribution Engine

## Overview

The **Outcome Attribution Engine** (`web/src/lib/outcome-attribution-engine.ts`) tracks whether system recommendations create measurable farmer economic improvement.

---

## Causality Attribution Levels

To avoid over-claiming AI causality, outcomes are categorized into 3 evidence levels:

- **`OBSERVED`**: Direct baseline vs. actual comparison verified by completed sales receipts and bank settlement records.
- **`CORRELATED`**: Performance uplift occurring concurrently with recommendation adoption where external market factors also contributed.
- **`ESTIMATED_CONTRIBUTION`**: Modeled statistical estimate of income or efficiency gain attributable to AgriMark platform recommendations.

```json
{
  "total_recommendations": 1250,
  "acceptance_rate_pct": 78.4,
  "avg_income_uplift_pct": 12.8,
  "total_value_added_inr": 1840000,
  "attribution_breakdown": {
    "OBSERVED": 620,
    "CORRELATED": 410,
    "ESTIMATED_CONTRIBUTION": 220
  }
}
```
