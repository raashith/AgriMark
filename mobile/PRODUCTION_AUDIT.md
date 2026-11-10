# AgriMark Flutter Production Audit

**Audit date:** 2026-11-10  
**Audited ref:** `main` at `b090419f5df249a3637ee66ceba056147f5fe722`  
**Target branch:** `feat/flutter-production-complete`  
**Scope:** Complete application, Android + iOS, all feature groups.

## Executive result

The existing `mobile/` directory is a real Flutter application with a meaningful feature foundation. It must be extended in place. It is not yet demonstrably production-ready, and this repository audit cannot substitute for Flutter SDK builds, device testing, or backend integration tests.

Existing modules include intro, login/register, home dashboard, farm/crops/observations/harvest, marketplace/sell produce, orders/tracking UI, AgriAI chat, profile, shared API client, secure storage, English/Tamil strings, Android scaffolding, and a small unit/widget test suite.

## Verified blockers and gaps

### P0 — API contract mismatch

- The Flutter endpoint constants assume `/api/v1/farmer/dashboard`, `/farmer/farms`, `/farmer/crops`, `/farmer/observations`, and `/farmer/harvests`.
- The inspected FastAPI router registers core resources under `/api/v1/core`, including `/core/profiles`, `/core/profiles/{profile_id}/farms`, `/core/cultivations`, `/core/farmer-cultivations`, `/core/harvest-batches`, and `/core/produce-lots`. No `/farmer/*` router was registered in `backend/app/main.py`.
- Flutter expects `/api/v1/marketplace/search` and `/marketplace/listings`; inspected marketplace router exposes RFQs, offers, orders and notifications. Core listing routes are under `/core/listings`. These are not interchangeable contracts.
- Flutter config points to `/api/v1/weather/signal`; inspected weather router exposes `/weather/current` and `/weather/forecast`.
- Flutter's market-price constant is `/market/prices`; no matching route was identified in the inspected registered routers. Verify actual deployed API OpenAPI before wiring price/forecast views.
- Flutter legacy login/register calls `/auth/login` and `/auth/register`. Firebase sync exists at `POST /auth/firebase/sync` and requires a verified Firebase ID token plus matching UID. The mobile auth flow must be reconciled with the deployed Firebase authentication contract; do not silently retain a legacy password flow or invent a Firebase client configuration.

### P0 — farmer identity and data ownership

- The inspected core routes are profile-ID based for farm creation/listing. The mobile repositories currently call farmer-scoped routes and do not show a verified profile-ID resolution flow.
- Resolve the authenticated profile once, use the server-authorized identity for all farm/crop/harvest requests, and never trust a client-supplied user/profile ID as an authorization boundary.
- Confirm payload/response schemas for farms, cultivations, harvest batches, produce lots, and listings against the Pydantic schemas and deployed OpenAPI before changing repository mappings.

### P1 — runtime reliability and security

- `ApiClient` has GET/POST/PUT only; no PATCH/DELETE or multipart upload support for camera/disease-image/voice workflows.
- No centralized token refresh/retry policy is implemented even though refresh-token storage and a refresh endpoint constant exist.
- Request query values are concatenated without URI query-parameter encoding.
- Offline status is rendered with `OfflineBanner(isOffline: false)`, so the UI cannot truthfully report connectivity.
- `fetchMe()` can return cached user data after any request failure, including authorization failures; distinguish network errors from invalid/expired sessions before restoring a cached session.
- Release Android build currently signs with the debug signing config. This is not a Play Store release-signing setup.
- Android manifest declares camera/location/network permissions; runtime permission UX, privacy disclosure, and feature-specific permission gating need verification.

### P1 — feature completeness

- Notifications screen is a static empty state; marketplace backend already has notification list and mark-read routes.
- Current navigation is farmer-oriented only. Buyer, FPO, logistics and admin experiences are not implemented as role-specific app surfaces.
- Weather, mandi price history/forecast, buyer discovery/negotiation, logistics actions, and disease image upload need end-to-end API contracts and user flows.
- AgriAI text chat exists; voice and image workflows need upload, permission, timeout, retry, and provenance handling.
- Language support is only English/Tamil in the current Flutter localization class. Locale selection/persistence and complete translated coverage are not verified.
- Offline caching/sync queue and conflict handling are not demonstrated by the inspected repositories.

### P1 — platform coverage

- Android Gradle scaffolding exists.
- No `mobile/ios/` directory was present in the audited main tree. iOS support must be generated/configured in this same Flutter project (not a second project), then signed and tested on macOS/Xcode.
- Android release config uses compileSdk 34, AGP 8.2.0, Kotlin 1.9.20, Java 17 and debug signing. Review compatibility against the selected current Flutter SDK and update only after building in CI.

### P2 — testing and quality

- Existing tests cover a small subset of repository behavior and one initial home-screen loading state.
- The market repository test constructs a real default HTTP client without a fake/mock transport; this can become network-dependent.
- Add deterministic API contract tests, auth/session tests, serialization tests, role-routing tests, offline/retry tests, widget tests for loading/error/empty/success states, and integration tests against a controlled backend.
- Add Flutter analyze/test/build jobs for Android and iOS-capable CI. The prior canonical backend workflow failure is not evidence of a Flutter compile failure; this audit did not execute Flutter commands.

## Implementation sequence

1. Lock the real backend contract: inspect all registered FastAPI routes, Pydantic request/response models, Firebase client setup, and deployed OpenAPI. Record the contract in `mobile/docs/API_CONTRACT.md`.
2. Repair shared platform foundation: environment-based API configuration, typed API errors, query encoding, multipart, PATCH/DELETE, safe token refresh, secure session restoration, connectivity state, and logging without secrets.
3. Resolve Firebase authentication and role-aware onboarding. Enforce server-side authorization and role-specific route guards.
4. Complete farmer workflows: profile, farms, crops, observations, harvest batches, produce lots, dashboard.
5. Complete market workflows: real mandi observations, source/time labels, filters, history and forecast only where backend data exists, listings, RFQs/offers/orders.
6. Complete buyer, FPO, logistics and admin role surfaces with server permissions.
7. Complete AgriAI text/voice/image flows, crop disease upload/results, weather, notifications and deep links.
8. Add offline-first cache/outbox, conflict policy, localization coverage, accessibility, responsive layouts, and secure permission UX.
9. Add Android/iOS platform configuration, signing documentation, CI, tests, observability and release runbooks.
10. Run real-device QA and backend integration tests. Do not mark production-ready until these pass.

## Guardrails

- Preserve the existing `mobile/` project, features, branding, and business logic.
- No duplicate Flutter project, template replacement, fake API success, dummy market metrics, hard-coded farmer identity/location, or secrets in source control.
- Do not claim a feature is complete until it is connected to a verified backend contract and has success, loading, empty, error, offline, and retry behavior.
- Keep changes on `feat/flutter-production-complete`; review through a pull request before merging to `main`.
