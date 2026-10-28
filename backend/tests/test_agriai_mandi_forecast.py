from __future__ import annotations

import importlib.util
from pathlib import Path

import pandas as pd
import pytest


MODULE_PATH = Path(__file__).resolve().parents[2] / "scripts" / "data" / "train_mandi_forecast.py"
SPEC = importlib.util.spec_from_file_location("train_mandi_forecast", MODULE_PATH)
assert SPEC and SPEC.loader
forecast = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(forecast)


def _csv(path: Path, *, count: int = 90) -> Path:
    dates = pd.date_range("2026-01-01", periods=count, freq="D", tz="UTC")
    pd.DataFrame({
        "observation_date": list(dates) + [dates[4]],
        "commodity_code": ["PADDY"] * (count + 1),
        "mandi_code": ["M1"] * (count + 1),
        "modal_price": [2200 + i * 2 for i in range(count)] + [2210],
        "source": ["AGMARKNET"] * (count + 1),
    }).to_csv(path, index=False)
    return path


def test_forecast_evaluation_is_chronological_and_not_promoted(tmp_path):
    csv = _csv(tmp_path / "prices.csv")
    args = type("Args", (), {
        "csv": str(csv),
        "commodity": "PADDY",
        "mandi": "M1",
        "horizon": 7,
        "output_dir": str(tmp_path / "out"),
        "dataset_version": "test-v1",
        "source_url": "https://www.data.gov.in/catalog/current-daily-price-various-commodities-various-markets-mandi",
        "minimum_observations": 60,
    })()

    result = forecast.run(args)

    assert result["status"] == "EVALUATED_NOT_PROMOTED"
    assert result["promotion"]["eligible"] is False
    assert result["dataset"]["daily_points_after_same_day_median"] == 90
    assert result["dataset"]["selected_valid_rows_after_drop"] == 91
    assert result["evaluation"]["train_end_date"] < result["evaluation"]["test_start_date"]
    assert result["evaluation"]["test_end_date"] == "2026-03-31"
    assert Path(result["artifacts"]["predictions_csv"]).exists()
    assert Path(result["artifacts"]["evaluation_report_json"]).exists()


def test_forecast_refuses_other_series_and_too_little_history(tmp_path):
    csv = _csv(tmp_path / "prices.csv", count=25)
    args = type("Args", (), {
        "csv": str(csv),
        "commodity": "TOMATO",
        "mandi": "M1",
        "horizon": 7,
        "output_dir": str(tmp_path / "out"),
        "dataset_version": "test-v1",
        "source_url": "https://www.data.gov.in/catalog/current-daily-price-various-commodities-various-markets-mandi",
        "minimum_observations": 20,
    })()

    with pytest.raises(ValueError, match="No records match"):
        forecast.run(args)
