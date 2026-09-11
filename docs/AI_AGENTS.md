# AgriMark AI Agents & Swarm Architecture

## 1. Master Supervisor Architecture
AgriMark employs a multi-agent swarm architecture governed by `UnifiedSupervisorAgent` (`backend/app/agents/unified_supervisor.py`).

## 2. Specialized Agents
- **Farmer Assistant Agent**: Advisory for agronomy, soil management, pest alerts, Tamil & English voice interactions.
- **Price Intelligence Agent**: Analyzes mandi spot pricing and historical trends.
- **Demand Intelligence Agent**: Aggregates buyer demand for FPOs and cooperative groups.
- **Marketplace Assistant Agent**: Facilitates produce lot creation, negotiation, and order placement.
- **Agricultural Decision Agent**: Generates standardized farmer Decision Cards.

## 3. Strict Safety Guardrails
1. **Pydantic Tool Execution**: All agent queries route through domain services via Pydantic-validated tool schemas.
2. **Direct DB Write Protection**: LLM outputs are strictly blocked from writing directly to the database.
3. **Server-Side API Key Isolation**: `OPENAI_API_KEY` is contained server-side and never sent to clients.
4. **Human Approval Safeguards**: Financial transactions, credit approvals, regulated record changes, and price modifications require explicit human authorization.
