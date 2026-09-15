# Research AI Governance & Safety Protocol

## 1. Governance Principles
AgriMark's **AgriResearch AI** is an intelligent scientific assistant designed for research discovery, paper summarization, hypothesis generation, and field trial assistance.

AgriMark is **not** a scientific authority. The AI system operates under strict evidence-bounding protocols to prevent scientific hallucination, unvalidated chemical recommendations, and unsafe biological suggestions.

---

## 2. Mandatory Negative Directives
AgriResearch AI is programmatically prohibited from performing the following actions:

1. **Never Fabricate Research**: Do not invent studies, findings, sample sizes, or statistical significance.
2. **Never Fabricate Citations**: All cited DOIs, URLs, titles, and author lists must correspond strictly to verified records in `research_papers`.
3. **Never Guarantee Outcomes**: Never state guaranteed yield increases, financial profits, or crop performance.
4. **Never Issue Unvalidated Chemical Directives**: Never output unapproved pesticide application dosages or dangerous chemical mixtures without official CPCB/ICAR label validation.
5. **Never Recommend Unverified Biological Interventions**: Pathogen strains or bio-control agents not backed by peer-reviewed or regulatory evidence are blocked.
6. **Never Hide Scientific Conflict**: If literature contains conflicting evidence regarding a practice or chemical, both supporting and contradicting studies must be surfaced.

---

## 3. Mandatory AI Labeling & Provenance

### 3.1 `AI_DRAFT` Trial Protocol Tagging
Any trial design, hypothesis, or measurement plan generated or assisted by AI must carry an immutable tag:
```json
{
  "protocol_id": "TRP-2026-089",
  "status": "DRAFT",
  "draft_type": "AI_DRAFT",
  "disclaimer": "AI-generated experiment structure. Requires review by certified agronomist prior to execution."
}
```

### 3.2 Evidence Level Restrictions
Evidence tagged as `AI_GENERATED` in the `knowledge_evidence` table carries an independent validation weight of **0.00**. It cannot independently validate a scientific claim or update the consensus status of any knowledge graph relationship.

---

## 4. High-Risk Safety Pathway
When a user query touches high-risk topics (e.g., severe disease outbreaks, regulated chemical application, quarantine pests):

1. **Provenance Mandate**: Every assertion must link to an explicit `knowledge_evidence` record.
2. **Uncertainty Quantification**: Display confidence score, geographic scope limitations, and methodology boundaries.
3. **Agronomist Human Review**: Include a direct link to flag the recommendation for review by a certified university extension or ICAR-affiliated agronomist.

---

## 5. Model & Claim Provenance Auditability
All AI-generated responses log an immutable record to `research_provenance`:

```sql
INSERT INTO research_provenance (
  claim_id,
  source_evidence_id,
  model_version,
  dataset_version,
  prompt_version,
  retrieved_at,
  query_hash
) VALUES (...);
```
