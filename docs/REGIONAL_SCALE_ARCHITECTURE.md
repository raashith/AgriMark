# AgriMark Regional Scale Architecture Specification

## Overview
AgriMark Phase 9 transforms the platform into a high-capacity regional agricultural network. This document establishes the API taxonomy (`/api/v1/`), database scale performance indexes, RLS multi-tenant security isolation, and data provenance standards.

---

## 1. Core API Taxonomy (`/api/v1/`)
- `/api/v1/fpo/` — FPO Registration, member management, and lot aggregation.
- `/api/v1/market/search` — Regional marketplace search with server-side bounded pagination.
- `/api/v1/data/ingestion` — Multi-layered market data pipeline and quarantine filtering.
- `/api/v1/matching` — Farmer/Buyer matching algorithm.
- `/api/v1/logistics` — Shipment event tracking and fleet assignment.
- `/api/v1/payments` — Settlement abstraction with server-side fee calculation.
- `/api/v1/notifications` — Persisted multi-channel notification dispatch.
- `/api/v1/analytics` — Server-side aggregated regional analytics.

---

## 2. Performance & Scale Indexes
- Applied `02_phase9_regional_scale_indexes.sql` migration creating covering indexes on `listings(state, district, crop_category, status)` and RLS initplan optimizations.
