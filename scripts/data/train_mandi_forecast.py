"""Train and evaluate a baseline AgriAI mandi-price forecast from canonical AGMARKNET CSV.

Expected CSV columns:
  observation_date, commodity_code, mandi_code, modal_price
Optional:
  state_code, district_code, source, source_record_id

This baseline intentionally supports one commodity/mandi series per run. It:
- filters one series,
- validates and sorts dates/prices,
- collapses duplicate date observations using median,
- evaluates with a time-ordered holdout,
- compares a last-observation forecast baseline with an expanding-window Ridge model,
- writes metrics and predictions with source/dataset metadata.

It does NOT fetch credentials, connect to production, deploy a model, or write to Supabase.
Do not promote a model from the output of this script without broader rolling-origin evaluation.
"""
from __future__ import annotations

import argparse
import json
import math
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd
from sklearn.linear_model import Ridge
from sklearn.metrics import mean_absolute_error, mean_squared_error
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler


REQUIRED = {"observation_date", "commodity_code", "mandi_code", "modal_price"}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--csv", required=True, help="Exported observations CSV; never pass API secrets.")
    parser.add_argument("--commodity", required=True, help="Exact canonical commodity_code.")
    parser.add_argument("--mandi", required=True, help="Exact canonical mandi_code.")
    parser.add_argument("--horizon", type=int, default=7, help="Number of daily points in chronological holdout (default 7).")
    parser.add_argument("--output-dir", default="artifacts/agriai/mandi-forecast", help="Directory for report and predictions.")
    parser.add_argument("--dataset-version", default="unversioned", help="Human-readable input dataset version.")
    parser.add_argument("--source-url", default="https://www.data.gov.in/catalog/current-daily-price-various-commodities-various-markets-mandi")
    parser.add_argument("--minimum-observations", type=int, default=60, help="Require enough daily samples before evaluating.")
    return parser.parse_args()


def _mape_safe(y_true: np.ndarray, y_pred: np.ndarray) -> float | None:
    positive = np.abs(y_true) > 1e-9
    if not positive.any():
        return None
    return float(np.mean(np.abs((y_true[positive] - y_pred[positive]) / y_true[positive])) * 100)


def _metrics(y_true: np.ndarray, y_pred: np.ndarray) -> dict[str, float | None]:
    return {
        "mae": float(mean_absolute_error(y_true, y_pred)),
        "rmse": float(math.sqrt(mean_squared_error(y_true, y_pred))),
        "mape_pct_nonzero": _mape_safe(y_true, y_pred),
    }


def _features(series: pd.Series, target_positions: list[int]) -> pd.DataFrame:
    """Create lag/trend/calendar features using only observations before each target."""
    rows: list[dict[str, float]] = []
    for pos in target_positions:
        history = series.iloc[:pos]
        if len(history) < 14:
            raise ValueError("Each evaluated target requires at least 14 prior observations.")
        target_date = series.index[pos]
        values = history.to_numpy(dtype=float)
        rows.append({
            "lag_1": float(values[-1]),
            "lag_2": float(values[-2]),
            "lag_7": float(values[-7]),
            "lag_14": float(values[-14]),
            "mean_7": float(np.mean(values[-7:])),
            "mean_14": float(np.mean(values[-14:])),
            "std_7": float(np.std(values[-7:])),
            "weekday": float(target_date.dayofweek),
            "day_of_year": float(target_date.dayofyear),
        })
    return pd.DataFrame(rows)


def run(args: argparse.Namespace) -> dict[str, Any]:
    csv_path = Path(args.csv)
    frame = pd.read_csv(csv_path)
    missing = REQUIRED.difference(frame.columns)
    if missing:
        raise ValueError(f"CSV is missing required columns: {', '.join(sorted(missing))}")
    if args.horizon < 1:
        raise ValueError("--horizon must be >= 1")

    selected = frame.loc[
        (frame["commodity_code"].astype(str) == args.commodity)
        & (frame["mandi_code"].astype(str) == args.mandi)
    ].copy()
    if selected.empty:
        raise ValueError("No records match the exact commodity and mandi filters; refusing to train on another series.")

    selected["observation_date"] = pd.to_datetime(selected["observation_date"], errors="coerce", utc=True)
    selected["modal_price"] = pd.to_numeric(selected["modal_price"], errors="coerce")
    invalid = selected["observation_date"].isna() | selected["modal_price"].isna() | (selected["modal_price"] <= 0)
    invalid_count = int(invalid.sum())
    selected = selected.loc[~invalid].copy()
    clean_row_count = int(len(selected))
    if selected.empty:
        raise ValueError("No valid positive price observations remain after validation.")

    # Same-day duplicates are aggregated, not silently treated as independent daily points.
    daily = (
        selected.assign(observation_date=selected["observation_date"].dt.floor("D"))
        .groupby("observation_date")["modal_price"].median()
        .sort_index()
    )
    if daily.index.has_duplicates:
        raise AssertionError("Daily aggregation failed to eliminate duplicate dates.")
    if len(daily) < max(args.minimum_observations, args.horizon + 30):
        raise ValueError(
            f"Only {len(daily)} valid daily points remain; need at least "
            f"{max(args.minimum_observations, args.horizon + 30)}. No model report produced."
        )
    if not daily.index.is_monotonic_increasing:
        raise ValueError("Time series is not chronological.")

    split = len(daily) - args.horizon
    if split < 30:
        raise ValueError("Not enough history before holdout.")
    test_positions = list(range(split, len(daily)))
    y_test = daily.iloc[split:].to_numpy(dtype=float)

    # Baseline: carry the last observed value forward. No future records are used.
    baseline = np.repeat(float(daily.iloc[split - 1]), len(test_positions))

    # One-step expanding-window backtest: each prediction sees history only up to t-1.
    model_predictions: list[float] = []
    for pos in test_positions:
        x_train = _features(daily, list(range(14, pos)))
        y_train = daily.iloc[14:pos].to_numpy(dtype=float)
        x_target = _features(daily, [pos])
        model = make_pipeline(StandardScaler(), Ridge(alpha=1.0))
        model.fit(x_train, y_train)
        model_predictions.append(float(model.predict(x_target)[0]))
    model_pred = np.asarray(model_predictions, dtype=float)

    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    predictions = pd.DataFrame({
        "observation_date": [d.isoformat() for d in daily.index[split:]],
        "actual_modal_price": y_test,
        "last_observation_baseline": baseline,
        "ridge_lag_model": model_pred,
        "commodity_code": args.commodity,
        "mandi_code": args.mandi,
        "unit": "INR_PER_QUINTAL_ASSUMED_FROM_AGMARKNET_SCHEMA",
    })
    predictions_path = output_dir / "holdout_predictions.csv"
    predictions.to_csv(predictions_path, index=False)

    baseline_metrics = _metrics(y_test, baseline)
    model_metrics = _metrics(y_test, model_pred)
    # Conservative promotion gate: report only. No deployment is performed here.
    beats_baseline = model_metrics["mae"] is not None and baseline_metrics["mae"] > 0 and (
        float(model_metrics["mae"]) < float(baseline_metrics["mae"])
    )
    report: dict[str, Any] = {
        "task": "mandi_modal_price_time_series_baseline",
        "status": "EVALUATED_NOT_PROMOTED",
        "dataset": {
            "path": str(csv_path),
            "version": args.dataset_version,
            "source_url": args.source_url,
            "source_note": "Validate source license, provenance, data units and export timestamp before training or redistribution.",
            "selected_valid_rows_after_drop": clean_row_count,
            "invalid_rows_dropped": invalid_count,
            "daily_points_after_same_day_median": int(len(daily)),
            "first_date": daily.index.min().date().isoformat(),
            "last_date": daily.index.max().date().isoformat(),
            "duplicate_date_policy": "median_by_observation_date",
            "missing_calendar_days": int(len(pd.date_range(daily.index.min(), daily.index.max(), freq="D", tz="UTC").difference(daily.index))),
        },
        "series": {"commodity_code": args.commodity, "mandi_code": args.mandi, "horizon_days": args.horizon},
        "evaluation": {
            "method": "chronological_holdout; expanding-window one-step predictions",
            "train_end_date": daily.index[split - 1].date().isoformat(),
            "test_start_date": daily.index[split].date().isoformat(),
            "test_end_date": daily.index[-1].date().isoformat(),
            "metrics": {"last_observation_baseline": baseline_metrics, "ridge_lag_model": model_metrics},
            "ridge_mae_beats_baseline": bool(beats_baseline),
            "limitations": [
                "Single commodity/mandi series; not evidence of nationwide performance.",
                "Sparse market reports are not made continuous by synthetic interpolation.",
                "This single holdout is insufficient for production promotion; require rolling-origin evaluation and segment metrics.",
                "No uncertainty interval is emitted; do not present these predictions as guaranteed prices.",
            ],
        },
        "promotion": {
            "eligible": False,
            "reason": "Training utility only. Add reviewed model artifact storage, repeatable rolling-origin evaluation, model card, approval and rollback before production use."
        },
        "artifacts": {"predictions_csv": str(predictions_path)},
    }
    report_path = output_dir / "evaluation_report.json"
    report_path.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    report["artifacts"]["evaluation_report_json"] = str(report_path)
    report_path.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    return report


if __name__ == "__main__":
    args = parse_args()
    result = run(args)
    print(json.dumps(result, indent=2, ensure_ascii=False))
