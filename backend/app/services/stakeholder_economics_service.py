from typing import Dict, Any, List, Optional
import uuid

class StakeholderEconomicsService:
    """
    Stakeholder Economics Service:
    - FPO Economics (aggregation volume, member price realization gain, negotiation benefit)
    - Buyer Economics (procurement cost, landed cost, quality loss reduction)
    - Logistics Outcomes (transit time, spoilage avoided, transport cost savings)
    - Resource & Climate Outcomes (water use efficiency, input savings, drought loss reduction)
    - Post-Harvest Economics (post-harvest loss rate, avoidable loss value)
    """

    def calculate_fpo_aggregation_outcomes(self, fpo_code: str, member_count: int, total_volume_quintals: float, unaggregated_avg_price: float, aggregated_realized_price: float) -> Dict[str, Any]:
        price_gain_per_quintal = round(aggregated_realized_price - unaggregated_avg_price, 2)
        total_member_gain = round(price_gain_per_quintal * total_volume_quintals, 2)
        gain_per_farmer = round(total_member_gain / member_count, 2) if member_count > 0 else 0.0

        return {
            "fpo_code": fpo_code,
            "member_count": member_count,
            "total_volume_quintals": total_volume_quintals,
            "unaggregated_avg_price_per_q": unaggregated_avg_price,
            "aggregated_realized_price_per_q": aggregated_realized_price,
            "price_gain_per_quintal": price_gain_per_quintal,
            "total_member_gain_inr": total_member_gain,
            "gain_per_farmer_inr": gain_per_farmer,
            "aggregation_roi": round(total_member_gain / (total_volume_quintals * 15.0), 2) # Assuming ₹15/q aggregation cost
        }

    def calculate_buyer_procurement_outcomes(self, buyer_id: str, baseline_landed_cost: float, optimized_landed_cost: float, volume_tonnes: float) -> Dict[str, Any]:
        cost_savings_per_tonne = round(baseline_landed_cost - optimized_landed_cost, 2)
        total_procurement_savings = round(cost_savings_per_tonne * volume_tonnes, 2)

        return {
            "buyer_id": buyer_id,
            "baseline_landed_cost_per_t": baseline_landed_cost,
            "optimized_landed_cost_per_t": optimized_landed_cost,
            "volume_tonnes": volume_tonnes,
            "cost_savings_per_tonne": cost_savings_per_tonne,
            "total_procurement_savings_inr": total_procurement_savings
        }

    def calculate_post_harvest_loss_outcomes(self, harvested_kg: float, rejected_spoiled_kg: float, price_per_kg: float) -> Dict[str, Any]:
        loss_rate_pct = round((rejected_spoiled_kg / harvested_kg * 100.0), 2) if harvested_kg > 0 else 0.0
        loss_value_inr = round(rejected_spoiled_kg * price_per_kg, 2)

        return {
            "harvested_kg": harvested_kg,
            "rejected_spoiled_kg": rejected_spoiled_kg,
            "post_harvest_loss_rate_pct": loss_rate_pct,
            "loss_value_inr": loss_value_inr,
            "avoidable_loss_savings_inr": round(loss_value_inr * 0.60, 2) # Assuming 60% avoidable with cold storage/advisory
        }
