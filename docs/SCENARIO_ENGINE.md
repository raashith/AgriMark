# Scenario Engine Specification

## 1. Scenario Taxonomy
AgriMark supports 12 standardized agricultural scenario types:
1. `drought`: Rainfall deficits & heat stress.
2. `flood`: Crop submergence & field washouts.
3. `heatwave`: Pollination failure & GDD acceleration.
4. `pest_outbreak`: Canopy destruction & yield drop.
5. `disease_outbreak`: Pathogen spread across contiguous fields.
6. `fertilizer_shortage`: N/P/K input constraints.
7. `fuel_price_shock`: Machinery & transport cost spikes.
8. `transport_disruption`: Road/rail bottlenecks.
9. `market_demand_shock`: Sudden buyer demand contraction/expansion.
10. `crop_failure`: Complete localized crop loss.
11. `export_restriction`: Mandated export bans or quotas.
12. `import_disruption`: Supply chain import delays.

---

## 2. Scenario Lifecycle
Every scenario defines:
`scenario_id`, `title`, `assumptions`, `affected_regions`, `affected_commodities`, `severity`, `duration_days`, `start_time`, `end_time`.
