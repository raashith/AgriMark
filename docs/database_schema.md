# AgriMark Database Schema Specification

## Database Engine
- **Target RDBMS**: MySQL 8.0+
- **Database Name**: `agrimark_db`
- **Charset / Collation**: `utf8mb4 / utf8mb4_unicode_ci`

## Table Summary (39 Entities)

1. `roles`: Access control role definitions (`admin`, `farmer`, `buyer`, `fpo`).
2. `users`: Core account records with phone, email, hashed credentials, and role bindings.
3. `farmer_profiles`: Farmer identity, FPO affiliation, verification state, and experience.
4. `buyer_profiles`: Buyer identity, business metadata, GSTIN, and delivery defaults.
5. `farms`: Farm property records, land area (acres), soil type, and irrigation sources.
6. `farm_locations`: Geocoded farm location details (Taluka, District, State, Pincode, Lat/Long).
7. `crops`: Master crop reference table (category, variety, typical season, shelf life).
8. `farm_crops`: Allocated crop acreage per farm per season.
9. `cultivation_cycles`: Sowing to harvest cycle tracking, input costs, and lifecycle status.
10. `production_records`: Harvest output logs, yields (kg), and quality grades.
11. `market_prices`: Historical and daily market commodity price records (min, max, modal).
12. `market_arrivals`: Market arrival quantities (tonnes) per commodity and district.
13. `price_predictions`: ML output for predicted commodity prices with confidence ranges.
14. `demand_history`: Historical regional sales volumes and unmet buyer demand.
15. `demand_predictions`: Regional demand forecasts and criticality ratings.
16. `produce_batches`: Harvest batch traceability records with batch codes and images.
17. `inventory`: Batch storage tracking, temperature, and shelf-life expiration dates.
18. `quality_records`: Quality inspection grade logs and moisture metrics.
19. `listings`: Marketplace produce listings (fixed-price, negotiable, bulk).
20. `buyer_requests`: Reverse marketplace buyer purchase requirements.
21. `offers`: Price/quantity negotiation offers between buyers and farmers.
22. `matches`: Farmer-buyer match recommendations and proximity scores.
23. `carts`: Buyer shopping cart containers.
24. `cart_items`: Itemized produce listings within a buyer cart.
25. `orders`: Purchase orders placed by buyers with status tracking.
26. `order_items`: Line items referencing produce batches and agreed unit prices.
27. `transporters`: Logistics provider entity records.
28. `delivery_orders`: Dispatch orders, assigned transporters, and estimated dates.
29. `tracking_events`: Real-time transit milestone logs.
30. `payments`: Payment transaction logs and payment methods (UPI, Escrow, COD).
31. `settlements`: Farmer payout calculation logs and platform fees.
32. `reviews`: Post-order feedback and textual evaluations.
33. `ratings`: 1 to 5 star rating scores tied to reviews.
34. `verification_records`: KYC document uploads (Aadhaar, GSTIN, Land records).
35. `notifications`: In-app user alerts and price movement notifications.
36. `ai_conversations`: Chat session containers for AI agent interactions.
37. `ai_agent_runs`: Audit trail of AI agent prompts, tool invocations, and execution latency.
38. `ai_recommendations`: Structured recommendations generated for farmers/buyers.
39. `audit_logs`: System-wide security and mutation audit records.
