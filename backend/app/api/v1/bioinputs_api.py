from fastapi import APIRouter, HTTPException, Query
from typing import Dict, Any, List, Optional
from backend.app.services.bio_input_efficacy_service import BioInputEfficacyService
from backend.app.services.climate_seed_recommender_service import ClimateSeedRecommenderService
from backend.app.services.seed_registry_service import SeedRegistryService
from backend.app.schemas.bio_input import BioProductCreate, BioProductEvidenceCreate, SoilBiologyRecordCreate

router = APIRouter(prefix="", tags=["Bio-Inputs & Soil Biology"])

seed_service = SeedRegistryService()
bio_service = BioInputEfficacyService()
recommender_service = ClimateSeedRecommenderService(seed_service, bio_service)


@router.get("/bioinputs/")
@router.get("/bioinputs")
def list_bio_products(product_type: Optional[str] = Query(None)):
    return bio_service.list_bio_products(product_type=product_type)


@router.post("/bioinputs/")
@router.post("/bioinputs")
def register_bio_product(payload: BioProductCreate):
    return bio_service.register_bio_product(payload.model_dump())


@router.get("/bioinputs/evidence/")
@router.get("/bioinputs/evidence")
def get_bio_evidence(product_code: str = Query(...)):
    return bio_service.get_product_evidence(product_code)


@router.post("/bioinputs/evidence/")
@router.post("/bioinputs/evidence")
def record_bio_evidence(payload: BioProductEvidenceCreate):
    return bio_service.record_efficacy_trial(payload.model_dump())


@router.post("/bioinputs/tests/")
@router.post("/bioinputs/tests")
def record_soil_biology(payload: SoilBiologyRecordCreate):
    return bio_service.record_soil_biology(payload.model_dump())


@router.post("/bioinputs/recommendations/")
@router.post("/bioinputs/recommendations")
def get_bio_input_recommendations(request_data: Dict[str, Any]):
    return recommender_service.recommend_bio_inputs(request_data)
