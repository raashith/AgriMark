import pandas as pd

from ml.mandi_forecasting.train import make_supervised


def test_supervised_samples_only_use_real_exact_target_dates():
    rows = []
    for day, price in [(1, 100), (2, 102), (3, 101), (5, 110)]:
        rows.append({
            "observation_date": f"2026-01-{day:02d}",
            "commodity_code": "WHEAT",
            "state_code": "IN-TN",
            "mandi_code": "M1",
            "modal_price": price,
            "arrival_quantity": 10,
        })
    samples = make_supervised(pd.DataFrame(rows))
    assert not samples.empty
    # Missing Jan 4 must never be silently synthesized as a target.
    assert not (samples["target_date"] == pd.Timestamp("2026-01-04")).any()


def test_no_target_before_source_date():
    rows = []
    for day in range(1, 12):
        rows.append({
            "observation_date": f"2026-02-{day:02d}",
            "commodity_code": "RICE",
            "state_code": "IN-TN",
            "mandi_code": "M2",
            "modal_price": 200 + day,
            "arrival_quantity": 25,
        })
    samples = make_supervised(pd.DataFrame(rows))
    assert (samples["target_date"] > samples["source_date"]).all()
    assert samples["horizon"].between(1, 7).all()
