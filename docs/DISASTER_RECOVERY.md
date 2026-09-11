# AgriMark Disaster Recovery & Business Continuity Plan

## Backup & Recovery Procedures
- **Database Backup**: Automated daily MySQL mysqldump snapshots with point-in-time binary log replication.
- **Migration Rollback**: Alembic migration downgrade scripts (`alembic downgrade -1`).
- **Event Bus Replay**: Unified Event Bus maintains idempotent replay log for event stream recovery.

## Provider & System Outage Mitigation
1. **AI Provider Failure**: Graceful degradation to server-side rule engine and cached advisory knowledge.
2. **Weather API Outage**: Automatic fallback to historical climate normals and regional grid data.
3. **Market Price API Outage**: Automatic fallback to 7-day state mandi price index cache.
4. **Database Outage**: Read-only replica promotion and local SQLite mobile offline caching.
