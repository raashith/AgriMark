import uuid
from typing import Dict, Any, List, Optional
from datetime import datetime


class ProviderHealthRegistry:
    """
    Stage 30 Provider Registry & Health Fallback Service.
    Monitors external provider health (Market, Weather, Logistics, Finance, Insurance, AI, Maps, Satellite)
    and ensures graceful fallback to rule engines / cached data when external providers fail.
    """

    def __init__(self):
        self._providers: Dict[str, Dict[str, Any]] = {}
        self._initialize_providers()

    def _initialize_providers(self):
        providers = [
            {"provider_code": "PROV-IMD-WEATHER", "name": "India Meteorological Department API", "category": "WEATHER", "status": "HEALTHY", "fallback_strategy": "HISTORICAL_CLIMATE_NORMALS"},
            {"provider_code": "PROV-ENAM-MARKET", "name": "e-NAM Market Price API", "category": "MARKET", "status": "HEALTHY", "fallback_strategy": "STATE_MANDI_PRICE_INDEX_CACHE"},
            {"provider_code": "PROV-OPENAI-AI", "name": "OpenAI / LLM Reasoning Engine", "category": "AI", "status": "HEALTHY", "fallback_strategy": "DETERMINISTIC_RULE_ENGINE"},
            {"provider_code": "PROV-MAPS-PLATFORM", "name": "Google Maps Platform API", "category": "MAPS", "status": "HEALTHY", "fallback_strategy": "GEOPATIAL_GRID_DISTANCE_CALCULATOR"},
            {"provider_code": "PROV-ISRO-SATELLITE", "name": "Bhuvan ISRO Satellite API", "category": "SATELLITE", "status": "HEALTHY", "fallback_strategy": "MODIS_NDVI_CACHE"}
        ]
        for p in providers:
            p["id"] = str(uuid.uuid4())
            p["last_ping"] = datetime.utcnow().isoformat()
            self._providers[p["provider_code"]] = p

    def get_provider_status(self, provider_code: str) -> Dict[str, Any]:
        return self._providers.get(provider_code, {"status": "UNKNOWN", "fallback_strategy": "RULE_ENGINE"})

    def list_providers(self) -> List[Dict[str, Any]]:
        return list(self._providers.values())

    def execute_with_fallback(self, provider_code: str, primary_action_fn, fallback_data: Any) -> Any:
        provider = self.get_provider_status(provider_code)
        if provider.get("status") == "HEALTHY":
            try:
                return primary_action_fn()
            except Exception:
                provider["status"] = "DEGRADED"
                return fallback_data
        return fallback_data
