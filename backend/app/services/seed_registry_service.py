import uuid
from typing import Dict, Any, List, Optional
from datetime import datetime, date


class SeedRegistryService:
    """
    Service for managing seed varieties, producers, batches, seed tests, and provenance tracking.
    Enforces that expected yield is ALWAYS represented as a non-guaranteed range.
    """

    def __init__(self):
        self._varieties: Dict[str, Dict[str, Any]] = {}
        self._producers: Dict[str, Dict[str, Any]] = {}
        self._batches: Dict[str, Dict[str, Any]] = {}
        self._tests: Dict[str, List[Dict[str, Any]]] = {}
        self._provenance: Dict[str, List[Dict[str, Any]]] = {}
        self._availability: Dict[str, Dict[str, Any]] = {}

        # Seed initial reference varieties
        self._seed_default_varieties()

    def _seed_default_varieties(self):
        v1 = {
            "id": str(uuid.uuid4()),
            "variety_code": "VAR-PADDY-CR1009",
            "crop_name": "Paddy",
            "species": "Oryza sativa",
            "variety_name": "CR 1009 Sub1 (Savitri Sub1)",
            "producer_name": "Tamil Nadu State Seed Development Agency",
            "maturity_duration_days": 155,
            "season": "Samba / Thaladi",
            "planting_window": "August - September",
            "min_yield_kg_per_acre": 1800.0,
            "max_yield_kg_per_acre": 2400.0,
            "quality_traits": ["High Milling Recovery", "Medium Slender Grain", "Good Cooking Quality"],
            "disease_resistance": {"Blast": "MODERATE_RESISTANT", "Bacterial Leaf Blight": "TOLERANT"},
            "pest_resistance": {"Brown Planthopper": "MODERATE_RESISTANT"},
            "drought_tolerance": "MODERATE",
            "heat_tolerance": "HIGH",
            "salinity_tolerance": "MODERATE",
            "water_requirement_mm": 1100.0,
            "soil_suitability": ["Clay", "Clay Loam", "Alluvial"],
            "geographical_suitability": ["Cauvery Delta Zone", "Southern Zone"],
            "evidence_level": "VERIFIED",
            "guaranteed_yield": False, # Always False
            "created_at": datetime.utcnow().isoformat()
        }

        v2 = {
            "id": str(uuid.uuid4()),
            "variety_code": "VAR-COTTON-DCH32",
            "crop_name": "Cotton",
            "species": "Gossypium hirsutum",
            "variety_name": "DCH-32 Hybrid",
            "producer_name": "National Seeds Corporation",
            "maturity_duration_days": 170,
            "season": "Kharif",
            "planting_window": "June - July",
            "min_yield_kg_per_acre": 800.0,
            "max_yield_kg_per_acre": 1200.0,
            "quality_traits": ["Extra Long Staple", "High Spinning Value"],
            "disease_resistance": {"Alternaria Leaf Spot": "TOLERANT"},
            "pest_resistance": {"Bollworm": "MODERATE"},
            "drought_tolerance": "HIGH",
            "heat_tolerance": "HIGH",
            "salinity_tolerance": "LOW",
            "water_requirement_mm": 650.0,
            "soil_suitability": ["Deep Black Cotton Soil", "Clay Loam"],
            "geographical_suitability": ["Deccan Plateau", "Western Zone Tamil Nadu"],
            "evidence_level": "VERIFIED",
            "guaranteed_yield": False,
            "created_at": datetime.utcnow().isoformat()
        }

        self._varieties[v1["variety_code"]] = v1
        self._varieties[v2["variety_code"]] = v2

    def register_variety(self, variety_data: Dict[str, Any]) -> Dict[str, Any]:
        variety_code = variety_data.get("variety_code", f"VAR-{uuid.uuid4().hex[:8].upper()}")
        record = {
            "id": str(uuid.uuid4()),
            "variety_code": variety_code,
            "crop_name": variety_data["crop_name"],
            "species": variety_data["species"],
            "variety_name": variety_data["variety_name"],
            "producer_name": variety_data["producer_name"],
            "maturity_duration_days": variety_data["maturity_duration_days"],
            "season": variety_data["season"],
            "planting_window": variety_data.get("planting_window", "Kharif"),
            "min_yield_kg_per_acre": float(variety_data["min_yield_kg_per_acre"]),
            "max_yield_kg_per_acre": float(variety_data["max_yield_kg_per_acre"]),
            "quality_traits": variety_data.get("quality_traits", []),
            "disease_resistance": variety_data.get("disease_resistance", {}),
            "pest_resistance": variety_data.get("pest_resistance", {}),
            "drought_tolerance": variety_data.get("drought_tolerance", "MODERATE"),
            "heat_tolerance": variety_data.get("heat_tolerance", "MODERATE"),
            "salinity_tolerance": variety_data.get("salinity_tolerance", "LOW"),
            "water_requirement_mm": float(variety_data.get("water_requirement_mm", 500.0)),
            "soil_suitability": variety_data.get("soil_suitability", []),
            "geographical_suitability": variety_data.get("geographical_suitability", []),
            "evidence_level": variety_data.get("evidence_level", "VERIFIED"),
            "guaranteed_yield": False,
            "created_at": datetime.utcnow().isoformat()
        }
        self._varieties[variety_code] = record
        return record

    def get_variety_profile(self, variety_code: str) -> Optional[Dict[str, Any]]:
        variety = self._varieties.get(variety_code)
        if not variety:
            return None
        profile = dict(variety)
        profile["expected_yield_disclaimer"] = (
            f"Expected yield range: {variety['min_yield_kg_per_acre']} - {variety['max_yield_kg_per_acre']} kg/acre. "
            "Yield depends on management, soil, and weather conditions and is NEVER guaranteed."
        )
        return profile

    def list_varieties(self, crop: Optional[str] = None) -> List[Dict[str, Any]]:
        if crop:
            return [v for v in self._varieties.values() if v["crop_name"].lower() == crop.lower()]
        return list(self._varieties.values())

    def register_seed_batch(self, batch_data: Dict[str, Any]) -> Dict[str, Any]:
        batch_number = batch_data.get("batch_number", f"BATCH-{uuid.uuid4().hex[:8].upper()}")
        record = {
            "id": str(uuid.uuid4()),
            "batch_number": batch_number,
            "variety_code": batch_data["variety_code"],
            "producer_code": batch_data["producer_code"],
            "production_year": batch_data.get("production_year", 2026),
            "quantity_kg": float(batch_data["quantity_kg"]),
            "qr_code_hash": batch_data.get("qr_code_hash", f"QR-HASH-{batch_number}"),
            "certification_status": batch_data.get("certification_status", "TESTED"),
            "certification_ref": batch_data.get("certification_ref", f"CERT-{batch_number}"),
            "created_at": datetime.utcnow().isoformat()
        }
        self._batches[batch_number] = record
        # Register initial provenance entry
        self.add_provenance_event(batch_number, "BREEDER", "Seed Production Farm", record["producer_code"])
        return record

    def record_seed_test(self, test_data: Dict[str, Any]) -> Dict[str, Any]:
        test_code = test_data.get("test_code", f"TEST-{uuid.uuid4().hex[:8].upper()}")
        germination = float(test_data["germination_pct"])
        purity = float(test_data["purity_pct"])
        passed = germination >= 80.0 and purity >= 98.0

        record = {
            "id": str(uuid.uuid4()),
            "test_code": test_code,
            "batch_number": test_data["batch_number"],
            "testing_lab": test_data["testing_lab"],
            "test_date": test_data.get("test_date", str(date.today())),
            "germination_pct": germination,
            "purity_pct": purity,
            "moisture_pct": float(test_data["moisture_pct"]),
            "vigor_index": float(test_data.get("vigor_index", 100.0)),
            "disease_contamination_pct": float(test_data.get("disease_contamination_pct", 0.0)),
            "certificate_reference": test_data.get("certificate_reference", f"CERT-{test_code}"),
            "passed": passed,
            "created_at": datetime.utcnow().isoformat()
        }

        if test_data["batch_number"] not in self._tests:
            self._tests[test_data["batch_number"]] = []
        self._tests[test_data["batch_number"]].append(record)
        return record

    def add_provenance_event(self, batch_number: str, stage: str, location: str, handler: str) -> Dict[str, Any]:
        record = {
            "id": str(uuid.uuid4()),
            "batch_number": batch_number,
            "stage": stage, # BREEDER, FOUNDATION, CERTIFIED, DISTRIBUTOR, RETAILER, FARMER
            "location_name": location,
            "handler_name": handler,
            "timestamp": datetime.utcnow().isoformat(),
            "provenance_hash": f"PROV-{uuid.uuid4().hex[:12]}"
        }
        if batch_number not in self._provenance:
            self._provenance[batch_number] = []
        self._provenance[batch_number].append(record)
        return record

    def get_batch_tests(self, batch_number: str) -> List[Dict[str, Any]]:
        return self._tests.get(batch_number, [])

    def get_batch_provenance(self, batch_number: str) -> List[Dict[str, Any]]:
        return self._provenance.get(batch_number, [])
