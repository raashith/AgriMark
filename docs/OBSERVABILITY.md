# AgriMark Observability & Telemetry Framework

## Observability Architecture
- **Correlation & Request IDs**: Every HTTP request receives an `X-Request-ID` header propagated across microservices, AI agents, and database logs.
- **Structured JSON Logging**: Server logs formatted as structured JSON containing timestamp, severity, request_id, user_id, module, and message.
- **Provider Health Monitoring**: Real-time health checks tracked via `/api/v1/unified/providers` endpoint.
- **AI Cost & Token Governance**: Server-side tracking of token usage, inference latency, cost per farmer, and cost per decision card.
