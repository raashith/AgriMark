# AgriMark API Catalog & Specification

## 1. Overview
All AgriMark REST APIs are versioned under `/api/v1/` and return JSON payloads.

## 2. Authentication & Authorization
- **Endpoint**: `POST /api/v1/auth/login` (OAuth2 Password Flow)
- **Token Type**: Bearer JWT
- **Roles**: `FARMER`, `FPO`, `BUYER`, `ADMIN`, `LOGISTICS`, `QUALITY`

## 3. Major API Groups

| Router Prefix | Subsystem Description | Key Endpoints |
|---|---|---|
| `/api/v1/auth` | Authentication & User Management | `/login`, `/register`, `/me` |
| `/api/v1/farms` | Farm & Acreage Management | `GET /`, `POST /`, `GET /{id}` |
| `/api/v1/crops` | Crop Cultivation & Harvest Logs | `GET /`, `POST /` |
| `/api/v1/marketplace` | Produce Lots, Listings & Orders | `GET /listings`, `POST /orders` |
| `/api/v1/seeds` | Seed Varieties & Authenticity | `GET /varieties`, `POST /verify-qr` |
| `/api/v1/logistics` | Cold Storage & Reefer Telemetry | `GET /facilities`, `POST /telemetry` |
| `/api/v1/finance` | Decision-Support Credit Risk | `POST /credit-risk-assessment` |
| `/api/v1/trade` | Landed Cost & Disaster Mode | `POST /export-landed-cost`, `POST /disaster-mode` |
| `/api/v1/decisions` | Unified Decision Engine | `POST /generate-card` |
| `/api/v1/data-commons` | Data Contracts & Consent | `POST /contracts`, `POST /consent` |
