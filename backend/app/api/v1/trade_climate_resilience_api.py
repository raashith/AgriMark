from fastapi import APIRouter, HTTPException, Query
from typing import Dict, Any, List, Optional
from backend.app.services.trade_climate_resilience_service import TradeClimateResilienceService
from backend.app.schemas.trade_climate_resilience import TradeCorridorQuery, CircularFlowCreate, ClimateRiskEvaluationRequest

router = APIRouter(prefix="", tags=["Global Trade, Circular Economy & Climate Resilience OS"])

service = TradeClimateResilienceService()


@router.post("/trade/export-eval/")
@router.post("/trade/export-eval")
def evaluate_export_trade(req: TradeCorridorQuery):
    return service.evaluate_export_trade(
        destination=req.destination_country,
        commodity=req.commodity,
        quantity_mt=req.quantity_mt
    )


@router.post("/circular/flows/")
@router.post("/circular/flows")
def record_circular_flow(payload: CircularFlowCreate):
    return service.record_circular_waste_flow(
        waste_source_type=payload.waste_source_type,
        quantity_mt=payload.quantity_mt,
        destination_product=payload.destination_product,
        processor_name=payload.processor_name
    )


@router.post("/climate/risk-eval/")
@router.post("/climate/risk-eval")
def evaluate_climate_risk(req: ClimateRiskEvaluationRequest):
    return service.evaluate_climate_risk(
        district=req.district,
        hazard_type=req.hazard_type,
        forecast_horizon_days=req.forecast_horizon_days
    )


@router.post("/disaster/event/")
@router.post("/disaster/event")
def trigger_disaster_event(hazard_type: str = Query("DROUGHT"), district: str = Query("Thanjavur"), stage: str = Query("ALERT")):
    return service.trigger_disaster_mode_lifecycle(
        hazard_type=hazard_type,
        district=district,
        stage=stage
    )
