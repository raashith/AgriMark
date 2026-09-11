from typing import Dict, Any, List, Optional
import uuid

class ModelEconomicLinkService:
    """
    ModelEconomicLinkService: Connects Stage 22 AI Model Registry to actual observed economic outcomes.
    Evaluates Economic Champion selection considering forecast accuracy + observed farmer income impact + safety.
    """
    def __init__(self):
        self._model_outcomes: Dict[str, Dict[str, Any]] = {}
        self._seed_sample_models()

    def _seed_sample_models(self):
        self.record_model_economic_outcome(
            model_code="MOD_CROP_YIELD_TN",
            model_version="v2.1",
            prediction_accuracy=96.5,
            observed_farmer_income_impact_inr=14500.00,
            inference_cost_per_farmer=0.50
        )
        self.record_model_economic_outcome(
            model_code="MOD_PEST_VISION_V2",
            model_version="v1.0",
            prediction_accuracy=98.0,
            observed_farmer_income_impact_inr=11200.00,
            inference_cost_per_farmer=0.20
        )

    def record_model_economic_outcome(self, model_code: str, model_version: str, prediction_accuracy: float, observed_farmer_income_impact_inr: float, inference_cost_per_farmer: float = 0.50) -> Dict[str, Any]:
        m_id = str(uuid.uuid4())

        net_economic_score = round(observed_farmer_income_impact_inr - (inference_cost_per_farmer * 10), 2)

        record = {
            "id": m_id,
            "model_code": model_code,
            "model_version": model_version,
            "prediction_accuracy": prediction_accuracy,
            "observed_farmer_income_impact_inr": observed_farmer_income_impact_inr,
            "inference_cost_per_farmer": inference_cost_per_farmer,
            "net_economic_score": net_economic_score,
            "champion_status": "CHAMPION" if net_economic_score > 12000 else "CHALLENGER"
        }
        self._model_outcomes[model_code] = record
        return record

    def select_economic_champion_model(self, candidate_models: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Selects champion based on economic benefit + prediction accuracy, NOT purely prediction accuracy.
        """
        if not candidate_models:
            return {"champion": None, "reason": "No candidate models provided"}

        sorted_models = sorted(
            candidate_models,
            key=lambda m: (m.get("observed_farmer_income_impact_inr", 0.0), m.get("prediction_accuracy", 0.0)),
            reverse=True
        )
        champion = sorted_models[0]

        return {
            "selected_champion_code": champion["model_code"],
            "selected_version": champion["model_version"],
            "observed_income_impact_inr": champion["observed_farmer_income_impact_inr"],
            "prediction_accuracy": champion["prediction_accuracy"],
            "selection_criterion": "HIGHEST_VERIFIED_FARMER_ECONOMIC_BENEFIT"
        }

    def list_model_outcomes(self) -> List[Dict[str, Any]]:
        return list(self._model_outcomes.values())
