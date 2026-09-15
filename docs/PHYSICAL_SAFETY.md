# AgriMark Physical Safety Policy Engine

## Overview

The **Physical Safety Engine** (`web/src/lib/physical-safety-engine.ts`, `/api/v1/safety`) evaluates every physical command before issuance.

---

## Safety Evaluation Tiers

| Evaluation Result | Description | Action Taken |
| :--- | :--- | :--- |
| `ALLOWED` | Command satisfies all duration, weather, boundary, and operator criteria | Command signed & dispatched to gateway. |
| `REQUIRES_APPROVAL` | Operator role or parameters require secondary signoff | Command held in `PENDING_APPROVAL` queue. |
| `BLOCKED` | Command violates hard server runtime cutoffs or boundary limits | Command rejected & logged to safety audit table. |
| `UNSAFE` | Command requests dangerous override (e.g. `UNLIMITED_RUNTIME`) | Command permanently blocked & safety alert generated. |
