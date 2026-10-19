#!/usr/bin/env python3
"""Collect crop-specific, reusable commodity photos from Wikimedia Commons.

Usage:
  python -m pip install -r scripts/data/requirements-commodity-images.txt
  python scripts/data/collect_commodity_images.py

The script only accepts images with explicit open/public-domain licensing, records
attribution metadata, downsizes files for web use, and never substitutes a different
commodity when a matching source image cannot be found.
"""
from __future__ import annotations

import csv
import json
import re
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

try:
    from PIL import Image
    from io import BytesIO
except ImportError as exc:
    raise SystemExit(
        "Pillow is required. Run: python -m pip install -r "
        "scripts/data/requirements-commodity-images.txt"
    ) from exc

ROOT = Path(__file__).resolve().parents[2]
DATASET = ROOT / "data" / "commodity_image_dataset.csv"
WEB_ROOT = ROOT / "web" / "public" / "images" / "commodities"
MANIFEST = WEB_ROOT / "manifest.json"
ATTRIBUTION = WEB_ROOT / "ATTRIBUTION.md"
API_URL = "https://commons.wikimedia.org/w/api.php"
USER_AGENT = "AgriMarkCommodityImageDataset/1.0 (open-source agriculture marketplace; contact via GitHub repository)"
ALLOWED_LICENSES = {
    "cc0", "public domain", "public domain mark", "cc by", "cc by-sa",
    "creative commons zero", "cc by 2.0", "cc by 3.0", "cc by 4.0",
    "cc by-sa 2.0", "cc by-sa 3.0", "cc by-sa 4.0",
}
EXCLUDED_TITLE_WORDS = {
    "recipe", "cooked", "curry", "soup", "salad", "dish", "restaurant",
    "meal", "juice", "cutlet", "fried", "biryani", "pulao", "dessert",
}


def normalize(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", value.lower()).strip()


def request_json(params: dict) -> dict:
    url = API_URL + "?" + urlencode({**params, "format": "json", "origin": "*"})
    request = Request(url, headers={"User-Agent": USER_AGENT})
    with urlopen(request, timeout=30) as response:
        return json.loads(response.read().decode("utf-8"))


def is_open_license(short_name: str, url: str) -> bool:
    license_text = normalize(short_name)
    license_url = (url or "").lower()
    if any(term in license_text for term in ("all rights reserved", "fair use", "unknown", "copyrighted")):
        return False
    if "creativecommons.org/publicdomain/zero" in license_url:
        return True
    if "creativecommons.org/licenses/by/" in license_url or "creativecommons.org/licenses/by-sa/" in license_url:
        return True
    if "creativecommons.org/publicdomain/mark" in license_url:
        return True
    return any(normalize(allowed) == license_text for allowed in ALLOWED_LICENSES)


def title_score(title: str, record: dict) -> int:
    clean = normalize(title.replace("File:", ""))
    if any(word in clean.split() for word in EXCLUDED_TITLE_WORDS):
        return -100
    aliases = [record["canonical_name"], record["commodity_key"].replace("_", " ")]
    aliases.extend(record["aliases"].split(";"))
    score = 0
    for alias in aliases:
        phrase = normalize(alias)
        if not phrase:
            continue
        if clean == phrase:
            score = max(score, 100)
        elif f" {phrase} " in f" {clean} ":
            score = max(score, 60 + min(len(phrase.split()), 4) * 4)
        elif len(phrase) > 4 and phrase in clean:
            score = max(score, 35)
    return score


def find_candidate(record: dict) -> dict | None:
    aliases = [record["canonical_name"], record["commodity_key"].replace("_", " ")]
    aliases.extend(record["aliases"].split(";"))
    queries = [record["commons_search_terms"]] + [alias for alias in aliases if len(alias.strip()) > 3]
    seen: set[str] = set()
    candidates: list[dict] = []

    for query in queries[:5]:
        try:
            payload = request_json({
                "action": "query",
                "generator": "search",
                "gsrsearch": f"filetype:bitmap {query}",
                "gsrnamespace": 6,
                "gsrlimit": 10,
                "prop": "imageinfo",
                "iiprop": "url|extmetadata",
                "iiurlwidth": 1000,
            })
        except (HTTPError, URLError, TimeoutError, json.JSONDecodeError) as exc:
            print(f"[WARN] Commons search failed for {record['canonical_name']}: {exc}", file=sys.stderr)
            continue

        for page in (payload.get("query", {}).get("pages", {}) or {}).values():
            title = page.get("title", "")
            if title in seen:
                continue
            seen.add(title)
            score = title_score(title, record)
            if score < 35:
                continue
            info = (page.get("imageinfo") or [{}])[0]
            meta = info.get("extmetadata") or {}
            short_name = (meta.get("LicenseShortName") or {}).get("value", "")
            license_url = (meta.get("LicenseUrl") or {}).get("value", "")
            if not is_open_license(short_name, license_url):
                continue
            mime = info.get("mime", "")
            thumb_url = info.get("thumburl") or info.get("url")
            page_url = info.get("descriptionurl") or (
                "https://commons.wikimedia.org/wiki/" + title.replace(" ", "_")
            )
            if not thumb_url or not mime.startswith("image/"):
                continue
            candidates.append({
                "score": score,
                "title": title,
                "download_url": thumb_url,
                "source_page_url": page_url,
                "source_image_url": info.get("url", thumb_url),
                "mime": mime,
                "author": (meta.get("Artist") or {}).get("value", "Unknown"),
                "license": short_name,
                "license_url": license_url,
                "description": (meta.get("ImageDescription") or {}).get("value", ""),
            })
        time.sleep(0.15)

    if not candidates:
        return None
    candidates.sort(key=lambda item: (item["score"], -len(item["title"])), reverse=True)
    return candidates[0]


def download_jpeg(url: str, destination: Path) -> None:
    request = Request(url, headers={"User-Agent": USER_AGENT})
    with urlopen(request, timeout=45) as response:
        raw = response.read()
    image = Image.open(BytesIO(raw)).convert("RGB")
    image.thumbnail((1200, 900), Image.Resampling.LANCZOS)
    destination.parent.mkdir(parents=True, exist_ok=True)
    image.save(destination, format="JPEG", quality=88, optimize=True, progressive=True)


def main() -> int:
    if not DATASET.exists():
        print(f"Dataset CSV not found: {DATASET}", file=sys.stderr)
        return 2

    with DATASET.open("r", encoding="utf-8-sig", newline="") as handle:
        rows = list(csv.DictReader(handle))
    if not rows:
        print("Dataset CSV is empty.", file=sys.stderr)
        return 2

    WEB_ROOT.mkdir(parents=True, exist_ok=True)
    manifest = []
    attribution_lines = [
        "# AgriMark Commodity Image Dataset — image credits",
        "",
        "Images are collected from Wikimedia Commons and resized for marketplace display.",
        "Each entry below retains its source page, creator, and license. Please preserve",
        "these attributions when redistributing the image assets.",
        "",
    ]
    now = datetime.now(timezone.utc).isoformat()

    for index, record in enumerate(rows, start=1):
        name = record["canonical_name"]
        image_path = WEB_ROOT / f"{record['commodity_key']}.jpg"
        print(f"[{index}/{len(rows)}] Finding image for {name}...")
        try:
            candidate = find_candidate(record)
            if not candidate:
                print(f"  [SKIP] No confidently matched open-license photo for {name}")
                manifest.append({
                    "key": record["commodity_key"],
                    "name": name,
                    "category": record["category"],
                    "image_path": None,
                    "review_status": "no_licensed_match",
                })
                continue

            download_jpeg(candidate["download_url"], image_path)
            record.update({
                "image_file": image_path.relative_to(ROOT / "web" / "public").as_posix(),
                "source_page_url": candidate["source_page_url"],
                "source_image_url": candidate["source_image_url"],
                "author": re.sub(r"<[^>]+>", "", candidate["author"]).strip() or "Unknown",
                "license": candidate["license"],
                "license_url": candidate["license_url"],
                "retrieved_at": now,
                "review_status": "downloaded_needs_visual_review",
            })
            manifest.append({
                "key": record["commodity_key"],
                "name": name,
                "category": record["category"],
                "image_path": "/" + record["image_file"],
                "source_page_url": record["source_page_url"],
                "author": record["author"],
                "license": record["license"],
                "license_url": record["license_url"],
                "retrieved_at": now,
                "review_status": record["review_status"],
            })
            attribution_lines.extend([
                f"## {name}",
                f"- Image: [{candidate['title']}]({candidate['source_page_url']})",
                f"- Creator: {record['author']}",
                f"- License: [{record['license']}]({record['license_url']})",
                f"- Local file: `{record['image_file']}`",
                "- Review: downloaded; verify the picture visibly matches the commodity before production use.",
                "",
            ])
            print(f"  [OK] {candidate['title']} ({record['license']})")
        except (HTTPError, URLError, TimeoutError, OSError, ValueError) as exc:
            print(f"  [WARN] Could not download {name}: {exc}", file=sys.stderr)
            manifest.append({
                "key": record["commodity_key"],
                "name": name,
                "category": record["category"],
                "image_path": None,
                "review_status": "download_failed",
            })

    fieldnames = list(rows[0].keys())
    for field in ("source_page_url", "source_image_url", "author", "license", "license_url", "retrieved_at", "review_status"):
        if field not in fieldnames:
            fieldnames.append(field)
    with DATASET.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)

    MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    ATTRIBUTION.write_text("\n".join(attribution_lines), encoding="utf-8")
    downloaded = sum(1 for row in manifest if row.get("image_path"))
    print(f"Finished: {downloaded}/{len(rows)} licensed photos downloaded.")
    print(f"Manifest: {MANIFEST}")
    print(f"Attribution: {ATTRIBUTION}")
    print("Review every downloaded image before deploying it to production.")
    return 0 if downloaded else 1


if __name__ == "__main__":
    raise SystemExit(main())
