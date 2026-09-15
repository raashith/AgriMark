# AgriMark Telemetry Architecture & Sensor Quality Engine

## Overview

The **Telemetry Architecture** (`web/src/lib/telemetry-ingestion-engine.ts`, `web/src/lib/sensor-quality-engine.ts`, `/api/v1/telemetry`) ingests sensor streams and evaluates data quality without altering raw readings.

---

## Telemetry Ingestion Payload

```json
{
  "id": "tel_9a8b7c6d",
  "device_id": "dev_soil_salem_01",
  "captured_at": "2026-09-15T12:00:00.000Z",
  "received_at": "2026-09-15T12:00:02.100Z",
  "measurement_type": "soil_moisture",
  "value": 18.5,
  "unit": "%",
  "quality_status": "NORMAL",
  "source": "direct_iot",
  "data_origin": "agrimark_physical_gateway"
}
```

---

## Sensor Quality Evaluation

Telemetry records undergo quality scoring:

- `NORMAL`: Valid measurement within physical environmental bounds.
- `IMPOSSIBLE_VALUE`: Out-of-bounds readings (e.g. soil moisture > 100% or temp < -40°C).
- `SPIKE`: Sudden abnormal reading shift requiring secondary sensor confirmation.
- `STALE_SENSOR`: Device un-updated for > 2 hours.
- `CLOCK_SKEW`: Telemetry timestamp delta exceeds 15 minutes.
