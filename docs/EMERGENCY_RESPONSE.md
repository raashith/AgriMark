# AgriMark Emergency Stop & Incident System

## Overview

The **Emergency Stop System** (`web/src/lib/emergency-stop-system.ts`, `/api/v1/emergency`) provides a non-AI, high-priority, audited mechanism for operators to immediately halt physical field equipment.

---

## Emergency Shutdown Protocol

1. **Trigger Action**: Operator triggers Emergency Stop via `/api/v1/emergency` or hardware button.
2. **Audit Record**: Immutable record inserted into `emergency_events` table (`triggered_by`, `target_device_ids`, `reason`, `triggered_at`).
3. **Command Cancellation**: All pending/active commands targeting specified devices are updated to `EMERGENCY_STOPPED`.
4. **Device State Isolation**: Target devices transition to `DEGRADED` / `OFFLINE` status until manual technician inspection and reset.
