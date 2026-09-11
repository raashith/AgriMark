import uuid
from typing import Dict, Any, List, Optional
from datetime import datetime


class BioInputEfficacyService:
    """
    Service for bio-input registry, baseline-control-treatment efficacy comparison engine, and soil biology tracking.
    Integrates Stage 25 outcome economics.
    """

    def __init__(self):
        self._products: Dict[str, Dict[str, Any]] = {}
        self._evidence: Dict[str, List[Dict[str, Any]]] = {}
        self._soil_records: Dict[str, List[Dict[str, Any]]] = {}

        self._seed_default_bio_products()

    def _seed_default_bio_products(self):
        bp1 = {
            "id": str(uuid.uuid4()),
            "product_code": "BIO-AZOSPIRILLUM-01",
            "product_name": "Azospirillum brasilense Biofertilizer",
            "product_type": "biofertilizer",
            "manufacturer": "Tamil Nadu Agricultural University Bio-Inputs Lab",
            "composition_metadata": {
                "active_organism": "Azospirillum brasilense",
                "cell_count": "1 x 10^8 CFU/g",
                "carrier": "Lignite / Peat Carrier Powder"
            },
            "storage_instructions": "Store in cool, dry place below 30°C away from direct sunlight.",
            "application_method": "Seed treatment / Soil application with FYM",
            "compatibility_notes": ["Compatible with Rhizobium", "Do not mix directly with chemical fungicides"],
            "approval_status": "APPROVED",
            "created_at": datetime.utcnow().isoformat()
        }

        bp2 = {
            "id": str(uuid.uuid4()),
            "product_code": "BIO-TRICHODERMA-02",
            "product_name": "Trichoderma viride Biopesticide",
            "product_type": "biopesticide",
            "manufacturer": "ICAR-Indian Institute of Rice Research",
            "composition_metadata": {
                "active_fungus": "Trichoderma viride Strain TNAU-1",
                "spore_count": "2 x 10^6 CFU/g",
                "formulation": "Wettable Powder"
            },
            "storage_instructions": "Keep in moisture-free ambient storage.",
            "application_method": "Seed coating / Root dip / Soil drenching",
            "compatibility_notes": ["Compatible with neem formulations", "Incompatible with carbendazim"],
            "approval_status": "APPROVED",
            "created_at": datetime.utcnow().isoformat()
        }

        self._products[bp1["product_code"]] = bp1
        self._products[bp2["product_code"]] = bp2

    def register_bio_product(self, product_data: Dict[str, Any]) -> Dict[str, Any]:
        pcode = product_data.get("product_code", f"BIO-{uuid.uuid4().hex[:8].upper()}")
        record = {
            "id": str(uuid.uuid4()),
            "product_code": pcode,
            "product_name": product_data["product_name"],
            "product_type": product_data["product_type"],
            "manufacturer": product_data["manufacturer"],
            "composition_metadata": product_data.get("composition_metadata", {}),
            "storage_instructions": product_data.get("storage_instructions", "Store in cool dry place."),
            "application_method": product_data.get("application_method", "Soil / Foliar"),
            "compatibility_notes": product_data.get("compatibility_notes", []),
            "approval_status": product_data.get("approval_status", "RESEARCH_ONLY"),
            "created_at": datetime.utcnow().isoformat()
        }
        self._products[pcode] = record
        return record

    def list_bio_products(self, product_type: Optional[str] = None) -> List[Dict[str, Any]]:
        if product_type:
            return [p for p in self._products.values() if p["product_type"].lower() == product_type.lower()]
        return list(self._products.values())

    def get_bio_product(self, product_code: str) -> Optional[Dict[str, Any]]:
        return self._products.get(product_code)

    def record_efficacy_trial(self, trial_data: Dict[str, Any]) -> Dict[str, Any]:
        id_code = trial_data.get("id_code", f"EVID-{uuid.uuid4().hex[:8].upper()}")
        product_code = trial_data["product_code"]

        base_yield = float(trial_data.get("baseline_yield", 1800.0))
        control_yield = float(trial_data.get("control_yield", 1850.0))
        treatment_yield = float(trial_data.get("treatment_yield", 2150.0))

        yield_delta_pct = round(((treatment_yield - control_yield) / control_yield) * 100.0, 2)

        record = {
            "id": str(uuid.uuid4()),
            "id_code": id_code,
            "product_code": product_code,
            "trial_ref": trial_data.get("trial_ref", f"TRIAL-{id_code}"),
            "baseline_yield": base_yield,
            "control_yield": control_yield,
            "treatment_yield": treatment_yield,
            "yield_delta_pct": yield_delta_pct,
            "disease_reduction_pct": float(trial_data.get("disease_reduction_pct", 35.0)),
            "soil_biological_activity_delta": float(trial_data.get("soil_biological_activity_delta", 18.5)),
            "evidence_level": trial_data.get("evidence_level", "TRIAL"),
            "created_at": datetime.utcnow().isoformat()
        }

        if product_code not in self._evidence:
            self._evidence[product_code] = []
        self._evidence[product_code].append(record)
        return record

    def get_product_evidence(self, product_code: str) -> List[Dict[str, Any]]:
        return self._evidence.get(product_code, [])

    def record_soil_biology(self, soil_data: Dict[str, Any]) -> Dict[str, Any]:
        rcode = soil_data.get("record_code", f"SOIL-{uuid.uuid4().hex[:8].upper()}")
        farm_ref = soil_data["farm_ref"]

        mtype = soil_data.get("measurement_type", "MEASURED") # MEASURED, ESTIMATED, MODEL_DERIVED

        record = {
            "id": str(uuid.uuid4()),
            "record_code": rcode,
            "farm_ref": farm_ref,
            "soil_organic_carbon_pct": float(soil_data.get("soil_organic_carbon_pct", 0.75)),
            "microbial_respiration_index": float(soil_data.get("microbial_respiration_index", 42.0)),
            "biological_activity_score": float(soil_data.get("biological_activity_score", 78.5)),
            "nutrient_cycling_capacity": soil_data.get("nutrient_cycling_capacity", "HIGH"),
            "measurement_type": mtype,
            "measured_at": datetime.utcnow().isoformat()
        }

        if farm_ref not in self._soil_records:
            self._soil_records[farm_ref] = []
        self._soil_records[farm_ref].append(record)
        return record

    def get_farm_soil_biology(self, farm_ref: str) -> List[Dict[str, Any]]:
        return self._soil_records.get(farm_ref, [])
