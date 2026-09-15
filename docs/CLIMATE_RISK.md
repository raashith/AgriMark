# AgriMark Climate Risk Engine Architecture

## Overview
The AgriMark Climate Risk Engine delivers farm-specific and regional climate risk assessments without presenting probabilistic weather forecasts as confirmed events.

## Assessed Hazards
1. **Heat Wave**: High ambient temperature forecast combined with foliar heat sensitivity.
2. **Drought**: Soil moisture deficit below wilting point coupled with dry spell duration.
3. **Flood**: Heavy precipitation forecast exceeding soil drainage capacity.
4. **Excess Rainfall**: Saturated soil moisture during flowering/harvest stages.
5. **Cyclone**: High wind velocity & heavy precipitation event.
6. **Frost**: Sub-zero ground temperature risk in highland regions.
7. **Soil Moisture Stress**: Root-zone moisture depletion.
8. **Water Stress**: Irrigation water supply index deficit.
9. **Crop Failure Risk**: Multivariable risk compound.

## Evidence & Provenance Requirements
Every assessment includes:
- `source`: Weather service or telemetry provider
- `measurement_period`: Date range of observations
- `methodology`: Risk computation algorithm
- `confidence`: Statistical confidence score (0.0 to 1.0)
- `evidence`: Bulleted array of empirical data points
