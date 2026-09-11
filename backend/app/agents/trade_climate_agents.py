from typing import Dict, Any, List, Optional


class BaseTradeClimateAgent:
    def __init__(self, name: str, role: str):
        self.name = name
        self.role = role

    def run(self, prompt: str, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        raise NotImplementedError


class GlobalTradeAgent(BaseTradeClimateAgent):
    def __init__(self):
        super().__init__("GlobalTradeAgent", "Export Commodity & Landed Cost Competitiveness Specialist")

    def run(self, prompt: str, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        return {
            "agent": self.name,
            "role": self.role,
            "can_auto_issue_customs_clearance": False, # SAFETY RULE
            "response": "Global Trade Agent: Analyzed export corridor to UAE. Landed cost estimated at $480/MT with 91.5 competitiveness score."
        }


class CircularEconomyAgent(BaseTradeClimateAgent):
    def __init__(self):
        super().__init__("CircularEconomyAgent", "Biomass & Organic Waste-to-Value Specialist")

    def run(self, prompt: str, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        return {
            "agent": self.name,
            "role": self.role,
            "unverified_carbon_credits_claimed": False, # SAFETY RULE
            "response": "Circular Economy Agent: Mapped crop residue to CBG plant. Estimated circular value realization of ₹1,250/MT."
        }


class DisasterResilienceAgent(BaseTradeClimateAgent):
    def __init__(self):
        super().__init__("DisasterResilienceAgent", "National Disaster Mode & Risk Coordination Specialist")

    def run(self, prompt: str, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        return {
            "agent": self.name,
            "role": self.role,
            "impersonate_government_authority": False, # SAFETY RULE
            "response": "Disaster Resilience Agent: Disaster mode alert active for Thanjavur district. Coordinating intelligence with FPOs and insurance providers."
        }
