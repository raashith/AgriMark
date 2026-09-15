# AgriMark Autonomy Levels & Policy Enforcement

## Overview

AgriMark Phase 14 defines 6 explicit levels of system autonomy (`web/src/lib/autonomy-policy-engine.ts`) to prevent unconstrained AI behavior.

---

## Autonomy Level Classifications

| Level | Classification | Execution Bounds | Allowed in Production |
| :--- | :--- | :--- | :--- |
| **L0** | `L0_INFORMATIONAL` | Expose raw market data, weather tickers, crop guides | **YES (Default)** |
| **L1** | `L1_RECOMMENDATION` | Surface ranking recommendations & opportunity prompts | **YES (Default)** |
| **L2** | `L2_ASSISTED_ACTION` | Pre-fill farm forms, prepare draft orders, stage pickup schedules | **YES (User Confirms)** |
| **L3** | `L3_CONDITIONAL_LIMITS` | Execute bounded actions within human-configured limits | **RESTRICTED (Requires Signoff)** |
| **L4** | `L4_RESTRICTED_AUTONOMOUS`| Fully autonomous real-world transactions | **STRICTLY BLOCKED** |
| **L5** | `L5_RESEARCH_ONLY` | Experimental research models | **STRICTLY BLOCKED** |

---

## Policy Enforcement Rule

Attempting to execute an `L4` or `L5` action in production raises an immediate authorization error:

```typescript
if (proposedLevel === 'L4_RESTRICTED_AUTONOMOUS' || proposedLevel === 'L5_RESEARCH_ONLY') {
  throw new Error(`Autonomy Level ${proposedLevel} is strictly restricted from real-world execution. Safe limit is L0-L2.`);
}
```
