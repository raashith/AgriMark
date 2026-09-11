import uuid
from typing import Dict, Any, List, Optional
from datetime import datetime


class GxEBreedingService:
    """
    Service for provider-neutral Genotype x Environment (GxE) analysis and governed Breeding Experiment lifecycle.
    """

    def __init__(self):
        self._gxe_analyses: Dict[str, Dict[str, Any]] = {}
        self._breeding_programs: Dict[str, Dict[str, Any]] = {}
        self._trials: Dict[str, Dict[str, Any]] = {}
        self._candidates: Dict[str, Dict[str, Any]] = {}
        self._genotype_records: Dict[str, Dict[str, Any]] = {}

    def add_genotype_record(self, record_data: Dict[str, Any], user_role: str = "researcher") -> Dict[str, Any]:
        """
        Registers genotype metadata. Enforces governed access tier on actual genomic datasets.
        """
        sample_code = record_data.get("sample_code", f"GENO-{uuid.uuid4().hex[:8].upper()}")
        data_type = record_data.get("marker_data_type", "METADATA_ONLY") # METADATA_ONLY, SUMMARY_STATS, RESEARCH_DATASET, AUTHORIZED_GENOMIC

        if data_type in ["AUTHORIZED_GENOMIC", "RESEARCH_DATASET"] and user_role not in ["authorized_breeder", "bio_administrator"]:
            # Redact full sequence/marker details for unauthorized users
            metadata = {"privacy_note": "Genomic sequence access restricted to authorized researchers."}
        else:
            metadata = record_data.get("genotype_metadata", {})

        record = {
            "id": str(uuid.uuid4()),
            "sample_code": sample_code,
            "variety_code": record_data.get("variety_code"),
            "accession_number": record_data.get("accession_number"),
            "marker_data_type": data_type,
            "access_governance_tier": "RESTRICTED" if data_type == "AUTHORIZED_GENOMIC" else "PUBLIC_METADATA",
            "genotype_metadata": metadata,
            "created_at": datetime.utcnow().isoformat()
        }
        self._genotype_records[sample_code] = record
        return record

    def run_gxe_analysis(self, variety_code: str, environment_code: str, season: str, soil_type: str, weather_regime: str) -> Dict[str, Any]:
        """
        Runs GxE stability & adaptation analysis without deterministic output claims.
        """
        analysis_code = f"GXE-{uuid.uuid4().hex[:8].upper()}"

        # Mock stability computation based on variety and environmental parameters
        base_stability = 0.88 if "Alluvial" in soil_type or "Clay" in soil_type else 0.76
        adaptation_score = 0.91 if season in ["Kharif", "Samba"] else 0.82
        risk_index = round(1.0 - (base_stability * 0.5 + adaptation_score * 0.5), 4)

        performance_dist = {
            "p10_lowest_yield_kg_per_acre": 1600.0,
            "p50_median_yield_kg_per_acre": 2100.0,
            "p90_highest_yield_kg_per_acre": 2450.0,
            "yield_variance": 4500.0,
            "environmental_sensitivity": "MODERATE_RESPONSIVE"
        }

        record = {
            "id": str(uuid.uuid4()),
            "analysis_code": analysis_code,
            "variety_code": variety_code,
            "environment_code": environment_code,
            "season": season,
            "soil_type": soil_type,
            "weather_regime": weather_regime,
            "stability_score": round(base_stability, 4),
            "adaptation_score": round(adaptation_score, 4),
            "risk_index": risk_index,
            "performance_distribution": performance_dist,
            "evidence_level": "TRIAL",
            "deterministic_guarantee": False, # Never deterministic
            "created_at": datetime.utcnow().isoformat()
        }
        self._gxe_analyses[analysis_code] = record
        return record

    def create_breeding_program(self, program_data: Dict[str, Any]) -> Dict[str, Any]:
        pcode = program_data.get("program_code", f"PROG-{uuid.uuid4().hex[:8].upper()}")
        record = {
            "id": str(uuid.uuid4()),
            "program_code": pcode,
            "program_name": program_data["program_name"],
            "crop_name": program_data["crop_name"],
            "target_traits": program_data.get("target_traits", ["Yield", "Submergence Tolerance"]),
            "lead_breeder": program_data.get("lead_breeder", "Dr. A. Swaminathan"),
            "created_at": datetime.utcnow().isoformat()
        }
        self._breeding_programs[pcode] = record
        return record

    def create_breeding_trial(self, trial_data: Dict[str, Any]) -> Dict[str, Any]:
        tcode = trial_data.get("trial_code", f"TRIAL-{uuid.uuid4().hex[:8].upper()}")
        stage = trial_data.get("lifecycle_stage", "DESIGN")

        allowed_stages = ["DESIGN", "CROSS", "TEST", "PHENOTYPE", "ANALYZE", "SELECT", "VALIDATE"]
        if stage not in allowed_stages:
            stage = "DESIGN"

        record = {
            "id": str(uuid.uuid4()),
            "trial_code": tcode,
            "program_code": trial_data["program_code"],
            "location": trial_data["location"],
            "lifecycle_stage": stage,
            "autonomous_physical_execution": False, # Always false
            "created_at": datetime.utcnow().isoformat()
        }
        self._trials[tcode] = record
        return record

    def update_trial_stage(self, trial_code: str, new_stage: str) -> Optional[Dict[str, Any]]:
        trial = self._trials.get(trial_code)
        if not trial:
            return None
        allowed_stages = ["DESIGN", "CROSS", "TEST", "PHENOTYPE", "ANALYZE", "SELECT", "VALIDATE"]
        if new_stage in allowed_stages:
            trial["lifecycle_stage"] = new_stage
        return trial

    def list_trials(self, program_code: Optional[str] = None) -> List[Dict[str, Any]]:
        if program_code:
            return [t for t in self._trials.values() if t["program_code"] == program_code]
        return list(self._trials.values())
