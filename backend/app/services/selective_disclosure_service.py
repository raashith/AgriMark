from typing import Dict, Any, List, Optional
import random

class SelectiveDisclosureService:
    """
    Credential/AttributeDisclosureEngine & Anti-Reidentification Aggregation Engine.
    Enables selective disclosure ("farm_size > 2 acres" instead of personal details)
    and cohort suppression/bucketing to prevent identity inference.
    """
    MIN_COHORT_SIZE = 5

    def generate_selective_claim(self, attribute_name: str, actual_value: Any, claim_rule: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generates a privacy-preserving claim instead of disclosing raw value.
        e.g., claim_rule = {"type": "RANGE", "min": 2.0} -> returns {"claim": "farm_size > 2.0 acres", "is_valid": True}
        """
        claim_type = claim_rule.get("type", "BOOLEAN")

        if claim_type == "RANGE":
            min_val = claim_rule.get("min")
            max_val = claim_rule.get("max")
            valid = True
            if min_val is not None and float(actual_value) < float(min_val):
                valid = False
            if max_val is not None and float(actual_value) > float(max_val):
                valid = False

            label = f"{attribute_name} within range [{min_val}, {max_val}]" if (min_val and max_val) else f"{attribute_name} >= {min_val}"
            return {
                "disclosed_claim": label,
                "is_satisfied": valid,
                "raw_disclosed": False
            }

        elif claim_type == "BOOLEAN":
            expected = claim_rule.get("expected")
            return {
                "disclosed_claim": f"{attribute_name} == {expected}",
                "is_satisfied": actual_value == expected,
                "raw_disclosed": False
            }

        elif claim_type == "BUCKET":
            val = float(actual_value)
            if val < 2.0:
                bucket = "SMALLHOLDER (< 2 acres)"
            elif val <= 5.0:
                bucket = "MEDIUM (2 - 5 acres)"
            else:
                bucket = "LARGE (> 5 acres)"
            return {
                "disclosed_claim": bucket,
                "is_satisfied": True,
                "raw_disclosed": False
            }

        return {"disclosed_claim": "UNKNOWN_CLAIM", "is_satisfied": False, "raw_disclosed": False}

    def sanitize_cohort_aggregate(self, records: List[Dict[str, Any]], group_by_fields: List[str], metric_field: str) -> List[Dict[str, Any]]:
        """
        Aggregates records and suppresses small cohorts (< MIN_COHORT_SIZE) to prevent re-identification.
        """
        groups: Dict[Tuple, List[float]] = {}
        for r in records:
            key = tuple(r.get(f, "UNKNOWN") for f in group_by_fields)
            val = float(r.get(metric_field, 0.0))
            if key not in groups:
                groups[key] = []
            groups[key].append(val)

        results = []
        for key, values in groups.items():
            count = len(values)
            if count < self.MIN_COHORT_SIZE:
                # Cohort suppression
                results.append({
                    "group": dict(zip(group_by_fields, key)),
                    "sample_count": count,
                    "status": "SUPPRESSED_SMALL_COHORT",
                    "aggregate_val": None,
                    "privacy_note": f"Suppressed because cohort size ({count}) < min cohort size ({self.MIN_COHORT_SIZE})"
                })
            else:
                avg_val = round(sum(values) / count, 2)
                results.append({
                    "group": dict(zip(group_by_fields, key)),
                    "sample_count": count,
                    "status": "PUBLIC_AGGREGATE",
                    "aggregate_val": avg_val,
                    "privacy_note": "Privacy compliance verified"
                })

        return results
