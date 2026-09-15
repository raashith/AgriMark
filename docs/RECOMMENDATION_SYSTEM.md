# AgriMark Advisory Recommendation & Opportunity Engine

## Overview

The **Recommendation System** (`web/src/lib/farmer-recommendation-engine.ts`, `web/src/lib/market-opportunity-engine.ts`, `/api/v1/recommendations`, `/api/v1/opportunities`) surfaces actionable guidance to farmers and FPOs.

---

## Advisory Mandate

All generated recommendations are **strictly advisory (`is_advisory_only: true`)**. Recommendations do NOT autonomously commit funds, execute sales, or alter farm state without farmer approval.

```json
{
  "recommendation_id": "rec_hrv_99a8b",
  "farmer_id": "usr_f_9b1deb4d3b7d",
  "category": "HARVEST_TIMING",
  "title": "Optimal Harvest Window Reached for Field 2 Turmeric",
  "description": "Soil moisture and rhizome maturity indicators show 94% optimal quality if harvested within 5 days.",
  "suggested_action": "Schedule labor and harvest dry crops before rain forecast on Sept 20.",
  "urgency": "HIGH",
  "confidence": 0.92,
  "reasoning_factors": [
    "Soil moisture levels at 18%",
    "Dry weather window for next 4 days",
    "Market demand high"
  ],
  "is_advisory_only": true
}
```
