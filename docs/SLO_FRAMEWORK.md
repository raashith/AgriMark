# AgriMark Operational SLO & Error Budget Framework

## Overview

AgriMark Phase 13 implements Service Level Objectives (SLOs) and real-time Error Budget monitoring (`web/src/lib/incident-slo-engine.ts`, `/api/v1/slo`).

**Core Standard**: AgriMark never claims unmeasured SLA guarantees. All performance metrics are continuously calculated from telemetry data.

---

## Targeted Operational SLO Metrics

| Metric | SLO Target | Measurement Window | Measured Metric |
| :--- | :--- | :--- | :--- |
| **API Availability** | **99.9%** | 30 Rolling Days | Successful non-5xx HTTP responses / Total HTTP requests |
| **Workflow Completion Rate** | **99.5%** | 7 Rolling Days | Workflows reaching `COMPLETED` / Total workflows started |
| **Event Processing Latency** | **< 100 ms** (p95) | 24 Hours | Time from event publication to consumer acknowledgement |
| **Notification Latency** | **< 500 ms** (p95) | 24 Hours | Delivery time of CRITICAL/HIGH alerts to mobile push queue |
| **Marketplace Search Latency**| **< 200 ms** (p95) | 24 Hours | Marketplace query execution & response rendering time |
| **Order Creation Latency** | **< 300 ms** (p95) | 24 Hours | Time from checkout button click to confirmed order ID |
| **AI Response Latency** | **< 1500 ms** (p95)| 24 Hours | End-to-end token generation & tool verification time |
| **Data Ingestion Freshness** | **< 5 min** | Continuous | Max timestamp delta of weather/market ticker ingestion |

---

## Error Budget Telemetry Calculation

Error budget remaining is dynamically calculated for each metric:

$$\text{Error Budget Remaining (\%)} = 100\% - \left( \frac{\text{Actual Metric Delta}}{\text{Allowed Budget Delta}} \times 100\% \right)$$

### Error Budget Burn Rate Policies
- **Burn Rate < 1x**: Normal operation; deployment velocity unconstrained.
- **Burn Rate 1x - 2x**: Warning threshold; alert ops team.
- **Burn Rate > 2x**: Critical threshold; freeze non-essential feature deployments and prioritize platform stabilization.
