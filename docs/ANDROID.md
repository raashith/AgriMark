# AgriMark Android Mobile Application Guide

## 1. Stack & Architecture
- **Language**: Kotlin 1.9+
- **UI Toolkit**: Jetpack Compose
- **Architecture**: MVVM (Model-View-ViewModel) + Clean Architecture
- **Dependency Injection**: Hilt (Dagger)
- **Network**: Retrofit2 + OkHttp3
- **Local Persistence**: Room DB (Offline-first sync queue)

## 2. Key User Flows & Activities
- `FarmerControlCenterActivity.kt`: Dashboard, acreage summary, active listings, notification feeds
- `SeedFinderActivity.kt`: Seed variety directory, GxE stability viewer, QR authenticity scanner
- `FarmerOutcomesActivity.kt`: Economic profiles, baseline vs. actual impact cards

## 3. Communication Boundary
The Android application communicates **strictly via REST APIs** at `/api/v1/`. Direct database connections (MySQL or PostgreSQL) from the mobile client are prohibited by architecture.
