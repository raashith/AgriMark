# AgriMark Food Supply Balance Framework

## Balance Equation
For any commodity, state, district, or period:
```
Opening Stock + Production + Imports + Carry-In - Exports - Processing - Consumption - Losses = Closing Stock
```

## Data Types & Uncertainty
- `OBSERVED`: Direct physical inventory count or Mandi arrival audit.
- `ESTIMATED`: Sample-based statistical aggregation.
- `FORECAST`: Model-predicted future balance.
- All balance sheets explicitly report an `uncertainty_pct` and provenance lineage.
