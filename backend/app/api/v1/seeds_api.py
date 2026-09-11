from fastapi import APIRouter, HTTPException, Query
from typing import Dict, Any, List, Optional
from backend.app.services.seed_registry_service import SeedRegistryService
from backend.app.services.seed_authenticity_counterfeit_service import SeedAuthenticityCounterfeitService
from backend.app.services.climate_seed_recommender_service import ClimateSeedRecommenderService
from backend.app.services.bio_input_efficacy_service import BioInputEfficacyService
from backend.app.schemas.seed_variety import VarietyProfileCreate, VarietyRecommendationRequest, SeedBatchCreate, SeedTestCreate
from backend.app.schemas.bio_input import SeedAuthenticityLookup

router = APIRouter(prefix="", tags=["Seed Intelligence & Authenticity"])

seed_service = SeedRegistryService()
authenticity_service = SeedAuthenticityCounterfeitService(seed_service)
bio_service = BioInputEfficacyService()
recommender_service = ClimateSeedRecommenderService(seed_service, bio_service)


@router.get("/seeds/")
@router.get("/seeds")
@router.get("/seed/varieties/")
@router.get("/seed/varieties")
def list_varieties(crop: Optional[str] = Query(None)):
    return seed_service.list_varieties(crop=crop)


@router.get("/seed/varieties/{variety_code}")
def get_variety_profile(variety_code: str):
    profile = seed_service.get_variety_profile(variety_code)
    if not profile:
        raise HTTPException(status_code=404, detail="Seed variety code not found.")
    return profile


@router.post("/seed/varieties/")
@router.post("/seed/varieties")
def register_variety(payload: VarietyProfileCreate):
    return seed_service.register_variety(payload.model_dump())


@router.post("/seed/batches/")
@router.post("/seed/batches")
def register_batch(payload: SeedBatchCreate):
    return seed_service.register_seed_batch(payload.model_dump())


@router.post("/seed/quality/")
@router.post("/seed/quality")
def record_seed_test(payload: SeedTestCreate):
    return seed_service.record_seed_test(payload.model_dump())


@router.get("/seed/provenance/{batch_number}")
def get_seed_provenance(batch_number: str):
    return seed_service.get_batch_provenance(batch_number)


@router.post("/seed/authenticity/")
@router.post("/seed/authenticity")
def verify_seed_authenticity(payload: SeedAuthenticityLookup):
    return authenticity_service.verify_seed_qr(
        batch_number=payload.batch_number,
        qr_hash=payload.scanned_qr_hash,
        scan_location=payload.scanner_location or "Thanjavur Retailer"
    )


@router.get("/seed/authenticity/flags")
def list_authenticity_flags():
    return authenticity_service.list_authenticity_flags()


@router.post("/seed/recommendations/")
@router.post("/seed/recommendations")
def get_variety_recommendations(req: VarietyRecommendationRequest):
    return recommender_service.recommend_varieties(req.model_dump())
