# AgriMark AI Governance & Safety Specifications

## 1. AI Supervisor Principles
The **AgriMark AI Supervisor** manages all intelligent agent capabilities across policy, research, digital twin, and agronomic recommendations.

All production AI behavior must follow the professional AgriAI data and model release rules in [AGRI_AI_PROFESSIONAL_ROADMAP.md](./AGRI_AI_PROFESSIONAL_ROADMAP.md) and [AGRI_AI_DATA_SOURCE_REGISTRY.json](./AGRI_AI_DATA_SOURCE_REGISTRY.json).

## 2. Strict Negative Safeguards
AI MUST NOT:
1. Fabricate citations, peer-reviewed research, dataset providers, licenses, quality scores, or policy rules.
2. Guarantee scheme eligibility, approval, crop yields, market prices, or forecast values.
3. Represent digital twin simulations as guaranteed physical reality.
4. Execute financial transactions over ₹50,000 without human sign-off.
5. Issue direct physical IoT device commands without safety gate verification.
6. Make unauthorized legal or government policy decisions.
7. Treat any model-generated summary or AI-generated dataset as independent scientific evidence.
8. Train on third-party or private farmer data until the original source, license, consent/purpose, privacy controls and intended use have been reviewed and approved.
9. Promote an ML model based on training metrics alone or without reproducible holdout/rolling-origin evaluation, model/data versioning and rollback.

## 3. Evidence Lineage
Every scientific or agronomic factual claim must carry source lineage appropriate to its risk: canonical source URL, publisher, publication/update date, crop/geography scope, evidence type, limitations and verification status. For live market/weather statements, additionally include observation/forecast timestamp, data source and freshness. Distinguish observations from predictions.

## 4. Human Approval Gateways
High-risk recommendations trigger mandatory human approval requests (human_approval_requests) requiring certified agronomist or administrator sign-off before execution. Chemical product selection/dosage, irreversible operational actions, policy decisions and device actuation must not be based on an unreviewed LLM response.

## 5. Model release
A production ML model is eligible for promotion only when:
- Training data and code commit are versioned and reproducible.
- Dataset provenance and license/consent approval are recorded.
- Metrics are computed on held-out data appropriate to the task and compared to baseline.
- Evaluation includes important geography/crop/time/source segments and failure/abstention behavior.
- Artifact checksum, model card, known limitations and inference contract are stored.
- Human approval, monitoring thresholds and a tested rollback path exist.

Training utilities in the repository are research tooling and do not automatically deploy or promote a model.
