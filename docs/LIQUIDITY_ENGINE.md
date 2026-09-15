# AgriMark Market Liquidity Engine

## Overview

The **Market Liquidity Engine** (`web/src/lib/market-liquidity-engine.ts`, `/api/v1/liquidity`) measures regional marketplace liquidity across 5 operational tiers.

---

## Liquidity Metrics & Tiers

Liquidity is computed from real-time operational feeds:

- **Active Sellers**: Count of active farmers/FPOs with open produce listings.
- **Active Buyers**: Count of verified institutional buyers submitting RFQs.
- **Available Inventory (kg)**: Total tonnage ready for immediate trade.
- **RFQ Volume**: Active buyer tender count.
- **Order Conversion Rate**: Percentage of RFQs converting into confirmed orders.
- **Avg Time-to-Sale**: Mean duration from listing creation to order confirmation.

| Liquidity Tier | Definition | Operational Action |
| :--- | :--- | :--- |
| `HIGH` | High buyer/seller ratio & high RFQ volume | Prioritize rapid match routing & instant fulfillment. |
| `NORMAL` | Balanced supply and demand | Standard matching pipeline. |
| `LOW` | Low trade activity (<50 RFQs) | Trigger regional buyer outreach & alert local FPOs. |
| `SUPPLY_SURPLUS` | High seller count / Low buyer demand | Recommend dry storage reserve & export channel matching. |
| `DEMAND_SURPLUS` | High buyer RFQ volume / Low unlisted supply | Alert regional farmers of price premium opportunities. |
