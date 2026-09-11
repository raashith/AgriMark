import uuid
from typing import Dict, Any, List, Optional
from datetime import datetime


class BioResearchEvidenceService:
    """
    Service for biological research knowledge graph, scientific evidence tracking,
    expert review queue (BioReviewQueue), Stage 20 digital twin simulation integration, and Stage 22 trust cards.
    """

    def __init__(self):
        self._research_records: Dict[str, Dict[str, Any]] = {}
        self._review_queue: Dict[str, Dict[str, Any]] = {}
        self._knowledge_graph_nodes: Dict[str, Dict[str, Any]] = {}
        self._knowledge_graph_edges: List[Dict[str, Any]] = []

        self._seed_default_research_evidence()

    def _seed_default_research_evidence(self):
        r1 = {
            "id": str(uuid.uuid4()),
            "record_code": "PUB-2025-SUB1-GENE",
            "title": "SUB1A Gene Identification and Submergence Tolerance in Savitri Rice Varieties",
            "authors": "Dr. S. Ramanathan, Dr. M. Jayaraman",
            "publication": "Indian Journal of Genetics and Plant Breeding",
            "pub_year": 2025,
            "crop_name": "Paddy",
            "trait_code": "TRAIT-DROUGHT-TOL",
            "gene_symbol": "SUB1A",
            "findings": "Introgressed SUB1A locus provides up to 14 days complete submergence tolerance without yield penalty.",
            "limitations": "Trial restricted to lowland alluvial soils in Cauvery basin.",
            "evidence_level": "RESEARCH",
            "citation_url": "https://doi.org/10.1007/s10681-025-00123-x",
            "created_at": datetime.utcnow().isoformat()
        }
        self._research_records[r1["record_code"]] = r1

    def add_research_record(self, record_data: Dict[str, Any]) -> Dict[str, Any]:
        rcode = record_data.get("record_code", f"PUB-{uuid.uuid4().hex[:8].upper()}")
        record = {
            "id": str(uuid.uuid4()),
            "record_code": rcode,
            "title": record_data["title"],
            "authors": record_data.get("authors", "ICAR Research Team"),
            "publication": record_data.get("publication", "Agricultural Research Journal"),
            "pub_year": record_data.get("pub_year", 2025),
            "crop_name": record_data.get("crop_name", "Paddy"),
            "trait_code": record_data.get("trait_code", "TRAIT-YIELD-POTENTIAL"),
            "gene_symbol": record_data.get("gene_symbol"),
            "findings": record_data["findings"],
            "limitations": record_data.get("limitations", "Subject to regional field validation."),
            "evidence_level": record_data.get("evidence_level", "RESEARCH"),
            "citation_url": record_data.get("citation_url", "https://icar.gov.in/research/paper"),
            "created_at": datetime.utcnow().isoformat()
        }
        self._research_records[rcode] = record
        return record

    def list_research_records(self, crop: Optional[str] = None) -> List[Dict[str, Any]]:
        if crop:
            return [r for r in self._research_records.values() if r.get("crop_name", "").lower() == crop.lower()]
        return list(self._research_records.values())

    def submit_expert_review(self, review_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        BioReviewQueue action: APPROVE, REJECT, REQUEST_MORE_EVIDENCE, LIMIT_SCOPE
        Reviewer roles: agronomist, plant_breeder, soil_scientist, plant_pathologist, entomologist, biotechnologist
        """
        review_id = review_data.get("review_id", f"REV-{uuid.uuid4().hex[:8].upper()}")
        action = review_data["action"] # APPROVE, REJECT, REQUEST_MORE_EVIDENCE, LIMIT_SCOPE
        allowed_actions = ["APPROVE", "REJECT", "REQUEST_MORE_EVIDENCE", "LIMIT_SCOPE"]
        if action not in allowed_actions:
            action = "REQUEST_MORE_EVIDENCE"

        record = {
            "id": str(uuid.uuid4()),
            "review_id": review_id,
            "target_type": review_data["target_type"], # VARIETY, BIO_PRODUCT, SCIENTIFIC_CLAIM, RECOMMENDATION
            "target_code": review_data["target_code"],
            "reviewer_role": review_data["reviewer_role"],
            "reviewer_name": review_data["reviewer_name"],
            "action": action,
            "comments": review_data.get("comments", "Review conducted according to scientific standards."),
            "reviewed_at": datetime.utcnow().isoformat()
        }
        self._review_queue[review_id] = record
        return record

    def list_expert_reviews(self, target_code: Optional[str] = None) -> List[Dict[str, Any]]:
        if target_code:
            return [rev for rev in self._review_queue.values() if rev["target_code"] == target_code]
        return list(self._review_queue.values())

    def run_stage20_variety_simulation(self, variety_a_code: str, variety_b_code: str, stress_scenario: str = "DROUGHT_INCREASE_20PCT") -> Dict[str, Any]:
        """
        Stage 20 Digital Twin variety counterfactual simulation.
        Outputs MUST explicitly carry SIMULATED evidence status.
        """
        return {
            "simulation_code": f"SIM-{uuid.uuid4().hex[:8].upper()}",
            "evidence_status": "SIMULATED", # ALWAYS SIMULATED
            "scenario": stress_scenario,
            "comparison": {
                "variety_a": {
                    "code": variety_a_code,
                    "simulated_yield_kg_per_acre": 1950.0,
                    "yield_drop_pct": 8.5
                },
                "variety_b": {
                    "code": variety_b_code,
                    "simulated_yield_kg_per_acre": 1620.0,
                    "yield_drop_pct": 21.0
                }
            },
            "insight": f"Under {stress_scenario}, {variety_a_code} demonstrates higher simulated resilience than {variety_b_code}.",
            "disclaimer": "SIMULATION ONLY. Simulated outputs must not be used as commercial guarantees or observed field trial results.",
            "simulated_at": datetime.utcnow().isoformat()
        }

    def get_trust_card(self, entity_code: str) -> Dict[str, Any]:
        """
        Stage 22 AI Trust & Assurance card for biological models and scientific evidence.
        """
        return {
            "entity_code": entity_code,
            "model_card": {
                "model_name": "BioVarietyClimateMatcher-v1",
                "intended_use": "Agricultural variety suitability decision support",
                "training_data_sources": ["ICAR Trial Reports 2020-2025", "TNAU Package of Practices"],
                "limitations": "Not calibrated for saline coastal soils without field verification."
            },
            "dataset_card": {
                "dataset_name": "National Seed Variety Registry",
                "provenance": "State Seed Agencies & ICAR Accession Catalog",
                "governance_tier": "PUBLIC_COMMONS"
            },
            "evidence_card": {
                "evidence_status": "VERIFIED_RESEARCH",
                "peer_review_status": "APPROVED",
                "risk_level": "LOW_DECISION_SUPPORT"
            },
            "generated_at": datetime.utcnow().isoformat()
        }
