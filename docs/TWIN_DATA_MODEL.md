# Digital Twin Data Model & Database Schemas

## 1. Core Graph Entities
The digital twin database schema in `database/migrations/13_agricultural_digital_twin.sql` encapsulates 31 entity types:
- **Administrative**: `country`, `state`, `district`, `block`, `village`
- **Farm Level**: `farm`, `field`, `crop`, `variety`, `soil`, `farmer`
- **Water & Climate**: `water_source`, `irrigation_system`, `weather_station`, `climate_zone`
- **Infrastructure**: `warehouse`, `cold_storage`, `processing_unit`, `logistics_node`, `road`, `rail_node`, `port`
- **Market & Trade**: `market`, `mandi`, `fpo`, `input_supplier`, `machinery`, `agricultural_device`, `policy`, `scheme`, `food_node`

---

## 2. Graph Relationships
Entities are linked via 14 relationship types (`LOCATED_IN`, `OWNS`, `OPERATES`, `GROWS`, `DEPENDS_ON`, `SUPPLIES`, `TRANSPORTS_TO`, `STORES_AT`, `PROCESSES_AT`, `MARKETS_AT`, `AFFECTED_BY`, `CONNECTED_TO`, `PROTECTED_BY`, `SUBJECT_TO`).

Every relationship maintains provenance metadata detailing data source and verification timestamps.
