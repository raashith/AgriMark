import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.services.logistics_processing_service import LogisticsProcessingService
from backend.app.services.finance_allied_service import FinanceAlliedService
from backend.app.services.trade_climate_resilience_service import TradeClimateResilienceService
from backend.app.services.unified_decision_engine import UnifiedDecisionEngine, DecisionCard
from backend.app.services.provider_health_registry import ProviderHealthRegistry
from backend.app.services.unified_event_bus import UnifiedEventBus
from backend.app.services.inventory_reservation_service import InventoryReservationService
from backend.app.services.voice_assistant_service import VoiceAssistantService
from backend.app.services.ml_prediction_service import MLPredictionService
from backend.app.agents.unified_supervisor import UnifiedSupervisorAgent

client = TestClient(app)


def test_atomic_inventory_reservation_safety():
    service = InventoryReservationService()

    # Request A: 70 kg out of 100 kg
    resA = service.reserve_inventory("LOT-TOMATO-100", 70.0)
    assert resA["success"] is True
    assert resA["allocated_kg"] == 70.0
    assert resA["remaining_available_kg"] == 30.0

    # Request B: Attempt 50 kg when only 30 kg remaining
    resB = service.reserve_inventory("LOT-TOMATO-100", 50.0)
    assert resB["success"] is False
    assert resB["reason"] == "PARTIAL_RESERVATION_GRANTED"
    assert resB["allocated_kg"] == 30.0
    assert resB["remaining_available_kg"] == 0.0

    # Request C: Attempt when 0 kg remaining
    resC = service.reserve_inventory("LOT-TOMATO-100", 10.0)
    assert resC["success"] is False
    assert resC["reason"] == "OUT_OF_STOCK"
    assert resC["remaining_available_kg"] == 0.0


def test_tamil_voice_assistant():
    service = VoiceAssistantService()
    res = service.process_voice_command("தக்காளி சந்தை விலை என்ன?", detected_language="ta-IN")
    assert res["detected_language"] == "ta-IN"
    assert "கோயம்பேடு" in res["speech_output_text"]
    assert res["authorization_bypassed"] is False


def test_ml_prediction_horizon():
    service = MLPredictionService()
    pred = service.predict_commodity_price("Tomato", "Koyambedu", horizon_days=7)
    assert pred["crop_name"] == "Tomato"
    assert pred["predicted_price_inr_per_kg"] > 0.0
    assert "model_version" in pred
    assert pred["evidence_status"] == "PROJECTED"


def test_stage_27_logistics_and_storage():
    service = LogisticsProcessingService()
    facilities = service.list_facilities()
    assert len(facilities) >= 1

    storage_analysis = service.analyze_storage_vs_sell(
        crop_name="Paddy",
        quantity_kg=10000.0,
        current_price=21.50,
        storage_cost_per_kg=0.50,
        expected_appreciation_pct=10.0,
        perishability_days=45
    )
    assert storage_analysis["recommendation"] == "STORE_30_DAYS"
    assert storage_analysis["physical_execution_authorized"] is False


def test_stage_28_finance_and_allied():
    service = FinanceAlliedService()
    credit = service.assess_credit_exposure("FARMER-001", "CROP_FINANCE", 50000.0)
    assert credit["risk_score"] == 15.5
    assert "not a regulated financial institution" in credit["regulatory_financial_disclaimer"]


def test_stage_29_trade_climate_disaster():
    service = TradeClimateResilienceService()
    export_eval = service.evaluate_export_trade("United Arab Emirates", "Non-Basmati Rice", 500.0)
    assert export_eval["landed_cost_usd_per_mt"] == 480.0
    assert export_eval["customs_regulatory_approval_claimed"] is False


def test_stage_30_unified_decision_and_orchestration():
    decision_engine = UnifiedDecisionEngine()
    card = decision_engine.synthesize_decision({"crop_name": "Paddy", "district": "Thanjavur"})
    assert card["evidence_status"] == "VERIFIED_OBSERVED"
    assert card["confidence_score"] == 0.94


def test_stage_27_to_30_api_endpoints():
    res_dec = client.post("/api/v1/unified/decision", json={"crop_name": "Paddy", "district": "Thanjavur"})
    assert res_dec.status_code == 200

    res_inv = client.post("/api/v1/unified/inventory/reserve?lot_code=LOT-TOMATO-100&requested_kg=20.0")
    assert res_inv.status_code == 200

    res_voice = client.post("/api/v1/unified/voice/command?transcript=price&language=en-IN")
    assert res_voice.status_code == 200

    res_ml = client.post("/api/v1/unified/ml/predict?crop_name=Tomato&market_name=Koyambedu&horizon_days=7")
    assert res_ml.status_code == 200
    assert "predicted_price_inr_per_kg" in res_ml.json()
