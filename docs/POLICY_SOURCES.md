# AgriMark Policy Source Verification & Trust Ranking

## Source Trust Classification
- `OFFICIAL_PRIMARY` (Rank 1): Official Gazette, `.gov.in`, `.nic.in` department portals.
- `OFFICIAL_SECONDARY` (Rank 2): Semi-official agricultural university circulars, NABARD updates.
- `AUTHORIZED_PROVIDER` (Rank 3): Licensed e-Sevai / CSC service partner APIs.
- `RESEARCH`: ICAR / ICRISAT policy briefs.
- `COMMERCIAL`: Industry news portals.
- `USER_PROVIDED`: Farmer community uploaded notices.
- `AI_SUMMARY`: LLM-generated summaries (requires underlying source citation).

## Conflicting Source Protocol
When primary and secondary sources present conflicting eligibility terms or deadlines, AgriMark flags both sources as `CONFLICTING` and surfaces both to the user. Silent overwriting is prohibited.
