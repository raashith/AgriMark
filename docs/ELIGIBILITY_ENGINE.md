# AgriMark Rule-Driven Eligibility Engine

## Evaluation Outcomes
1. `ELIGIBLE`: All mandatory criteria, landholding limits, jurisdiction rules, and document requirements are satisfied.
2. `POSSIBLY_ELIGIBLE`: Key criteria match, but certain secondary documents or parameters require verification.
3. `NOT_ELIGIBLE`: One or more hard eligibility rules failed (e.g. cross-state mismatch or landholding size breach).
4. `INSUFFICIENT_INFORMATION`: Missing critical profile data required to evaluate eligibility.

## Transparency Mandate
Every eligibility evaluation explicitly details:
- Matched rules
- Failed rules
- Missing information
- Source document & version
- Confidence score
