# AgriMark Network Risk Engine

## Overview

The **Network Risk Engine** (`web/src/lib/network-risk-engine.ts`, `/api/v1/network-risk`) continuously scans the agricultural network for systemic vulnerabilities.

---

## Risk Categories

1. **Market Concentration**: Single buyer or seller commanding >50% market share in a region.
2. **Supply Shock**: Sudden production drop due to extreme climate events or pest outbreaks.
3. **Demand Shock**: Sudden cancellation or drop in institutional procurement tenders.
4. **Single-Buyer Dependency**: FPO relying on a single buyer for >60% of annual revenue.
5. **Logistics Bottleneck**: Cold-chain truck or storage warehouse deficit exceeding 50%.
6. **Price Anomalies**: Sudden price spikes or drops (>20% standard deviation) violating historical seasonality.

```json
{
  "id": "risk_conc_9a8b",
  "region": "Salem",
  "risk_type": "MARKET_CONCENTRATION",
  "severity": "HIGH",
  "title": "Single-Buyer Concentration Risk in Salem",
  "evidence": {
    "buyer_id": "byr_spices_corp",
    "market_share_pct": 68.4,
    "threshold_pct": 50.0,
    "farmers_affected": 142
  },
  "recommended_mitigation": "Onboard secondary regional buyers and initiate FPO aggregated bulk tender to diversify buyer pool."
}
```
