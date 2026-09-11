# AgriMark API Catalog (REST Version 1.0)

All APIs are versioned under `/api/v1/` with standardized JSON responses, idempotency headers, request correlation IDs, and RBAC authentication.

## 1. Authentication & Health
- `GET /api/v1/health` — System health check & DB status
- `POST /api/v1/auth/register` — User registration (Farmer, Buyer, FPO, Admin)
- `POST /api/v1/auth/login` — OAuth2 Password Flow JWT login

## 2. Seed, Variety & Biological Intelligence (Stage 26)
- `GET /api/v1/seed/varieties/` — List seed varieties with expected yield ranges
- `GET /api/v1/seed/varieties/{variety_code}` — Get detailed variety profile & GxE suitability
- `POST /api/v1/seed/batches/` — Register seed production batch
- `POST /api/v1/seed/quality/` — Record germination, purity, and vigor seed tests
- `GET /api/v1/seed/provenance/{batch_number}` — Trace seed provenance chain
- `POST /api/v1/seed/authenticity/` — QR authenticity scanner & counterfeit risk flag
- `POST /api/v1/seed/recommendations/` — Soil & climate-tailored variety recommendations
- `GET /api/v1/germplasm/` — Germplasm accessions catalog
- `GET /api/v1/traits/` — Agricultural Trait Ontology with English & Tamil aliases
- `POST /api/v1/genetics/` — Governed genotype metadata registration
- `POST /api/v1/phenotyping/` — Multimodal precision phenotyping analysis
- `GET /api/v1/breeding/` — Breeding experiment trials & candidates
- `POST /api/v1/gxe/` — Genotype × Environment stability analysis
- `GET /api/v1/bioinputs/` — Bio-products registry (biofertilizers, biopesticides, biostimulants)
- `POST /api/v1/bioinputs/evidence/` — Baseline vs treatment efficacy trial recording
- `POST /api/v1/bioinputs/tests/` — Soil organic carbon & biological activity records
- `GET /api/v1/biology/research/` — Biological literature & gene findings catalog
- `POST /api/v1/biology/reviews/` — BioReviewQueue expert review submission

## 3. Logistics, Food Processing & Value Chain (Stage 27)
- `GET /api/v1/logistics/facilities/` — Packhouse, cold storage, and warehouse directory
- `POST /api/v1/logistics/storage-vs-sell/` — Net realization analysis for storing vs selling
- `POST /api/v1/logistics/route-optimize/` — Multimodal reefer route & booking optimization

## 4. Finance, Insurance & Allied Agriculture (Stage 28)
- `POST /api/v1/finance/assess/` — Decision-support credit exposure assessment
- `GET /api/v1/allied/assets/` — Livestock, dairy, poultry, fisheries asset registry
- `POST /api/v1/allied/assets/` — Register allied agricultural asset
- `GET /api/v1/rural/providers/` — Rural service provider directory (Veterinarians, Agronomists)

## 5. Global Trade, Circular Economy & Disaster Mode (Stage 29)
- `POST /api/v1/trade/export-eval/` — Export trade corridor landed cost & product passport
- `POST /api/v1/circular/flows/` — Waste-to-value flow tracking (Biomass, CBG, Compost)
- `POST /api/v1/climate/risk-eval/` — Climate risk engine (Drought, Flood, Heat, Pest)
- `POST /api/v1/disaster/event/` — National Disaster Mode lifecycle management

## 6. Unified National Agricultural OS (Stage 30)
- `POST /api/v1/unified/decision` — Synthesize Decision Cards (Question, Why, Evidence, Risk)
- `POST /api/v1/unified/agent-orchestrate` — Master supervisor agent orchestration
- `GET /api/v1/unified/providers` — Provider health registry & fallback status
- `GET /api/v1/unified/events` & `POST /api/v1/unified/events` — Idempotent event bus & replay
