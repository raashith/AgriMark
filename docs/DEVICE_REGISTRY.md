# AgriMark Device Registry & Identity Security

## Overview

The **Device Registry** (`web/src/lib/device-registry-engine.ts`, `/api/v1/devices`) serves as the canonical inventory for all physical hardware deployed across AgriMark farms.

---

## Supported Device Categories

- `soil_sensor`: Soil moisture, temperature, pH, NPK probes.
- `weather_station`: Microclimate weather stations (temp, humidity, rain, wind).
- `water_meter`: Flow rate and volumetric water meters.
- `irrigation_controller`: Solenoid valves and drip/sprinkler actuators.
- `drone`: Survey & multispectral imaging drones.
- `tractor`: Farm tractors & automated implements.
- `harvester`: Combine harvesters & threshers.
- `cold_storage_controller`: Temperature and humidity sensors for cold storage vaults.
- `camera`: Field monitoring & pest inspection cameras.
- `gateway`: Farm edge gateways.

---

## Identity & Credential Isolation

- `device_id`: Canonical prefixed hardware ID.
- `credential_hash`: Hashed secret stored in `device_credentials`. Secrets are **NEVER** exposed in browser clients.
- `is_quarantined`: Boolean flag preventing compromised devices from issuing commands or submitting authoritative telemetry.
