import uuid
from typing import Dict, Any, List, Optional
from datetime import datetime


class GermplasmTraitService:
    """
    Service managing Germplasm Accessions and Agricultural Trait Ontology with Tamil aliases and parent-child relations.
    """

    def __init__(self):
        self._accessions: Dict[str, Dict[str, Any]] = {}
        self._traits: Dict[str, Dict[str, Any]] = {}
        self._germplasm_traits: Dict[str, List[Dict[str, Any]]] = {}

        self._seed_default_ontology()

    def _seed_default_ontology(self):
        traits_data = [
            {
                "trait_code": "TRAIT-YIELD-POTENTIAL",
                "category": "yield",
                "trait_name": "Grain Yield Potential",
                "parent_trait_code": None,
                "synonyms": ["Maximum Yield", "Production Capacity"],
                "tamil_aliases": ["மகசூல் திறன்", "தானிய விளைச்சல்"],
                "regional_terms": ["Bumper Harvest Potential"],
                "description": "Maximum expected yield per unit area under optimal agronomic practices."
            },
            {
                "trait_code": "TRAIT-DROUGHT-TOL",
                "category": "drought_tolerance",
                "trait_name": "Submergence & Drought Resilience",
                "parent_trait_code": None,
                "synonyms": ["Water Stress Resistance", "Dehydration Tolerance"],
                "tamil_aliases": ["வறட்சி தாங்கும் திறன்", "தண்ணீர் பற்றாக்குறை எதிர்ப்பு"],
                "regional_terms": ["Dryland Hardiness"],
                "description": "Ability to sustain growth and yield recovery under severe moisture deficit."
            },
            {
                "trait_code": "TRAIT-HEAT-RES",
                "category": "heat_tolerance",
                "trait_name": "High Temperature Spike Tolerance",
                "parent_trait_code": None,
                "synonyms": ["Thermal Stress Resilience"],
                "tamil_aliases": ["வெப்ப சகிப்புத்தன்மை"],
                "regional_terms": ["Summer Heat Tolerance"],
                "description": "Tolerance to ambient temperatures above 38 degrees Celsius during anthesis."
            },
            {
                "trait_code": "TRAIT-BLAST-RES",
                "category": "disease_resistance",
                "trait_name": "Magnaporthe oryzae Blast Resistance",
                "parent_trait_code": None,
                "synonyms": ["Paddy Blast Resistance"],
                "tamil_aliases": ["குலை நோய் எதிர்ப்பு"],
                "regional_terms": ["Kulai Noy Resistance"],
                "description": "Genetic resistance against leaf and neck blast fungal infection."
            },
            {
                "trait_code": "TRAIT-MATURITY-EARLY",
                "category": "maturity",
                "trait_name": "Early Maturity Duration",
                "parent_trait_code": None,
                "synonyms": ["Short Duration Crop", "Quick Harvest Cycle"],
                "tamil_aliases": ["குறுகிய கால ரகம்", "முன்கூட்டியே முதிர்ச்சி"],
                "regional_terms": ["Kuruvai Special"],
                "description": "Crop maturity period completed within 100-115 days."
            }
        ]

        for t in traits_data:
            t["id"] = str(uuid.uuid4())
            t["created_at"] = datetime.utcnow().isoformat()
            self._traits[t["trait_code"]] = t

    def add_trait(self, trait_data: Dict[str, Any]) -> Dict[str, Any]:
        code = trait_data.get("trait_code", f"TRAIT-{uuid.uuid4().hex[:8].upper()}")
        record = {
            "id": str(uuid.uuid4()),
            "trait_code": code,
            "category": trait_data["category"], # yield, quality, nutrition, drought_tolerance, heat_tolerance, salinity_tolerance, disease_resistance, pest_resistance, etc.
            "trait_name": trait_data["trait_name"],
            "parent_trait_code": trait_data.get("parent_trait_code"),
            "synonyms": trait_data.get("synonyms", []),
            "tamil_aliases": trait_data.get("tamil_aliases", []),
            "regional_terms": trait_data.get("regional_terms", []),
            "description": trait_data.get("description", ""),
            "created_at": datetime.utcnow().isoformat()
        }
        self._traits[code] = record
        return record

    def list_traits(self, category: Optional[str] = None) -> List[Dict[str, Any]]:
        if category:
            return [t for t in self._traits.values() if t["category"].lower() == category.lower()]
        return list(self._traits.values())

    def search_trait_by_alias(self, query: str) -> List[Dict[str, Any]]:
        q = query.lower()
        results = []
        for t in self._traits.values():
            if q in t["trait_name"].lower() or q in t["trait_code"].lower():
                results.append(t)
            elif any(q in s.lower() for s in t.get("synonyms", [])):
                results.append(t)
            elif any(q in alias.lower() for alias in t.get("tamil_aliases", [])):
                results.append(t)
        return results

    def register_accession(self, accession_data: Dict[str, Any]) -> Dict[str, Any]:
        acc_no = accession_data.get("accession_number", f"ACC-{uuid.uuid4().hex[:8].upper()}")
        record = {
            "id": str(uuid.uuid4()),
            "accession_number": acc_no,
            "species": accession_data["species"],
            "source_origin": accession_data["source_origin"],
            "population_type": accession_data.get("population_type", "LANDRACE"),
            "conservation_status": accession_data.get("conservation_status", "ACTIVE"),
            "utilization_history": accession_data.get("utilization_history", "Active breeding line"),
            "created_at": datetime.utcnow().isoformat()
        }
        self._accessions[acc_no] = record
        return record

    def get_accession(self, accession_number: str) -> Optional[Dict[str, Any]]:
        return self._accessions.get(accession_number)

    def list_accessions(self) -> List[Dict[str, Any]]:
        return list(self._accessions.values())
