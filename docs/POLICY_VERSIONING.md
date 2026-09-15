# AgriMark Policy Versioning & Change Detection

## Version Control
Policy documents maintain a monotonic `version` counter, cryptographic `document_hash` (SHA-256), and `retrieved_at` timestamp.

## Change Events
When a policy update is detected (extended deadlines, revised subsidy rates, altered eligibility terms), a `policy_change_event` is logged containing:
- `old_version`
- `new_version`
- `changed_fields` (diff breakdown)
- `source_url`
- `effective_date`
