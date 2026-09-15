# AgriMark Safe Irrigation Workflow Architecture

## Overview

The **Irrigation Control System** (`web/src/lib/irrigation-control-engine.ts`, `/api/v1/irrigation`) enforces safe, 7-state irrigation workflows with hard server-side max runtime cutoffs.

---

## 7-State Irrigation Workflow

```
[ RECOMMENDATION ] ──► [ FARMER_APPROVAL ] ──► [ SCHEDULED ] ──► [ READY ]
                                                                       │
[ CONFIRMED ] ◄── [ EXECUTION ] ◄──────────────────────────────────────┘
```

---

## Hard Server-Side Limits & Signed Commands

- **Maximum Runtime Cutoff**: Server enforces `max_runtime_sec: 7200` (2 hours). Requests exceeding 2 hours are truncated.
- **Signed Commands**: Includes target duration, water volume, `nonce` (to prevent replay attacks), `issued_at`, and `expires_at` timestamp.
- **Telemetry Confirmation**: Workflows require telemetry confirmation from water meters or solenoid status before being marked `CONFIRMED`.
