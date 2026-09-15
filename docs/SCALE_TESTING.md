# AgriMark Scale & Performance Testing Runbook

## Scale Test Protocol
- Test script: `tests/test_regional_scale.py`
- Synthetic datasets simulate: 10,000 farmers, 2,000 FPOs, 25,000 farms, 100,000 cultivations, 50,000 produce lots, 25,000 listings, 50,000 orders.
- Targets:
  - Database Aggregation P50 < 50ms
  - API Search Latency P95 < 150ms
  - Keyset / Bounded Pagination Limit <= 50 records per request
