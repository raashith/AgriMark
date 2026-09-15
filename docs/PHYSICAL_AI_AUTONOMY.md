# AgriMark Physical AI Autonomy Levels

## Overview

AgriMark Phase 15 defines 6 physical autonomy levels (`web/src/lib/physical-autonomy-engine.ts`) to ensure conservative field execution.

---

## Autonomy Matrix

| Level | Name | Field Action | Production Allowed |
| :--- | :--- | :--- | :--- |
| **L0** | `L0_INFORMATIONAL` | Display telemetry & field twin status | **YES (Default)** |
| **L1** | `L1_RECOMMENDATION` | Generate advisory recommendations (irrigate, inspect) | **YES (Default)** |
| **L2** | `L2_HUMAN_ASSISTED` | Pre-fill irrigation duration & target water volume | **YES (Farmer Approves)** |
| **L3** | `L3_CONDITIONAL_LIMITS`| Bounded execution with strict safety gates | **RESTRICTED (Configured Limits)** |
| **L4** | `L4_RESTRICTED_RESEARCH`| Autonomous real-world physical actuation | **STRICTLY BLOCKED** |
| **L5** | `L5_RESEARCH_ONLY` | Experimental autonomous field robotics | **STRICTLY BLOCKED** |

---

## Automatic Promotion Guardrail

AgriMark **NEVER** promotes physical autonomy levels automatically. Any change to a device's autonomy policy requires explicit human signoff.
