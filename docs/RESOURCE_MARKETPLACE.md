# AgriMark Shared Resource Marketplace

## Overview

The **Shared Resource Marketplace** (`web/src/lib/shared-resource-marketplace.ts`, `/api/v1/resources`) connects farmer resource demand with local equipment and service provider capacity.

---

## Supported Shared Resource Categories

1. **Machinery**: Tractors, Harvesters, Tillers, Moisture Testers, Drones.
2. **Labor**: Seasonal harvest labor pools, pruning specialists.
3. **Transport**: Local pickup trucks, 10T freight trucks, refrigerated vans.
4. **Storage**: Dry grain storage vaults, cold storage rooms.
5. **Processing**: Turmeric boiling/polishing units, spice grinders, seed sorters.
6. **Field Services**: Soil testing, drone spraying, irrigation gate repair.

---

## Resource Match Object

```json
{
  "resource": {
    "id": "res_trac_01",
    "provider_id": "prov_agro_machinery_salem",
    "resource_type": "machinery",
    "name": "John Deere 5050D Tractor with Harvester Attachment",
    "capacity": 1,
    "unit": "day",
    "rate_per_unit": 2200,
    "location": "Salem East",
    "availability_status": "AVAILABLE"
  },
  "match_score": 94.0
}
```
