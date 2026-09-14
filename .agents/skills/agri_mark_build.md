# AgriMark Build Skill

## Build sequence
1. Inspect existing code and database schema before changing anything.
2. Implement the smallest complete slice that a real user can exercise.
3. Keep farmer UX simple while keeping backend/data logic explicit.
4. Add or update tests for every auth, marketplace, and data-contract change.
5. Verify API behavior and navigation before declaring a feature complete.

## Marketplace slice
Farmer: farm/crop -> cultivation -> harvest -> produce lot -> listing -> buyer order -> seller acceptance -> fulfilment.
Buyer: browse -> inspect farmer/quality/harvest/price/mandi reference -> order -> track status.
Never skip the produce-lot invariant and never use placeholder IDs.

## Price intelligence slice
Present:
- current marketplace farmer asking price
- mandi reference modal/min/max when available
- observed date and source
- unit conversion explicitly
- delta between farmer price and reference
- forecast estimate only when sufficient data exists
- confidence/uncertainty and freshness
If data is missing, show "Data not available" rather than inventing values.

## Auth slice
- Login must validate credentials and persist the session securely.
- Startup must restore the session and route to the correct role home.
- Logout must clear local session state and return to login.
- Roles allowed in the normal app: farmer, buyer, fpo, logistics, service_provider.
- Admin must not be selectable as an ordinary self-service role.

## Farmer-first UX
Use plain language, clear INR/kg or INR/quintal units, large actions, Tamil/English-ready labels, and low-bandwidth-friendly network behavior. Prefer progressive disclosure over dense forms.

## Data integrity
All external agricultural observations must carry provenance and coverage metadata. Do not claim historical/live data coverage unless rows actually exist in the canonical Supabase tables.
