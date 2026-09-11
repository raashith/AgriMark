from typing import Dict, Any, List, Optional

class AIImpactCalculator:
    """
    AIImpactCalculator: Calculates farmer economic impact safely:
    - additional_income = post_intervention_net_income - baseline_net_income
    - net_benefit = economic_benefit - AgriMark_service_cost
    - ROI = net_benefit / service_cost (Safe handling when service_cost <= 0)
    """

    @staticmethod
    def calculate_farmer_roi(post_intervention_income: float,
                             baseline_income: float,
                             input_savings: float = 0.0,
                             avoided_losses: float = 0.0,
                             service_cost: float = 500.0) -> Dict[str, Any]:

        additional_income = round(post_intervention_income - baseline_income, 2)
        total_economic_benefit = round(additional_income + input_savings + avoided_losses, 2)
        net_benefit = round(total_economic_benefit - service_cost, 2)

        # Division-by-zero protection rule
        if service_cost <= 0.0:
            roi_ratio = round(net_benefit, 2) # Represent direct net gain when free service
            roi_label = "FREE_SERVICE_NET_GAIN"
        else:
            roi_ratio = round(net_benefit / service_cost, 2)
            roi_label = f"{roi_ratio}:1 ROI"

        return {
            "baseline_income_inr": baseline_income,
            "post_intervention_income_inr": post_intervention_income,
            "additional_income_inr": additional_income,
            "input_savings_inr": input_savings,
            "avoided_losses_inr": avoided_losses,
            "total_economic_benefit_inr": total_economic_benefit,
            "service_cost_inr": service_cost,
            "net_benefit_inr": net_benefit,
            "roi_ratio": roi_ratio,
            "roi_label": roi_label,
            "calculation_version": "v1.0.0"
        }
