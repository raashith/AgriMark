# AgriMark Machinery Operations & Field Service Network

## Overview

The **Machinery Operations Subsystem** (`web/src/lib/machinery-operations-engine.ts`, `/api/v1/machinery`, `/api/v1/services`) manages farm equipment cataloging, maintenance tracking, and service booking.

---

## Equipment Catalog & Service Pipeline

```
[ FARMER REQUEST ] ──► [ PROVIDER MATCH ] ──► [ FARMER APPROVAL ]
                                                     │
[ COMPLETED ] ◄── [ EXECUTION ] ◄── [ SCHEDULED ] ───┘
```

- **Equipment Types**: Tractors, Harvesters, Sprayers, Planters, Implements.
- **Maintenance Tracking**: Tracks total runtime hours, fuel usage, fault codes, and service due dates.
- **Field Services**: Connects farmers with certified agronomists, soil testing labs, drone operators, and harvesting teams.
