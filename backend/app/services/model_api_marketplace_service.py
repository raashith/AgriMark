from typing import Dict, Any, List, Optional
import uuid

class ModelApiMarketplaceService:
    """
    Model Marketplace & API Catalog: Governed registry for models & APIs
    integrated with Stage 22 AI Trust & Stage 23 Data Commons.
    """
    def __init__(self):
        self._models: Dict[str, Dict[str, Any]] = {}
        self._apis: Dict[str, Dict[str, Any]] = {}
        self._seed_defaults()

    def _seed_defaults(self):
        self.register_model({
            "id": "mod-001",
            "model_code": "MOD_CROP_YIELD_TN",
            "title": "Tamil Nadu Tomato Yield Predictor",
            "framework": "PYTORCH",
            "task_category": "YIELD_FORECAST",
            "safety_status": "CERTIFIED_SAFE",
            "benchmark_results": {"mape": "4.2%", "rmse": 0.85},
            "owner": "TNAU Research Lab"
        })
        self.register_model({
            "id": "mod-002",
            "model_code": "MOD_PEST_VISION_V2",
            "title": "Pest & Disease Classifier Vision Model",
            "framework": "TENSORFLOW",
            "task_category": "DISEASE_DETECTION",
            "safety_status": "CERTIFIED_SAFE",
            "benchmark_results": {"accuracy": "96.8%", "f1": 0.96},
            "owner": "AgriVision AI"
        })

        self.register_api({
            "id": "api-001",
            "api_code": "API_MANDI_PRICES",
            "title": "Agmarknet Mandi Price Feed API",
            "category": "PRICE",
            "provider": "AgriMark Data Commons",
            "endpoint": "/api/v1/data/catalog",
            "auth": "OAuth2 / API Key",
            "sla": "99.9% Uptime",
            "sandbox_available": True
        })
        self.register_api({
            "id": "api-002",
            "api_code": "API_WEATHER_IMD",
            "title": "IMD High-Res Weather Grid API",
            "category": "WEATHER",
            "provider": "IMD Weather Service",
            "endpoint": "/api/v1/data/exchange/process",
            "auth": "API Key",
            "sla": "99.5% Uptime",
            "sandbox_available": True
        })

    def register_model(self, model_data: Dict[str, Any]) -> Dict[str, Any]:
        m_id = model_data.get("id") or str(uuid.uuid4())
        model_data["id"] = m_id
        self._models[m_id] = model_data
        self._models[model_data["model_code"]] = model_data
        return model_data

    def register_api(self, api_data: Dict[str, Any]) -> Dict[str, Any]:
        a_id = api_data.get("id") or str(uuid.uuid4())
        api_data["id"] = a_id
        self._apis[a_id] = api_data
        self._apis[api_data["api_code"]] = api_data
        return api_data

    def list_models(self) -> List[Dict[str, Any]]:
        return [v for k, v in self._models.items() if v.get("id") == k]

    def list_apis(self) -> List[Dict[str, Any]]:
        return [v for k, v in self._apis.items() if v.get("id") == k]

