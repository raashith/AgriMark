# AgriMark Regional Analytics Specification

## Server-Side Aggregation Queries
Avoids loading large datasets into browser memory by executing aggregate queries directly on PostgreSQL:

- Active Farmers Count
- Total Farm Acreage
- Active Listings Count & Available Produce Tonnage
- Average Asking Price per KG vs Mandi Reference Price
- Order Fulfillment Rate Percentage

API Endpoint: `/api/v1/analytics`
