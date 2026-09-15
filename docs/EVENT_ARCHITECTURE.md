# AgriMark Domain Event Architecture & Idempotency Engine

## Overview

AgriMark Phase 13 introduces a durable, immutable **Domain Event Bus** backed by the `domain_events` PostgreSQL table and managed via `web/src/lib/domain-event-bus.ts`. All system changes emit structured events that power downstream workflow transitions, alert generation, and analytics ingestion.

---

## Event Payload Schema

Every event emitted across AgriMark must conform to the canonical event header structure:

```json
{
  "event_id": "evt_9a8b7c6d5e4f3a2b",
  "event_type": "harvest.recorded",
  "entity_type": "harvest",
  "entity_id": "harv_556677889900",
  "actor": "usr_f_9b1deb4d3b7d",
  "occurred_at": "2026-09-15T10:30:00.000Z",
  "schema_version": "1.0",
  "correlation_id": "corr_123456789",
  "causation_id": "caus_987654321",
  "data_origin": "agrimark_mobile_app",
  "data": {
    "crop_id": "crop_778899aabbcc",
    "quantity_kg": 1500,
    "quality_grade": "A"
  }
}
```

---

## Event Catalog

The operating system recognizes standard domain events across all subsystems:

### Farmer & Farm Domain
- `farmer.created`, `farmer.updated`
- `farm.created`, `farm.updated`
- `crop.planted`, `crop.updated`
- `field.observed`, `task.created`, `task.completed`

### Harvest & Commercial Domain
- `harvest.recorded`
- `produce_lot.created`, `produce_lot.quality_updated`
- `listing.created`, `listing.updated`
- `rfq.created`, `offer.created`
- `order.created`, `order.confirmed`, `order.cancelled`, `order.disputed`, `order.completed`
- `shipment.created`, `shipment.updated`, `shipment.delivered`
- `payment.authorized`, `payment.settled`, `payment.failed`

### Ecosystem & Network Domain
- `fpo.membership_updated`
- `market_price.updated`, `weather.updated`, `forecast.updated`
- `policy.updated`

### AI Governance Domain
- `ai.requested`, `ai.completed`, `ai.feedback_received`

---

## Idempotency Engine (`exactly-once` semantics)

To ensure resilience against duplicate network deliveries and retries, every consumer persists processing outcomes to the `event_consumers` table:

```sql
CREATE TABLE event_consumers (
    event_id TEXT NOT NULL REFERENCES domain_events(event_id),
    consumer TEXT NOT NULL,
    processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    result JSONB NOT NULL DEFAULT '{}'::jsonb,
    PRIMARY KEY (event_id, consumer)
);
```

### Idempotent Handling Pattern

```typescript
const isAlreadyProcessed = await checkEventProcessed(eventId, consumerName);
if (isAlreadyProcessed) {
  return { status: 'skipped', reason: 'idempotent_duplicate' };
}

// Execute side-effect
const result = await processDomainEvent(event);

// Mark completed
await recordEventProcessed(eventId, consumerName, result);
```
