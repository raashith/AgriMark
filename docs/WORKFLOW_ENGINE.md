# AgriMark Workflow Orchestration Engine

## Overview

AgriMark Phase 13 introduces long-running, multi-step agricultural workflows managed by `web/src/lib/workflow-orchestrator.ts` and backed by `workflow_instances` and `workflow_steps`.

---

## State Machine Architecture

Every workflow tracks strict step progression:

```
[ CREATED ] ──► [ HARVEST_RECORDED ] ──► [ QUALITY_INSPECTED ] ──► [ LISTING_CREATED ]
                                                                          │
[ COMPLETED ] ◄── [ SETTLED ] ◄── [ DELIVERED ] ◄── [ LOGISTICS ] ◄── [ ORDERED ]
```

### Step State Record
Each step keeps track of:
- `current_step`: Step key currently executing.
- `previous_step`: Preceding step key.
- `next_step`: Target next step key.
- `failure_state`: Details of execution failure.
- `retry_state`: Retry counter and backoff metadata.
- `human_approval_required`: Boolean flag indicating if human signoff is required before progressing.

---

## Case Study: HARVEST-TO-SALE Pipeline

The standard commercial workflow chains 10 distinct operational phases:

1. **Harvest Recorded**: Farmer inputs harvest yield and harvest timestamp (`harv_*`).
2. **Produce Lot Created**: Automated creation of traceable lot (`lot_*`).
3. **Quality Inspection**: AI image analysis or manual inspector quality rating (`qual_*`).
4. **Listing Created**: Automated draft listing creation on AgriMark Marketplace (`list_*`).
5. **Buyer Matching**: Regional matching engine matches lot specs to buyer RFQs.
6. **Order Execution**: Buyer places binding purchase order (`ord_*`).
7. **Inventory Reservation**: Escrow lock placed on produce lot quantity.
8. **Logistics Dispatch**: Automated pickup assignment to registered carrier (`shp_*`).
9. **Delivery Confirmation**: Buyer OTP signoff upon physical delivery.
10. **Financial Settlement**: Escrow release to farmer bank account / UPI ID.

---

## Offline-Safe Mobile Sync Protocol

For low-connectivity field environments, farmer workflow actions support local sync queue states:

| State | Description |
| :--- | :--- |
| `draft` | Local uncommitted draft created on device. |
| `queued` | Action committed locally, waiting for network connection. |
| `syncing` | HTTP upload payload currently in flight. |
| `synced` | Successfully acknowledged by server & canonical DB. |
| `failed` | Upload failed due to validation or server error. |
| `conflict` | Server state version mismatch requiring farmer resolution. |

*Safety Standard*: Unsynced local records are visually distinguished and NEVER presented as authoritative server state.
