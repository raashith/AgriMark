# Scientific Provenance & Citation Integrity

## 1. Provenance Architecture
Scientific integrity in **AgriMark** relies on absolute traceability. Every agricultural claim, crop profile parameter, disease diagnosis recommendation, and consensus score retains an end-to-end audit trail pointing back to primary research or official institutional documentation.

---

## 2. Ingestion & Adapter Verification
All research data ingested from external repositories (e.g., ICAR ePubs, OpenAlex, PubMed, AGRIS, open datasets) passes through standardized ingestion adapters:

Each ingested record enforces seven mandatory metadata fields:
1. `source_url`: Full canonical URL of source repository or DOI resolver.
2. `retrieved_at`: ISO 8601 UTC timestamp of retrieval.
3. `document_hash`: Cryptographic SHA-256 hash of original raw document payload.
4. `parser_version`: Version string of extraction pipeline (e.g., `pdf-parser-v2.1.0`).
5. `source_type`: Repository taxonomy (`INSTITUTIONAL_REPO`, `PEER_REVIEWED_JOURNAL`, `OPEN_DATASET`, `EXTENSION_BULLETIN`).
6. `license`: Data licensing terms (`CC-BY-4.0`, `Open-Government-Licence-India`, `Restricted-Academic`).
7. `validation_status`: Pipeline verification state (`PENDING`, `VALIDATED`, `QUARANTINED`, `REJECTED`).

---

## 3. Ingestion Quarantine & Safeguards
Source documents failing schema validation, missing DOIs, or exhibiting corrupted document hashes are automatically assigned `QUARANTINED` status in `research_papers`:

- **Quarantine Criteria**:
  - Missing or malformed DOI string.
  - SHA-256 hash mismatch upon re-parsing.
  - Unverified source domain (not present in `research_institutions` allowlist).
  - Conflicting license terms prohibiting agricultural extension use.
- **Production Isolation**: Quarantined records are filtered out from all knowledge graph traversals, evidence calculations, and search endpoints (`/api/v1/research/search`).

---

## 4. Citation Non-Fabrication Guarantee
To eliminate AI citation hallucination:
- Every citation rendered in user interfaces or API outputs MUST exist as a foreign key link to an audited `research_papers` row.
- Search indexes verify target DOIs against cross-ref resolvers before indexing.
- Unlinked or loose citations generated during text processing are scrubbed before reaching client layers.

---

## 5. Synthetic Data Isolation
For testing, benchmarking, and staging, synthetic records are generated and inserted with:
```sql
data_origin = 'SYNTHETIC'
```

**Production Invariant**: All production API endpoints (`/api/v1/research/*`) enforce strict filtering:
```sql
WHERE data_origin != 'SYNTHETIC' -- OR data_origin IS NULL
```
Synthetic records are programmatically rejected from production intelligence views, knowledge consensus aggregation, and research assistant contexts.
