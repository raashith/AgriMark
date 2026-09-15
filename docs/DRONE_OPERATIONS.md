# AgriMark Drone Mission Operations

## Overview

The **Drone Operations Subsystem** (`web/src/lib/drone-mission-planner.ts`, `/api/v1/drones`) provides mission planning foundations for survey and scouting drones.

---

## Supported Drone Mission Types

1. `CROP_SURVEY`: High-resolution visual mapping of crop cover.
2. `NDVI_MULTISPECTRAL`: Normalized Difference Vegetation Index health assessment.
3. `THERMAL_SURVEY`: Thermal stress and irrigation deficit detection.
4. `PEST_SCOUTING`: Targeted aerial imagery for early disease/pest detection.
5. `IRRIGATION_INSPECTION`: Aerial leak & drip line flow check.

---

## Strict Flight Safety Boundaries

- **Flight Control Restriction**: Autonomous flight control is **STRICTLY PROHIBITED (`flight_control_allowed: false`)**. Mission plans return waypoints, altitude limits, and risk warnings for operator execution.
- **Altitude Ceiling**: Maximum altitude capped at 50 meters above ground level.
- **Weather Constraints**: Missions are automatically flagged if wind speed > 20 km/h or rain risk > 30%.
