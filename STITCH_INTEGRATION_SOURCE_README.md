# AgriMark Stitch Integration Source

This branch is the integration target for the uploaded Stitch AgriMark Agriculture Ecosystem package.

## Source package

The uploaded package contains 35 named screens (33 HTML screen implementations plus the design system/handoff specifications) covering authentication, onboarding, farmer operations, marketplace, buyer procurement, logistics, AgriAI, and settlement flows.

The Stitch package is treated as the visual authority. The existing AgriMark Next.js application remains the functional authority for authentication, RBAC, API contracts, and Supabase data access.

## Runtime architecture

- Frontend: `web/` — Next.js 14 App Router + Tailwind, deployed to Vercel and Render.
- Backend: `backend/` — FastAPI, already deployed as Render service `agrimark-api`.
- Database/Auth: Supabase project `xrcqzpnstdbbtafhcwbb` with RLS as the source of truth.
- API base: `https://agrimark-api.onrender.com/api/v1`.

## Integration rules

1. Do not replace Supabase Auth with a second auth authority.
2. Do not use demo data, localStorage, or fabricated operational metrics as authoritative data.
3. Preserve role protection for farmer, buyer, FPO, logistics, service provider, and admin.
4. Preserve loading, empty, error, and offline states on every migrated screen.
5. Use the Stitch design tokens: warm cream `#FBF9F2`, emerald `#1B4D3E`, harvest gold `#D97706`, Plus Jakarta Sans, and minimum 48px touch targets.
6. Frontend uses the Supabase publishable key only; never expose service-role/secret keys.

## Deployment contract

Render frontend: Node Web Service, root directory `web`, build `npm install && npm run build`, start `npm start`.

Vercel frontend: same `web` application from this repository; production environment variables must point to the same Supabase project and Render API.
