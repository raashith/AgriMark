from fastapi import APIRouter
from typing import Dict, Any, List
from backend.app.services.synthetic_data_generator import SyntheticDataGenerator
from backend.app.services.model_api_marketplace_service import ModelApiMarketplaceService
from backend.app.schemas.innovation_sandbox import SyntheticDataRequest

router = APIRouter(prefix="/innovation/marketplace", tags=["Innovation Marketplaces"])

synthetic_gen = SyntheticDataGenerator()
marketplace_service = ModelApiMarketplaceService()

@router.post("/synthetic")
def generate_synthetic_dataset(req: SyntheticDataRequest):
    return synthetic_gen.generate_synthetic_dataset(
        domain=req.domain,
        count=req.count,
        crop_name=req.crop_name or "TOMATO",
        district=req.district or "Salem"
    )

@router.get("/models")
def list_models():
    return marketplace_service.list_models()

@router.get("/apis")
def list_apis():
    return marketplace_service.list_apis()
