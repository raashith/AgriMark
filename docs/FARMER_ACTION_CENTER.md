# AgriMark Farmer Action Center & Unified Operating Plan

## Overview

The **Farmer Action Center** (`web/src/lib/farmer-action-center.ts`) acts as the single operational inbox for farmers. It transforms raw agricultural data into prioritized, actionable tasks while enforcing the principle: **Recommendations must NEVER silently become actions.**

---

## Action Item Lifecycle

Every action item in the queue follows a strict lifecycle:

```
                  ┌───────────────┐
                  │  RECOMMENDED  │
                  └───────┬───────┘
                          │
                          ▼
                     ┌─────────┐
                     │  OPEN   │
                     └────┬────┘
                          │
            ┌─────────────┴─────────────┐
            ▼                           ▼
    ┌───────────────┐           ┌───────────────┐
    │  IN_PROGRESS  │           │   DISMISSED   │
    └───────┬───────┘           └───────────────┘
            │
            ▼
    ┌───────────────┐
    │   COMPLETED   │
    └───────────────┘
```

### Action Attributes
- `action_id`: Prefix `act_*`.
- `priority`: `CRITICAL`, `HIGH`, `MEDIUM`, `LOW`, `INFO`.
- `source`: Subsystem trigger (`WEATHER_ALERT`, `MARKET_RFQ`, `TASK_OVERDUE`, `QUALITY_DISCREPANCY`).
- `deadline`: Target ISO timestamp for action completion.
- `owner`: Farmer ID (`usr_f_*`).
- `status`: `OPEN`, `IN_PROGRESS`, `COMPLETED`, `DISMISSED`, `EXPIRED`.

---

## Intelligence → Action Loop

National intelligence feeds dynamically generate farmer action items without taking autonomous mutating actions:

### Example 1: Heat Wave Risk Mitigation
1. **Forecast Ingestion**: Extreme temperature forecast (>40°C) detected for Salem region.
2. **Impact Assessment**: Spatial query identifies 452 vulnerable Turmeric & Tomato cultivations.
3. **Action Generation**: Action item generated: *"High heat wave risk detected. Schedule immediate evening irrigation."*
4. **Farmer Decision**: Farmer reviews prompt and clicks **Accept & Create Task**.
5. **Outcome Tracking**: Farm task created and marked complete upon irrigation logging.

### Example 2: Market Demand Matching
1. **Demand Surge**: Buyer submits high-volume RFQ for Grade A Organic Turmeric at +12% market premium.
2. **Matching Engine**: Identifies matching harvested produce lots in local FPO inventory.
3. **Action Generation**: Action item pushed to farmer: *"Buyer RFQ matches 500kg of your stored turmeric."*
4. **Farmer Decision**: Farmer accepts pricing terms and initiates order creation.
