from fastapi import APIRouter, HTTPException, Query
from typing import Dict, Any, List, Optional
from backend.app.services.logistics_processing_service import LogisticsProcessingService
from backend.app.schemas.logistics_processing import StorageVsSellRequest, RouteOptimizationRequest

router = APIRouter(prefix="", tags=["Logistics & Food Processing OS"])

service = LogisticsProcessingService()


@router.get("/logistics/facilities/")
@router.get("/logistics/facilities")
def list_facilities(facility_type: Optional[str] = Query(None)):
    return service.list_facilities(facility_type=facility_type)


@router.post("/logistics/storage-vs-sell/")
@router.post("/logistics/storage-vs-sell")
def analyze_storage_vs_sell(req: StorageVsSellRequest):
    return service.analyze_storage_vs_sell(
        crop_name=req.crop_name,
        quantity_kg=req.quantity_kg,
        current_price=req.current_market_price_inr_per_kg,
        storage_cost_per_kg=req.storage_cost_per_month_inr_per_kg,
        expected_appreciation_pct=req.expected_price_increase_30d_pct,
        perishability_days=req.perishability_days
    )


@router.post("/logistics/route-optimize/")
@router.post("/logistics/route-optimize")
def optimize_route(req: RouteOptimizationRequest):
    return service.optimize_route_and_booking(
        origin=req.origin_collection_centre,
        destination=req.destination_market_or_processor,
        produce_type=req.produce_type,
        quantity_mt=req.quantity_mt
    )
