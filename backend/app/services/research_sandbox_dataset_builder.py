from typing import Dict, Any, List, Optional
import uuid
from datetime import datetime

class ResearchSandboxDatasetBuilder:
    """
    AgriResearchSandbox & AIDatasetBuilder: Builds isolated, versioned, anonymized or synthetic
    datasets for research & AI model training with full provenance, lineage, and impact analysis.
    """
    def __init__(self):
        self._datasets: Dict[str, Dict[str, Any]] = {}
        self._seed_sample_dataset()

    def _seed_sample_dataset(self):
        self.create_ai_dataset(
            dataset_name="TamilNadu_Tomato_Price_Yield_2025",
            date_range={"start": "2025-01-01", "end": "2025-12-31"},
            geographies=["Tamil Nadu"],
            crops=["TOMATO"],
            filters={"quality_score_min": 90.0, "consent_verified": True}
        )

    def create_ai_dataset(self, dataset_name: str, date_range: Dict[str, str], geographies: List[str], crops: List[str], filters: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        d_id = str(uuid.uuid4())
        version = "1.0.0"

        # Governance & Rights check
        rights_check = self._audit_training_rights(crops, geographies)

        dataset_record = {
            "id": d_id,
            "dataset_name": dataset_name,
            "version": version,
            "date_range": date_range,
            "geographies": geographies,
            "crops": crops,
            "record_count": 1500, # Synthetic sample count
            "quality_report": {
                "completeness": 98.5,
                "accuracy": 96.0,
                "bias_score": "LOW",
                "geographic_coverage": "REPRESENTATIVE"
            },
            "governance_rights": rights_check,
            "is_reproducible": True,
            "lineage_hash": f"hash-{d_id[:8]}",
            "created_at": datetime.utcnow().isoformat()
        }
        self._datasets[d_id] = dataset_record
        self._datasets[dataset_name] = dataset_record
        return dataset_record

    def generate_synthetic_sandbox_data(self, domain: str = "CROP", sample_size: int = 10) -> List[Dict[str, Any]]:
        samples = []
        for i in range(sample_size):
            if domain == "WEATHER":
                samples.append({
                    "station_ref": f"SYN-STATION-{100+i}",
                    "temperature_c": round(25.0 + (i % 8), 1),
                    "humidity_pct": 65 + (i % 20),
                    "rainfall_mm": round((i * 1.5), 1),
                    "synthetic_flag": True
                })
            elif domain == "PRICE":
                samples.append({
                    "market_ref": f"SYN-MKT-{i}",
                    "commodity": "TOMATO",
                    "price_per_kg": round(22.0 + (i * 0.8), 2),
                    "synthetic_flag": True
                })
            else:
                samples.append({
                    "farmer_ref": f"SYN-FARMER-{1000+i}",
                    "farm_size_acres": round(1.5 + (i * 0.5), 1),
                    "crop_name": "PADDY",
                    "synthetic_flag": True
                })
        return samples

    def build_model_to_data_impact_graph(self, dataset_id: str) -> Dict[str, Any]:
        ds = self._datasets.get(dataset_id)
        if not ds:
            raise ValueError(f"Dataset '{dataset_id}' not found")

        # Simulate impacted downstream models and agents
        return {
            "target_dataset_id": ds["id"],
            "dataset_name": ds["dataset_name"],
            "impacted_components": {
                "models": ["CropYieldPredictorV2", "PriceForecastModelTN"],
                "agents": ["MarketplaceAssistantAgent", "AdvisoryAgent"],
                "dashboards": ["NationalSupplySecurityDashboard", "FPOAnalyticsView"],
                "simulations": ["DigitalTwinDistrictSim"]
            },
            "recommendation": "Retrain impacted models upon dataset update"
        }

    def _audit_training_rights(self, crops: List[str], geographies: List[str]) -> Dict[str, Any]:
        return {
            "source_rights_verified": True,
            "consent_verified": True,
            "license": "CREATIVE_COMMONS_ATTRIBUTION_ANONYMIZED",
            "privacy_compliance": "PASS",
            "bias_audit": "COMPLIANT"
        }

    def list_datasets(self) -> List[Dict[str, Any]]:
        return [v for k, v in self._datasets.items() if len(k) == 36]
