#!/usr/bin/env python3
"""Idempotently import the official AGMARKNET CSV into Supabase staging.

Example:
  python scripts/data/import_agmarknet_csv_staging.py --csv path/to/9ef84268-d588-465a-a308-a864a43d0070.csv
  python scripts/data/import_agmarknet_csv_staging.py --csv path/to/file.csv --dry-run

Required environment variables:
  SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL)
  SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SECRET_KEY)

CSV source columns expected: State, District, Market, Commodity, Variety,
Grade, Arrival_Date, Min_x0020_Price, Max_x0020_Price, Modal_x0020_Price.
"""
from __future__ import annotations

import argparse
import csv
import hashlib
import json
import os
import sys
from datetime import datetime
from pathlib import Path
from typing import Any

try:
    from dotenv import load_dotenv
    from supabase import create_client
except ImportError as exc:
    raise SystemExit("Install dependencies first: pip install supabase python-dotenv") from exc

ROOT = Path(__file__).resolve().parents[2]
load_dotenv(ROOT / ".env")
load_dotenv(ROOT / "backend" / ".env")

BATCH_SIZE = 300
PRICE_COLUMNS = ("Min_x0020_Price", "Max_x0020_Price", "Modal_x0020_Price")


def clean(value: Any) -> str:
    return str(value or "").strip()


def as_price(value: Any, line_number: int, column: str) -> float:
    try:
        number = float(clean(value).replace(",", ""))
    except (TypeError, ValueError) as exc:
        raise ValueError(f"Line {line_number}: invalid {column}: {value!r}") from exc
    if number < 0:
        raise ValueError(f"Line {line_number}: {column} must be non-negative")
    return number


def normalize(row: dict[str, Any], line_number: int) -> dict[str, Any]:
    required = ("State", "District", "Market", "Commodity", "Variety", "Grade", "Arrival_Date")
    missing = [key for key in required if not clean(row.get(key))]
    if missing:
        raise ValueError(f"Line {line_number}: missing columns/values {missing}")
    raw_date = clean(row["Arrival_Date"])
    parsed = None
    for fmt in ("%d/%m/%Y", "%Y-%m-%d", "%d-%m-%Y", "%d/%m/%y"):
        try:
            parsed = datetime.strptime(raw_date, fmt).date().isoformat()
            break
        except ValueError:
            continue
    if parsed is None:
        raise ValueError(f"Line {line_number}: invalid Arrival_Date {raw_date!r}")

    minimum, maximum, modal = [as_price(row.get(col), line_number, col) for col in PRICE_COLUMNS]
    if maximum < minimum or modal < minimum or modal > maximum:
        raise ValueError(
            f"Line {line_number}: expected 0 <= min <= modal <= max; "
            f"received {minimum}, {modal}, {maximum}"
        )

    raw = {key: clean(value) for key, value in row.items()}
    for key, value in zip(PRICE_COLUMNS, (minimum, maximum, modal)):
        raw[key] = value
    canonical = "|".join([
        parsed, raw["State"], raw["District"], raw["Market"], raw["Commodity"],
        raw["Variety"], raw["Grade"],
    ])
    digest = hashlib.sha256(canonical.encode("utf-8")).hexdigest()
    return {
        "source_row_hash": digest,
        "observation_date": parsed,
        "state_name": raw["State"],
        "district_name": raw["District"],
        "mandi_name": raw["Market"],
        "commodity_name": raw["Commodity"],
        "variety": raw["Variety"],
        "grade": raw["Grade"],
        "min_price": minimum,
        "max_price": maximum,
        "modal_price": modal,
        "source": "AGMARKNET",
        "raw_record": raw,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--csv", required=True, help="Path to the downloaded official AGMARKNET CSV")
    parser.add_argument("--dry-run", action="store_true", help="Validate without writing to Supabase")
    parser.add_argument("--batch-size", type=int, default=BATCH_SIZE, choices=range(50, 1001))
    args = parser.parse_args()

    path = Path(args.csv).expanduser().resolve()
    if not path.is_file():
        raise SystemExit(f"CSV not found: {path}")
    with path.open("r", newline="", encoding="utf-8-sig") as handle:
        reader = csv.DictReader(handle)
        required_columns = {"State", "District", "Market", "Commodity", "Variety", "Grade", "Arrival_Date", *PRICE_COLUMNS}
        missing = required_columns - set(reader.fieldnames or [])
        if missing:
            raise SystemExit(f"CSV missing expected columns: {sorted(missing)}")
        rows = [normalize(row, idx) for idx, row in enumerate(reader, start=2)]

    if not rows:
        raise SystemExit("CSV contains no records.")
    print(json.dumps({
        "validated_rows": len(rows),
        "earliest_date": min(row["observation_date"] for row in rows),
        "latest_date": max(row["observation_date"] for row in rows),
        "states": len({row["state_name"] for row in rows}),
        "districts": len({row["district_name"] for row in rows}),
        "markets": len({row["mandi_name"] for row in rows}),
        "commodities": len({row["commodity_name"] for row in rows}),
        "dry_run": args.dry_run,
    }, ensure_ascii=False))

    if args.dry_run:
        print("Dry run only; no database writes performed.")
        return 0

    url = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_SECRET_KEY")
    if not url or not key:
        raise SystemExit("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SECRET_KEY) in your local environment/.env.")
    client = create_client(url, key)
    inserted_or_updated = 0
    for start in range(0, len(rows), args.batch_size):
        batch = rows[start:start + args.batch_size]
        client.table("agmarknet_csv_import_staging").upsert(
            batch, on_conflict="source_row_hash"
        ).execute()
        inserted_or_updated += len(batch)
        print(f"Upserted {min(start + len(batch), len(rows))}/{len(rows)} rows", flush=True)
    print(json.dumps({"status": "SUCCESS", "upserted_rows": inserted_or_updated}))
    return 0


if __name__ == "__main__":
    sys.exit(main())
