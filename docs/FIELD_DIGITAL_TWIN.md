# AgriMark Field Digital Twin Foundation

## Overview

The **Field Digital Twin** (`web/src/lib/field-digital-twin.ts`, `/api/v1/fields`) creates a multi-layered digital representation of every registered farm field:

```
Farm ──► Field ──► Crop ──► Sensor ──► Weather ──► Soil ──► Tasks ──► Observations ──► Equipment
```

---

## Digital Twin State Schema

```json
{
  "id": "twin_field_salem_02",
  "farm_id": "farm_erode_01",
  "field_id": "field_salem_02",
  "crop_stage": "RHIZOME_BULKING",
  "soil_state": {
    "moisture_pct": 18.5,
    "temperature_celsius": 28.2,
    "ph": 6.8,
    "npk_status": "BALANCED"
  },
  "water_state": {
    "water_deficit_mm": 14.2,
    "irrigation_needed_liters": 12500
  },
  "weather_state": {
    "temperature_celsius": 34.5,
    "humidity_pct": 62,
    "rainfall_24h_mm": 0,
    "rain_risk_pct": 15
  },
  "risk_state": {
    "pest_risk": "LOW",
    "drought_risk": "MEDIUM",
    "heat_risk": "MEDIUM"
  },
  "confidence": 0.94
}
```
