# AgriMark Product Spec

## Core outcome
AgriMark helps farmers sell agricultural produce directly to buyers while making market conditions easier to understand.

## Primary journey
1. Farmer creates or signs into an account.
2. Farmer registers a farm and crop/cultivation.
3. Farmer records a real harvest batch/produce lot.
4. Farmer publishes that real produce lot as a marketplace listing.
5. Buyer discovers a listing and places an authorized order.
6. Inventory and order state change atomically on the backend.
7. Farmer sees marketplace price beside relevant mandi references when evidence exists.

## Price intelligence
Mandi/market observations are reference intelligence, not promises. Every observation or forecast shown to a user should preserve commodity, geography, unit, observation date, source and confidence/uncertainty where applicable. Empty historical tables must never be represented as a complete historical series.

## Authentication
Normal registration supports the intended user roles only. Admin privileges are not self-selectable from the normal registration UI. A successful login must produce a durable session and route to the correct role home; logout must clear authenticated state and return to login.

## Farmer UX
- Mobile-first and touch-friendly.
- Tamil and English ready.
- Clear units, prices and next actions.
- Useful on weak connections: graceful loading, retry and empty states.
- Avoid technical terminology and unnecessary form complexity.

## Canonical architecture
- Flutter mobile client.
- FastAPI backend under `/api/v1`.
- Supabase/PostgreSQL as the canonical database.
- Server-side AI/data services for intelligence.
- GitHub `main` as the canonical source branch.
- Render `agrimark-api` as the current backend service.

## Non-goals
Do not fabricate historical prices, forecasts, inventory, orders, IDs, weather observations or user data merely to make a screen appear populated. Demo fixtures must be clearly separated from production data.
