# AgriMark Dispute Lifecycle Architecture

## Dispute State Machine
`DISPUTE_OPENED` -> `EVIDENCE_COLLECTION` -> `SELLER_RESPONSE` -> `BUYER_RESPONSE` -> `UNDER_REVIEW` -> `RESOLUTION_PROPOSED` -> `RESOLVED` -> `APPEALED` -> `CLOSED`.

## Human Oversight
High-impact dispute resolutions require authorized admin review; AI models do not resolve financial disputes autonomously.
