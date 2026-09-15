# AgriMark Phase 14 — Autonomous Agricultural Network & Network Effects

## Architecture Overview

**AgriMark Phase 14** builds the network intelligence layer that continuously drives network effects across all agricultural participants (Farmers, FPOs, Buyers, Logistics, Warehouses, Service Providers, and Data Providers).

```
                           [ AGRICULTURAL NETWORK GRAPH ]
                                         │
     ┌───────────────────┬───────────────┼───────────────┬───────────────────┐
     ▼                   ▼               ▼               ▼                   ▼
[ MATCHING 2.0 ]   [ LIQUIDITY ]   [ FPO/LOGISTICS ]  [ OPPORTUNITIES ]   [ RESOURCES ]
(Learning Rank)   (5 Tiers)       (Aggregation)      (Market Insights)   (Machinery/Labor)
     │                   │               │               │                   │
     └───────────────────┴───────────────┼───────────────┴───────────────────┘
                                         ▼
                        [ RECOMMENDATIONS & PERSONALIZATION ]
                                (Advisory Only)
                                         │
     ┌───────────────────┬───────────────┼───────────────┬───────────────────┐
     ▼                   ▼               ▼               ▼                   ▼
[ OUTCOME ATTRIB ]  [ EXPERIMENTS ]  [ MODEL REGISTRY ]  [ NETWORK RISK ]  [ AUTONOMY L0-L5 ]
(Attribution)       (A/B Testing)    (Versioning)        (Shocks/Anomalies) (Human In Loop)
```

---

## 1. Network Entities & Canonical Graph

The graph represents first-class entities (`network_entities`) and weighted relationship edges (`network_relationships`):

- **Farmers** (`usr_f_*`) ──► **Farms** (`farm_*`) ──► **Crops** (`crop_*`)
- **Produce Lots** (`lot_*`) ──► **Marketplace Listings** (`list_*`) ──► **Orders** (`ord_*`)
- **Orders** ──► **Logistics Providers** (`shp_*`) ──► **Warehouses** (`wh_*`)
- **Farmers** ──► **FPO Memberships** (`fpo_*`) ──► **FPO Aggregation Hubs**

---

## 2. Network Density & Health Metrics

Network health is continuously calculated from graph connectivity:

$$\text{Density Score} = \frac{|E|}{\frac{|V|(|V| - 1)}{2}}$$

Graph analytical endpoints:
- `GET /api/v1/network?entity_id={entity_id}`: Graph node & edge traversal.
- `GET /api/v1/network-risk?region={region}`: Real-time risk detection.
