# AgriMark Agricultural Data Contracts Reference

## Entity Contracts
Machine-readable contracts are provided for 16 canonical entities:
1. `Farmer`
2. `Farm`
3. `Crop`
4. `Cultivation`
5. `Harvest`
6. `ProduceLot`
7. `Listing`
8. `Order`
9. `Shipment`
10. `FPO`
11. `MarketObservation`
12. `WeatherObservation`
13. `ProductionStatistic`
14. `Forecast`
15. `PolicyScheme`
16. `FoodSecurityIndicator`

## Header Metadata
Every contract includes mandatory provenance and data quality headers:
`schema_version`, `entity_version`, `source`, `producer`, `created_at`, `updated_at`, `geography`, `unit`, `provenance_id`, `data_quality`.
