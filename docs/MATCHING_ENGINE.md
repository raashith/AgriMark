# AgriMark Farmer/Buyer Matching Engine Specification

## Algorithm Breakdown
Matches are scored between 0% and 100% based on weighted criteria:

1. **Crop Commodity Match (35%)**: Direct or substring commodity match.
2. **Quantity Compatibility (25%)**: Available inventory >= required quantity.
3. **Geographic Proximity (20%)**: Same district or adjacent location.
4. **Target Price Compatibility (20%)**: Asking price <= buyer target price.

API Endpoint: `/api/v1/matching`
