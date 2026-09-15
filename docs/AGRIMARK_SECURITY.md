# AgriMark Security & Privacy Architecture

## 1. Security Framework
- **Row-Level Security (RLS)**: Enabled across 100% of canonical PostgreSQL tables.
- **Tenant Isolation**: Multi-tenant data segregation between FPOs, buyers, and service providers.
- **Farmer Privacy**: GPS farm boundaries and exact location coordinates are masked on public national endpoints.
- **API Authorization**: JWT-based bearer authentication and role-based access control (RBAC).
