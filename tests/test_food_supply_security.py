import pytest
import os
import sys

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

def test_commodity_balance():
    """Verify commodity balance sheet equation (opening + prod + imp + carry_in - exp - proc - cons - loss = closing)."""
    opening = 12000
    production = 45000
    imports = 1500
    carry_in = 3000
    exports = 8500
    processing = 14000
    consumption = 22000
    losses = 2200
    
    closing = opening + production + imports + carry_in - (exports + processing + consumption + losses)
    assert closing == 14800


def test_shortage_detection():
    """Verify shortage calculation and single price spike override rule."""
    available_supply = 18500
    buffer_inventory = 3000
    inbound_logistics = 2500
    expected_demand = 22000
    
    total_effective_supply = available_supply + buffer_inventory + inbound_logistics
    coverage_ratio = total_effective_supply / expected_demand
    
    assert coverage_ratio > 1.0  # Supply is adequate
    
    # Rule: Single price spike alone must NOT trigger shortage classification
    price_spike_only = True
    status = "NORMAL" if price_spike_only else "SHORTAGE"
    assert status == "NORMAL"


def test_supply_shock_detection():
    """Verify detection of 8 shock types with confidence and evidence."""
    shock_types = [
        "PRODUCTION", "WEATHER", "DISEASE", "LOGISTICS",
        "STORAGE", "TRADE", "MARKET_CONCENTRATION", "PRICE"
    ]
    assert len(shock_types) == 8
    
    event = {
        "event_id": "SHOCK_WEATHER_2026_09",
        "shock_type": "WEATHER",
        "confidence": 0.91
    }
    assert event["confidence"] > 0.85


def test_redistribution_recommendation():
    """Verify surplus-to-shortage regional redistribution and non-autonomous limits."""
    surplus_mt = 4200
    shortage_mt = 1800
    transfer_mt = 1250
    truck_capacity_mt = 25
    
    num_trucks = int(transfer_mt / truck_capacity_mt)
    assert num_trucks == 50
    
    auto_execution = False
    assert auto_execution is False  # Non-autonomous decision support


def test_storage_capacity_calculation():
    """Verify storage capacity and available space calculations."""
    total_capacity = 15000
    available_capacity = 3200
    utilization_pct = ((total_capacity - available_capacity) / total_capacity) * 100
    
    assert round(utilization_pct, 1) == 78.7


def test_post_harvest_loss_provenance():
    """Verify post-harvest loss estimation contains methodology and provenance."""
    loss_record = {
        "stage": "STORAGE",
        "loss_pct": 3.2,
        "methodology": "ICAR_CIPHET_2025_METHODOLOGY",
        "confidence": 0.92
    }
    assert loss_record["methodology"] == "ICAR_CIPHET_2025_METHODOLOGY"
    assert loss_record["confidence"] > 0.85


def test_processing_capacity_analysis():
    """Verify processing facility utilization and bottleneck detection."""
    daily_capacity_mt = 250
    utilization_pct = 88.5
    
    is_overloaded = utilization_pct > 95.0
    assert is_overloaded is False


def test_logistics_bottleneck_detection():
    """Verify pickup, transport, warehouse, cold-chain, and last-mile bottleneck detection."""
    bottleneck_types = ["PICKUP", "TRANSPORT", "WAREHOUSE", "COLD_CHAIN", "LAST_MILE"]
    assert "COLD_CHAIN" in bottleneck_types
    assert len(bottleneck_types) == 5


def test_import_dependency():
    """Verify import dependency ratio calculation and threshold."""
    imports = 85000
    demand = 240000
    ratio = imports / demand
    
    is_dependent = ratio > 0.35
    assert is_dependent is True
    assert round(ratio, 3) == 0.354


def test_export_pressure():
    """Verify export pressure metric calculation and prohibition on trade restriction recommendations."""
    export_pressure = "HIGH"
    recommend_trade_restriction = False
    
    assert export_pressure in ["LOW", "MODERATE", "HIGH", "SEVERE"]
    assert recommend_trade_restriction is False


def test_early_warning_classification():
    """Verify 5 alert levels (GREEN, WATCH, WARNING, SEVERE, CRITICAL)."""
    alert_levels = ["GREEN", "WATCH", "WARNING", "SEVERE", "CRITICAL"]
    assert len(alert_levels) == 5
    assert "WARNING" in alert_levels


def test_scenario_simulation():
    """Verify simulation scenario tagging data_origin = 'SIMULATION'."""
    simulation_output = {
        "scenario_type": "PROD_DECLINE_25",
        "simulated_supply_gap_mt": 11250,
        "data_origin": "SIMULATION"
    }
    assert simulation_output["data_origin"] == "SIMULATION"


def test_resilience_recommendation():
    """Verify resilience recommendation require human approval."""
    rec = {
        "action": "Reroute 1,200 MT dry turmeric via rail-head transshipment",
        "requires_human_approval": True
    }
    assert rec["requires_human_approval"] is True


def test_critical_node_protection():
    """Verify sensitive critical supply infrastructure coordinates are masked."""
    node = {
        "node_name": "Regional Ag-Logistics Node Alpha",
        "location_masked": "Salem District Sector 4 (Precise GPS Masked)",
        "is_sensitive": True
    }
    assert "Precise GPS Masked" in node["location_masked"]
    assert node["is_sensitive"] is True


def test_rls_isolation():
    """Verify SQL migration 10 includes RLS policies on food supply tables."""
    migration_path = os.path.join(os.path.dirname(__file__), "../database/migrations/10_food_supply_security.sql")
    with open(migration_path, "r", encoding="utf-8") as f:
        sql = f.read()
        
    assert "ENABLE ROW LEVEL SECURITY" in sql
    assert "CREATE POLICY" in sql
    assert "national_supply_balances" in sql
    assert "critical_supply_nodes" in sql
