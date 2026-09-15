# AgriMark Produce Passport & Data Provenance Architecture

## 1. Provenance Chain
AgriMark enforces a transparent, immutable data provenance chain linking farm origins directly to final buyer delivery:

```
[ Farm Origin & Coordinates ]
              │
              ▼
[ Sowing & Crop Cultivation Log ]
              │
              ▼
[ Field Observations & Health Score ]
              │
              ▼
[ Harvest Batch & Traceability Code ]
              │
              ▼
[ Produce Lot Quality Grade ]
              │
              ▼
[ Marketplace Listing & Price Signals ]
              │
              ▼
[ Transaction Order & Inventory Reservation ]
              │
              ▼
[ Logistics Shipment & Delivery ]
```

## 2. Produce Passport Lookup URL
- Dynamic Route: `/passport/[code]`
- Resolves trace codes (e.g. `TRC-TURMERIC-2026-001`) to display verified farm coordinates, cultivation history, harvest parameters, moisture percentages, quality grades, and logistics history.
- Never fabricates provenance records.
