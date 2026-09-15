# Digital Twin Security & Privacy Protocol

## 1. Privacy Protection
The Digital Twin OS processes national agricultural data while safeguarding individual privacy:
- **Farm Boundary Encryption**: Precise GPS coordinates and farm boundaries are restricted via Row-Level Security (RLS).
- **Public API Aggregation**: Public national endpoints (`/api/v1/digital-twin/*`) output data aggregated at the district or state level, masking individual farm locations.
- **Tenant Isolation**: FPO and buyer simulation workspaces are strictly isolated by tenant authorization rules.

---

## 2. Row-Level Security (RLS)
All 24 digital twin database tables enable Supabase RLS policies preventing unauthorized cross-tenant data access.
