# AgriMark Platform Architecture

## 1. System Overview
AgriMark is a unified, farmer-first, national-scale agricultural operating system connecting farmers, FPOs, buyers, logistics, physical devices, climate/water intelligence, policy/schemes, research knowledge, digital twins, AI supervision, and national resilience under a single canonical architecture.

---

## 2. Platform Layers
1. **Farmer Operating Center & Action Center**: Unified mobile-first interface for daily farm management, inputs, sales, logistics, schemes, and payouts.
2. **Unified Event Bus & Workflow Engine**: Standardized event-driven architecture and idempotent workflow execution across all agricultural domain services.
3. **National Control Plane & Resilience Engine**: System-wide monitoring of food security, crop production, logistics bottlenecks, water balances, and national resilience indices.
4. **Supervised AI Layer & Governance**: AI Supervisor coordinating evidence-backed recommendations with mandatory human approval gates for high-risk actions.
5. **Canonical Database Layer**: Supabase PostgreSQL featuring 15 comprehensive domain migrations with Row-Level Security (RLS) policies.
