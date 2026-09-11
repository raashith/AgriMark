# AgriMark Final Release Checklist

All items must be verified before deploying AgriMark to production infrastructure:

- [x] Database migrations verified (`001` through `020` Alembic migrations)
- [x] Database backup & restore procedures verified
- [x] Authentication & JWT token expiration verified
- [x] Role-Based Access Control (RBAC) & tenant isolation verified
- [x] REST API contracts & versioning (`/api/v1/`) verified
- [x] Server-side OpenAI API key isolation & prompt injection defenses verified
- [x] Model cards, dataset cards, & Diff-in-Diff causal impact validation verified
- [x] Data provenance & 7-tier evidence status classification verified
- [x] Android Kotlin build & offline synchronization contract verified
- [x] Web Control Tower & HTML/CSS/JS frontend builds verified
- [x] End-to-End Farmer, FPO, and Buyer business flows verified
- [x] Observability request correlation IDs & structured JSON logs verified
- [x] AI token cost controls & timeout fallbacks verified
- [x] Production environment configuration (`.env.example`) verified
- [x] Real secrets, private keys, and passwords excluded from git repository
- [x] Incident response & disaster recovery procedures documented
- [x] Rollback scripts (`alembic downgrade`) verified
- [x] Pilot safety gates & non-autonomous biological/physical execution guardrails verified
