# AgriMark Operational Incident Management Architecture

## Overview

AgriMark Phase 13 introduces real-time incident tracking and automated event correlation (`web/src/lib/incident-slo-engine.ts`, `/api/v1/incidents`).

---

## Severity Classifications

Incidents are categorized across 4 severity tiers:

| Severity | Definition | Target Resolution SLA | Example |
| :--- | :--- | :--- | :--- |
| **P0** | Critical System Outage | < 15 minutes | Database connection failure, global payment gateway down, core event bus halted. |
| **P1** | Major Workflow Blocked | < 1 hour | Harvest-to-Sale workflow execution stalled, marketplace order placement failing. |
| **P2** | Degraded Performance | < 4 hours | High API latency (>2000ms), delayed alert notifications, slow search queries. |
| **P3** | Minor Operational Anomaly | < 24 hours | Isolated UI glitch, non-critical telemetry sync delay, single weather feed timeout. |

---

## Automated Incident Correlation Engine

When an anomaly or system error occurs, the incident correlation engine automatically links related entities:

```
                  ┌───────────────────┐
                  │ OPERATIONAL ERROR │
                  └─────────┬─────────┘
                            │
                            ▼
               ┌─────────────────────────┐
               │ INCIDENT CORRELATION    │
               └────────────┬────────────┘
                            │
  ┌─────────────────────────┼─────────────────────────┐
  ▼                         ▼                         ▼
[ DEPLOYMENT COMMIT ]   [ DATABASE FAULT ]   [ WORKFLOW TIMEOUT ]
```

### Correlated Event Types
- **Deployments**: Vercel release commit hash & environment build version.
- **Database Failures**: Query timeouts, connection pool exhaustion, deadlock logs.
- **API Failures**: 5xx HTTP error spikes, auth failure bursts.
- **Workflow Failures**: Stuck step queues, failed idempotency locks.
- **Event Bus Failures**: Dead-letter queue buildup, consumer lag spikes.
