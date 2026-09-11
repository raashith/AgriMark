from typing import Dict, Any, List, Optional


class BaseFinanceAgent:
    def __init__(self, name: str, role: str):
        self.name = name
        self.role = role

    def run(self, prompt: str, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        raise NotImplementedError


class AgriFinanceAgent(BaseFinanceAgent):
    def __init__(self):
        super().__init__("AgriFinanceAgent", "Working Capital & Warehouse Credit Risk Specialist")

    def run(self, prompt: str, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        return {
            "agent": self.name,
            "role": self.role,
            "can_approve_loans_or_move_money": False, # SAFETY RULE
            "response": "AgriFinance Agent: Evaluated cashflow and warehouse receipt collateral. Decision support assessment complete."
        }


class AlliedAgricultureAgent(BaseFinanceAgent):
    def __init__(self):
        super().__init__("AlliedAgricultureAgent", "Livestock, Dairy, Fisheries & Poultry Specialist")

    def run(self, prompt: str, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        return {
            "agent": self.name,
            "role": self.role,
            "health_alert": "OPTIMAL",
            "response": "Allied Agriculture Agent: Monitored dairy herd health and yield output (450 L/month)."
        }


class RuralMarketplaceAgent(BaseFinanceAgent):
    def __init__(self):
        super().__init__("RuralMarketplaceAgent", "Veterinarian & Agronomist Service Matcher")

    def run(self, prompt: str, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        return {
            "agent": self.name,
            "role": self.role,
            "response": "Rural Marketplace Agent: Matched verified veterinarian service provider in Thanjavur district."
        }
