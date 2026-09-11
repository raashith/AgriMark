import pytest
from backend.app.services.farm_economics_service import FarmEconomicsService
from backend.app.services.baseline_intervention_service import BaselineInterventionService
from backend.app.services.ai_impact_calculator import AIImpactCalculator
from backend.app.services.counterfactual_evaluation_service import CounterfactualEvaluationService
from backend.app.services.evidence_attribution_service import EvidenceAttributionService
from backend.app.services.stakeholder_economics_service import StakeholderEconomicsService
from backend.app.services.model_economic_link_service import ModelEconomicLinkService
from backend.app.services.fairness_fraud_control_service import FairnessFraudControlService
from backend.app.services.farmer_roi_card_service import FarmerROICardService
from backend.app.agents.outcome_agents import FarmerEconomicsAgent, ROIAgent, ImpactEvaluationAgent


def test_farm_economics_service_calculation():
    service = FarmEconomicsService()
    profile = service.calculate_and_save_profile("farmer-001", "farm-101", "Kharif 2026", 125000.0, 65000.0)
    assert profile["net_farm_income_inr"] == 60000.0
    assert profile["profit_margin_pct"] == 48.0
    assert profile["derived_metrics"]["income_per_acre"] == 24000.0


def test_baseline_and_intervention_decision_journey():
    service = BaselineInterventionService()
    base = service.record_baseline("farmer-002", "TOMATO", 10.0, 45000.0)
    assert base["baseline_yield_per_acre"] == 10.0

    intv = service.record_intervention({
        "farmer_ref": "farmer-002",
        "intervention_type": "PEST_WARNING",
        "recommendation": "Spray neem oil for early blight",
        "action_taken": "YES"
    })
    assert intv["decision_journey"]["accepted"] is True


def test_ai_impact_calculator_roi_safety():
    # Normal calculation
    res1 = AIImpactCalculator.calculate_farmer_roi(62500.0, 45000.0, input_savings=4500.0, avoided_losses=6000.0, service_cost=500.0)
    assert res1["additional_income_inr"] == 17500.0
    assert res1["net_benefit_inr"] == 27500.0
    assert res1["roi_ratio"] == 55.0

    # Zero service cost safety (free platform)
    res2 = AIImpactCalculator.calculate_farmer_roi(62500.0, 45000.0, service_cost=0.0)
    assert res2["service_cost_inr"] == 0.0
    assert res2["roi_label"] == "FREE_SERVICE_NET_GAIN"


def test_counterfactual_evaluation_diff_in_diff():
    service = CounterfactualEvaluationService()

    # Valid Diff-in-Diff
    did = service.evaluate_difference_in_differences(45000.0, 62500.0, 44000.0, 45000.0, 50, 50)
    assert did["estimated_causal_effect_inr"] == 16500.0
    assert did["causal_claim_valid"] is True

    # Validate causal claim rejection without control group
    val = service.validate_causal_claim(17500.0, has_control_group=False, method="BEFORE_AFTER")
    assert val["causal_claim_valid"] is False
    assert val["allowed_evidence_status"] == "ESTIMATED"


def test_evidence_attribution_and_promotion_rules():
    service = EvidenceAttributionService()

    # Record evidence
    evd = service.record_evidence("NET_INCOME", 17500.0, "OBSERVED", "Weighbridge Receipt")
    assert evd["evidence_status"] == "OBSERVED"

    # Test illegal status promotion: SIMULATED cannot become OBSERVED automatically
    promo = service.promote_evidence_status("SIMULATED", "OBSERVED")
    assert promo["promotion_allowed"] is False
    assert "Safety Rule" in promo["reason"]

    # Test multi-factor attribution
    attr = service.attribute_impact_drivers(17500.0, {"ai_recommendation": 10000.0, "market_surge": 5000.0, "input_savings": 2500.0})
    assert attr["primary_driver"] == "ai_recommendation"
    assert attr["drivers_breakdown"]["ai_recommendation"]["percentage_share"] == 57.14


def test_stakeholder_economics():
    service = StakeholderEconomicsService()

    # FPO outcomes
    fpo = service.calculate_fpo_aggregation_outcomes("FPO-01", 100, 1000.0, 20.0, 24.0)
    assert fpo["price_gain_per_quintal"] == 4.0
    assert fpo["total_member_gain_inr"] == 4000.0

    # Buyer outcomes
    buyer = service.calculate_buyer_procurement_outcomes("buyer-100", 30.0, 26.0, 100.0)
    assert buyer["total_procurement_savings_inr"] == 400.0

    # Post-harvest loss
    ph = service.calculate_post_harvest_loss_outcomes(5000.0, 250.0, 20.0)
    assert ph["post_harvest_loss_rate_pct"] == 5.0
    assert ph["loss_value_inr"] == 5000.0


def test_model_economic_link_and_champion_selection():
    service = ModelEconomicLinkService()
    models = service.list_model_outcomes()
    assert len(models) >= 2

    # Select Economic Champion
    champ = service.select_economic_champion_model(models)
    assert champ["selected_champion_code"] == "MOD_CROP_YIELD_TN"
    assert champ["selection_criterion"] == "HIGHEST_VERIFIED_FARMER_ECONOMIC_BENEFIT"


def test_fairness_and_fraud_control():
    service = FairnessFraudControlService()

    # Disparity evaluation
    fair = service.evaluate_smallholder_fairness_disparity([14000.0, 15000.0], [18000.0, 19000.0])
    assert fair["is_equitable"] is True

    # Anomaly detection (impossible yield)
    anom = service.detect_outcome_anomalies("farmer-999", reported_yield_per_acre=50.0, reported_price_per_kg=25.0)
    assert anom["status"] == "FLAGGED_FOR_HUMAN_REVIEW"
    assert "IMPOSSIBLE_YIELD" in anom["anomalies"][0]


def test_farmer_roi_cards():
    service = FarmerROICardService()
    card = service.generate_farmer_roi_card("farmer-001")
    assert card["card_type"] == "FARMER_ROI_CARD"
    assert card["evidence_badge"] == "VERIFIED_OBSERVED"

    nat = service.generate_national_impact_card()
    assert nat["double_counting_prevented"] is True


def test_specialist_outcome_ai_agents():
    econ_agent = FarmerEconomicsAgent()
    res_e = econ_agent.run("Analyze farm profit margin")
    assert res_e["can_fabricate_outcomes"] is False

    eval_agent = ImpactEvaluationAgent()
    res_i = eval_agent.run("Evaluate causal effect")
    assert res_i["can_claim_causality_without_control"] is False
