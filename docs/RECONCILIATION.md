# AgriMark Financial Reconciliation Architecture

## Discrepancy Detection
Reconciliation runs compare payment transactions against settlement records to detect:
- Missing payments
- Duplicate payments
- Amount mismatches
- Failed payouts
- Unmatched settlements

Every financial mutation creates an append-only audit trail entry.
