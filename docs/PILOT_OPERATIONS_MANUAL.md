# AgriMark — Real-World Pilot Operations Manual
Version: 1.0.0 (Pilot Cohort 1 - Tamil Nadu)

## 1. Pilot Architecture & Cohort Scope

- **Pilot Cohort Code**: `PILOT-TN-COIMBATORE-01`
- **Target Participants**: 50 Smallholder & Marginal Farmers in Coimbatore & Salem Districts.
- **Roles**: `FARMER`, `BUYER`, `LOGISTICS`, `FIELD_AGENT`.
- **Primary Crops**: Tomato, Onion, Paddy, Banana, Cotton.

---

## 2. Operating Procedures

### Procedure A: Farmer Onboarding
1. Register farmer account via `POST /api/v1/auth/register` with phone authentication.
2. Obtain explicit pilot consent (`POST /api/v1/pilot/onboard` with `consent_version="v1.0"`).
3. Set language preferences (Tamil / English) and optional voice interface mode.
4. Register farm details, soil type, and primary crops.

### Procedure B: Controlled Data Collection
1. **Field Observations**: Record pest/disease symptoms, crop stage, severity, and photo URL.
2. **Inputs & Labor**: Log fertilizer/seed quantities, worker count, hours, and direct costs in INR.
3. **Harvest & Lot Creation**: Log harvest quantity (KG), quality grade (`PREMIUM`, `STANDARD`), and storage method.
4. **Marketplace Listing**: Publish lot listing with pricing per KG.

### Procedure C: AI Feedback Loop
1. Every query via `POST /api/v1/agri-ai/chat` incorporates authorized farm context.
2. The AI model returns structured advisories marked with evidence status (`VERIFIED_OBSERVED`, `ESTIMATED`, `PROJECTED`).
3. Farmer feedback rating (1–5 stars) and action taken (`ACCEPTED`, `ACTED_UPON`, `IGNORED`) are recorded in `ai_feedback_loops`.

### Procedure D: Data Quality & Governance
1. Daily automated scan via `GET /api/v1/pilot/data-quality` checks for:
   - Impossible acreage (>1000 acres for smallholder profile)
   - Invalid GPS coordinates (outside Tamil Nadu bounds)
   - Missing crop variety classifications
   - Orphaned records
2. Identified issues are flagged for field agent review.

### Procedure E: AI Dataset Readiness Metrics
1. Quantitative evaluation via `GET /api/v1/pilot/dataset-readiness` tracks:
   - Number of usable observations
   - Completed crop cycles
   - Labeled disease cases
   - Profitable vs non-profitable outcome balance
2. Datasets remain tagged as `PILOT_READY` until explicit production promotion approval.
