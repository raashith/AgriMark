from fastapi import APIRouter, HTTPException, Query
from typing import Dict, Any, List, Optional
from backend.app.services.unified_decision_engine import UnifiedDecisionEngine
from backend.app.agents.unified_supervisor import UnifiedSupervisorAgent
from backend.app.services.provider_health_registry import ProviderHealthRegistry
from backend.app.services.unified_event_bus import UnifiedEventBus
from backend.app.services.inventory_reservation_service import InventoryReservationService
from backend.app.services.voice_assistant_service import VoiceAssistantService
from backend.app.services.ml_prediction_service import MLPredictionService

router = APIRouter(prefix="", tags=["AgriMark Unified National Agricultural OS"])

decision_engine = UnifiedDecisionEngine()
supervisor_agent = UnifiedSupervisorAgent()
health_registry = ProviderHealthRegistry()
event_bus = UnifiedEventBus()
inventory_service = InventoryReservationService()
voice_service = VoiceAssistantService()
ml_service = MLPredictionService()


@router.post("/unified/decision/")
@router.post("/unified/decision")
def synthesize_decision(context: Dict[str, Any]):
    return decision_engine.synthesize_decision(context)


@router.post("/unified/agent-orchestrate/")
@router.post("/unified/agent-orchestrate")
def orchestrate_agent_query(query: str = Query(...)):
    return supervisor_agent.orchestrate_user_query(query)


@router.get("/unified/providers/")
@router.get("/unified/providers")
def list_providers():
    return health_registry.list_providers()


@router.get("/unified/events/")
@router.get("/unified/events")
def list_events(event_type: Optional[str] = Query(None)):
    return event_bus.replay_events(event_type=event_type)


@router.post("/unified/events/")
@router.post("/unified/events")
def publish_event(event_type: str = Query(...), reference_id: str = Query("REF-001")):
    return event_bus.publish_event(event_type=event_type, payload={"reference_id": reference_id})


@router.post("/unified/inventory/reserve")
def reserve_inventory(lot_code: str = Query("LOT-TOMATO-100"), requested_kg: float = Query(...)):
    return inventory_service.reserve_inventory(lot_code, requested_kg)


@router.post("/unified/voice/command")
def process_voice_command(transcript: str = Query(...), language: str = Query("ta-IN")):
    return voice_service.process_voice_command(transcript, language)


@router.post("/unified/ml/predict")
def predict_commodity_price(crop_name: str = Query("Tomato"), market_name: str = Query("Koyambedu"), horizon_days: int = Query(7)):
    return ml_service.predict_commodity_price(crop_name, market_name, horizon_days)
