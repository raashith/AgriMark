# AgriMark AI Agents Subsystem

The AgriMark AI Subsystem provides autonomous agentic orchestration through a multi-agent swarm supervised by a master supervisor agent.

## Core Agent Hierarchy

- **Master Supervisor**: [`backend/app/agents/unified_supervisor.py`](file:///d:/AgriMark/backend/app/agents/unified_supervisor.py)
- **Farmer Assistant Agent**: Focuses on crop agronomy, pest guidance, and local Tamil/English voice interaction.
- **Price Intelligence Agent**: Analyzes commodity pricing trends and APMC market dynamics.
- **Demand Intelligence Agent**: Identifies buyer demand and aggregation opportunities for FPOs.
- **Marketplace Assistant Agent**: Facilitates listing creation, offer negotiation, and order tracking.
- **Agricultural Decision Agent**: Synthesizes cross-domain inputs into standardized **Decision Cards**.

## Security & Safety Guardrails
1. **Tool-Mediated Execution**: Agents execute actions strictly by calling backend Pydantic-validated domain tools.
2. **Direct DB Writes Blocked**: LLMs cannot run raw SQL statements or mutate database records directly.
3. **No Autonomous Financial Operations**: Money transfers, credit approvals, and price changes require explicit human authorization.
