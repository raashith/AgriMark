# AgriMark Data Governance Policy

## 1. Data Classification
Data assets are categorized into four security levels:
1. `PUBLIC`: Market prices, aggregated regional production statistics, verified research summaries.
2. `INTERNAL`: Anonymized network graphs, regional logistics utilization.
3. `CONFIDENTIAL`: FPO financial records, buyer RFQ bids, private trial protocols.
4. `RESTRICTED`: Individual farmer PII, bank account details, exact farm boundary coordinates.

---

## 2. Retention & Audit Logs
365-day immutable access and query logging (`data_governance_access_logs`).
