#!/usr/bin/env python3
"""Train AgriMark's 1–7 day mandi-price model from canonical Supabase observations.

Safety: the trainer refuses to label a model trained when the database lacks
real temporal history. It never synthesizes missing prices or dates.
"""
from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any

import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import HistGradientBoostingRegressor, RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder

TABLE = "national_market_price_observations"
PROJECT_URL = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_SECRET_KEY")
OUT_DIR = Path(os.getenv("AGRIMARK_MODEL_DIR", "artifacts/mandi-price"))
MIN_DATES = int(os.getenv("AGRIMARK_MIN_DATES", "30"))
MIN_TRAIN_SAMPLES = int(os.getenv("AGRIMARK_MIN_TRAIN_SAMPLES", "100"))
HORIZONS = range(1, 8)
NUMERIC = [
    "horizon", "price_last", "price_lag_2", "price_lag_7",
    "price_lag_14", "mean_7", "mean_14", "std_7",
    "arrival_quantity", "days_since_previous", "target_dow", "target_month",
]
CATEGORICAL = ["commodity_code", "state_code", "mandi_code"]


def fetch_observations() -> pd.DataFrame:
    if not PROJECT_URL or not SUPABASE_KEY:
        raise RuntimeError(
            "Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the environment. "
            "Do not put credentials in source code or commit a .env file."
        )
    from supabase import create_client

    client = create_client(PROJECT_URL.rstrip("/"), SUPABASE_KEY)
    rows: list[dict[str, Any]] = []
    offset, page_size = 0, 1000
    while True:
        response = (
            client.table(TABLE)
            .select(
                "observation_date,commodity_code,state_code,mandi_code,"
                "modal_price,arrival_quantity"
            )
            .order("observation_date")
            .range(offset, offset + page_size - 1)
            .execute()
        )
        page = response.data or []
        rows.extend(page)
        if len(page) < page_size:
            break
        offset += page_size
    if not rows:
        raise RuntimeError(f"{TABLE} returned no observations.")
    return pd.DataFrame(rows)


def make_supervised(df: pd.DataFrame) -> pd.DataFrame:
    required = {
        "observation_date", "commodity_code", "state_code", "mandi_code", "modal_price"
    }
    missing = required.difference(df.columns)
    if missing:
        raise ValueError(f"Missing required database columns: {sorted(missing)}")
    df = df.copy()
    df["observation_date"] = pd.to_datetime(df["observation_date"], errors="coerce")
    df["modal_price"] = pd.to_numeric(df["modal_price"], errors="coerce")
    df = df.dropna(subset=["observation_date", "commodity_code", "modal_price"])
    df = df[df["modal_price"] > 0]
    for col in ["state_code", "mandi_code"]:
        df[col] = df[col].fillna("UNKNOWN").astype(str)
    df["commodity_code"] = df["commodity_code"].astype(str)
    df["arrival_quantity"] = pd.to_numeric(
        df.get("arrival_quantity", pd.Series(index=df.index, dtype=float)), errors="coerce"
    ).fillna(0).clip(lower=0)
    # Aggregate duplicate reports for the same commodity-market-day with a median.
    keys = ["commodity_code", "state_code", "mandi_code", "observation_date"]
    daily = (
        df.groupby(keys, as_index=False)
        .agg(modal_price=("modal_price", "median"),
             arrival_quantity=("arrival_quantity", "median"))
        .sort_values(keys)
    )
    samples: list[dict[str, Any]] = []
    group_keys = ["commodity_code", "state_code", "mandi_code"]
    for (commodity, state, mandi), group in daily.groupby(group_keys, sort=False):
        group = group.sort_values("observation_date").reset_index(drop=True)
        dates = group["observation_date"].tolist()
        prices = group["modal_price"].astype(float).tolist()
        arrivals = group["arrival_quantity"].astype(float).tolist()
        by_date = {d.date(): i for i, d in enumerate(dates)}
        for i, observed_at in enumerate(dates):
            if i < 1:
                continue
            recent = prices[max(0, i - 6): i + 1]
            recent14 = prices[max(0, i - 13): i + 1]
            prev_date = dates[i - 1]
            for horizon in HORIZONS:
                target_date = (observed_at + pd.Timedelta(days=horizon)).date()
                target_index = by_date.get(target_date)
                if target_index is None:
                    continue  # Never invent a missing target date.
                target = dates[target_index]
                samples.append({
                    "source_date": observed_at,
                    "target_date": target,
                    "target_price": prices[target_index],
                    "horizon": horizon,
                    "price_last": prices[i],
                    "price_lag_2": prices[i - 1],
                    "price_lag_7": prices[max(0, i - 6)],
                    "price_lag_14": prices[max(0, i - 13)],
                    "mean_7": float(np.mean(recent)),
                    "mean_14": float(np.mean(recent14)),
                    "std_7": float(np.std(recent, ddof=0)),
                    "arrival_quantity": arrivals[i],
                    "days_since_previous": max(1, (observed_at - prev_date).days),
                    "target_dow": target.weekday(),
                    "target_month": target.month,
                    "commodity_code": commodity,
                    "state_code": state,
                    "mandi_code": mandi,
                })
    return pd.DataFrame(samples)


def main() -> int:
    print("Fetching real observations from canonical Supabase table...")
    raw = fetch_observations()
    distinct_dates = pd.to_datetime(raw["observation_date"], errors="coerce").nunique()
    print(f"Loaded {len(raw):,} rows across {distinct_dates:,} distinct observation date(s).")
    if distinct_dates < MIN_DATES:
        print(
            f"TRAINING BLOCKED: need at least {MIN_DATES} distinct real observation dates; "
            f"database currently has {distinct_dates}. No model artifact was created. "
            "Backfill genuine AGMARKNET history first."
        )
        return 2

    data = make_supervised(raw)
    if data.empty or len(data) < MIN_TRAIN_SAMPLES:
        print(
            f"TRAINING BLOCKED: only {len(data):,} valid exact-date horizon samples; "
            f"need at least {MIN_TRAIN_SAMPLES}. Missing dates are not imputed."
        )
        return 2

    # Chronological holdout: every training target must also precede the cutoff,
    # otherwise a 7-day training label could leak into the later test period.
    cut = data["source_date"].quantile(0.8)
    train = data[data["target_date"] < cut].copy()
    test = data[data["source_date"] >= cut].copy()
    if len(train) < MIN_TRAIN_SAMPLES // 2 or test.empty:
        print("TRAINING BLOCKED: insufficient chronological train/test samples.")
        return 2

    preprocess = ColumnTransformer([
        ("numeric", "passthrough", NUMERIC),
        ("categorical", OneHotEncoder(handle_unknown="ignore"), CATEGORICAL),
    ])
    candidates = {
        "random_forest": RandomForestRegressor(
            n_estimators=300, min_samples_leaf=3, max_features=0.9,
            random_state=42, n_jobs=-1,
        ),
        "hist_gradient_boosting": HistGradientBoostingRegressor(
            max_iter=250, learning_rate=0.06, l2_regularization=1.0,
            random_state=42,
        ),
    }
    # HistGradientBoosting cannot consume the sparse one-hot matrix reliably across
    # sklearn versions; RandomForest is the robust mixed-feature candidate here.
    results = []
    best_pipeline = None
    best_mae = float("inf")
    feature_cols = NUMERIC + CATEGORICAL
    for name, estimator in candidates.items():
        if name != "random_forest":
            continue
        pipeline = Pipeline([
            ("preprocess", preprocess),
            ("model", estimator),
        ])
        pipeline.fit(train[feature_cols], train["target_price"])
        pred = np.maximum(0, pipeline.predict(test[feature_cols]))
        mae = float(mean_absolute_error(test["target_price"], pred))
        rmse = float(np.sqrt(mean_squared_error(test["target_price"], pred)))
        baseline = float(mean_absolute_error(test["target_price"], test["price_last"]))
        results.append({"model": name, "mae": mae, "rmse": rmse,
                        "last_price_baseline_mae": baseline,
                        "beats_baseline": mae < baseline})
        if mae < best_mae:
            best_mae, best_pipeline = mae, pipeline

    if best_pipeline is None:
        raise RuntimeError("No candidate model completed training.")
    # Keep the holdout metrics honest; fit production artifact on all samples only
    # after model selection on the chronological holdout.
    best_pipeline.fit(data[feature_cols], data["target_price"])
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    model_path = OUT_DIR / "mandi_price_model.joblib"
    joblib.dump({
        "pipeline": best_pipeline,
        "feature_columns": feature_cols,
        "horizons": list(HORIZONS),
        "target": "modal_price_inr_per_quintal",
        "trained_at_utc": pd.Timestamp.now(tz="UTC").isoformat(),
        "training_rows": int(len(data)),
        "distinct_observation_dates": int(distinct_dates),
        "evaluation": results,
        "validation": "chronological_holdout",
    }, model_path)
    report = {
        "status": "TRAINED_UNVALIDATED_FOR_PRODUCTION",
        "source_table": TABLE,
        "raw_rows": int(len(raw)),
        "distinct_dates": int(distinct_dates),
        "supervised_samples": int(len(data)),
        "train_samples": int(len(train)),
        "holdout_samples": int(len(test)),
        "holdout_cutoff": str(cut),
        "metrics": results,
        "artifact": str(model_path),
        "production_note": "Do not deploy as champion unless it beats the baseline and has been reviewed.",
    }
    (OUT_DIR / "training_report.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(json.dumps(report, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
