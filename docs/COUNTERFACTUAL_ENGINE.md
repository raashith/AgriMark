# Counterfactual Engine & Intervention Analysis

## 1. Counterfactual Analysis ("What Would Have Happened If...")
The **Counterfactual Engine** evaluates historical baseline data against altered hypothetical variables (e.g., higher rainfall, different crop selection, alternative storage capacity).

---

## 2. Mandatory Output Tagging
All counterfactual outputs are explicitly tagged with:
```json
{
  "output_tag": "COUNTERFACTUAL_SIMULATION",
  "hypothetical_variable": "irrigation_coverage_pct",
  "delta_explanation": "If drip irrigation coverage had been 80%, regional water deficit would have decreased by 40%."
}
```
This output tag ensures UI layers and downstream API consumers never mistake counterfactual simulations for observed historical facts.
