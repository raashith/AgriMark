# AgriMark Incident Response & Escalation Protocol

## 1. Incident Classification
- **P0 Critical**: Database outage, authentication failure, inventory corruption, or unauthorized data access.
- **P1 High**: Order reservation failure, payment status sync issue, or AI service outage.
- **P2 Moderate**: Non-blocking UI glitch or localized telemetry latency.

## 2. Response Steps
1. **Containment**: Check `/api/diagnostic` and Supabase dashboard for database health.
2. **Audit Verification**: Inspect `admin_audit_log` to identify root causes and affected user IDs.
3. **Rollback**: If a deployment issue occurs, revert Vercel deployment to the previous verified production commit.
4. **Resolution & Reporting**: Document incident findings in `admin_audit_log` and notify pilot participants.
