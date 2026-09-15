# AgriMark FPO Operations & Aggregation Protocol

## Overview
Farmer Producer Organizations (FPOs) and cooperatives aggregate produce from member farmers to sell bulk lots to wholesale buyers while preserving member attribution and provenance.

## Key Rules
1. **Source Attribution**: Every aggregated produce lot retains JSON metadata mapping `farmer_id`, `lot_id`, and `contributed_kg`.
2. **Farmer Ownership**: Aggregation does not strip farmer ownership or Produce Passport trace codes.
3. **No Duplicate Stock**: Individual lots committed to an FPO aggregation cannot be listed independently on the marketplace.
