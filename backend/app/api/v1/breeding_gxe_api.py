from fastapi import APIRouter, HTTPException, Query
from typing import Dict, Any, List, Optional
from backend.app.services.germplasm_trait_service import GermplasmTraitService
from backend.app.services.gxe_breeding_service import GxEBreedingService
from backend.app.services.precision_phenotyping_service import PrecisionPhenotypingService

router = APIRouter(prefix="", tags=["Germplasm, Traits, Genetics & Breeding"])

trait_service = GermplasmTraitService()
gxe_service = GxEBreedingService()
phenotyping_service = PrecisionPhenotypingService()


@router.get("/germplasm/")
@router.get("/germplasm")
def list_germplasm():
    return trait_service.list_accessions()


@router.post("/germplasm/")
@router.post("/germplasm")
def register_germplasm(accession_data: Dict[str, Any]):
    return trait_service.register_accession(accession_data)


@router.get("/traits/")
@router.get("/traits")
def list_traits(category: Optional[str] = Query(None)):
    return trait_service.list_traits(category=category)


@router.get("/traits/search")
def search_traits(q: str = Query(...)):
    return trait_service.search_trait_by_alias(q)


@router.post("/genetics/")
@router.post("/genetics")
def record_genotype(genotype_data: Dict[str, Any], user_role: str = Query("researcher")):
    return gxe_service.add_genotype_record(genotype_data, user_role=user_role)


@router.post("/phenotyping/")
@router.post("/phenotyping")
def analyze_phenotype(phenotype_data: Dict[str, Any]):
    return phenotyping_service.analyze_multimodal_phenotype(phenotype_data)


@router.get("/breeding/")
@router.get("/breeding")
def list_breeding_trials(program_code: Optional[str] = Query(None)):
    return gxe_service.list_trials(program_code=program_code)


@router.post("/breeding/")
@router.post("/breeding")
def create_breeding_program(program_data: Dict[str, Any]):
    return gxe_service.create_breeding_program(program_data)


@router.post("/breeding/trials")
def create_breeding_trial(trial_data: Dict[str, Any]):
    return gxe_service.create_breeding_trial(trial_data)


@router.post("/gxe/")
@router.post("/gxe")
def run_gxe_analysis(variety_code: str, environment_code: str, season: str = "Kharif", soil_type: str = "Alluvial", weather_regime: str = "NORMAL"):
    return gxe_service.run_gxe_analysis(variety_code, environment_code, season, soil_type, weather_regime)
