# AgriMark AI Supervisor & Tool Governance Engine

## Overview

The **AI Supervisor** (`web/src/lib/ai-supervisor-governance.ts`, `/api/v1/ai/supervisor`) manages LLM tool authorization, request routing, evidence validation, and safety policy enforcement.

Agents are **NEVER** granted direct or unrestricted database access.

---

## Tool Governance Classification

Every tool available to AgriMark AI Agents is strictly classified into one of four safety tiers:

| Tier | Category | Examples | Execution Behavior |
| :--- | :--- | :--- | :--- |
| **Tier 1** | `READ_ONLY` | Market price lookup, weather query, crop advisory lookup | Executed immediately by agent. |
| **Tier 2** | `SAFE_MUTATION` | Create personal farm task, update farmer preference, record user feedback | Executed directly within user context. |
| **Tier 3** | `HUMAN_APPROVAL_REQUIRED` | Submit loan application, approve dispute resolution, execute transaction, issue organic certification | Pauses execution & creates an `approval_request`. |
| **Tier 4** | `FORBIDDEN` | Unrestricted DB queries, secret/token retrieval, RLS bypass, autonomous wire transfer | Permanently blocked & logged to incident log. |

---

## Allowed & Forbidden Tool Matrix

```typescript
export const AI_TOOL_GOVERNANCE: Record<string, ToolPolicy> = {
  get_market_prices: { category: 'READ_ONLY', requires_approval: false },
  get_weather_forecast: { category: 'READ_ONLY', requires_approval: false },
  create_farm_task: { category: 'SAFE_MUTATION', requires_approval: false },
  submit_credit_application: { category: 'HUMAN_APPROVAL_REQUIRED', requires_approval: true },
  approve_dispute_settlement: { category: 'HUMAN_APPROVAL_REQUIRED', requires_approval: true },
  execute_direct_db_query: { category: 'FORBIDDEN', requires_approval: false },
  bypass_rls_policies: { category: 'FORBIDDEN', requires_approval: false }
};
```

---

## AI Supervisor Responsibilities

1. **Request Routing**: Direct queries to specialized agents (Crop Doctor, Market Advisor, Finance Assistant).
2. **Permission Validation**: Verify caller role and check tool policy matrix before execution.
3. **Evidence Synthesis**: Combine multi-source data (satellite, weather, market data) with confidence scoring.
4. **Provenance Logging**: Track LLM prompt, execution traces, tool invocations, and output tokens in `ai_interactions`.
5. **Uncertainty Detection**: Flag low-confidence outputs (<75%) and escalate to human agricultural extension officers.
