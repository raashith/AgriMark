# AgriMark Commodity Image Dataset

This dataset separates commodity identity from marketplace listing text so the UI never uses a random or unrelated crop image as a fallback.

## Contents

- `data/commodity_image_dataset.csv`: canonical commodity keys, categories, aliases (including Tamil/Indian market terms), Wikimedia Commons search terms and expected image filename.
- `web/src/lib/commodity-images.ts`: runtime catalog and conservative alias resolver used by marketplace cards.
- `web/src/components/ui/CommodityImage.tsx`: shared image renderer with a commodity-specific fallback illustration.
- `scripts/data/collect_commodity_images.py`: downloads open-license Commons images, resizes them for web display, and creates an attribution manifest.
- `tests/test_commodity_image_dataset.py`: checks dataset coverage, unique keys and regional aliases.

The catalog currently covers cereals, pulses, oilseeds, vegetables, spices, fruits and cash crops.

## Collect the photo assets

From the repository root:

```powershell
python -m pip install -r scripts/data/requirements-commodity-images.txt
python scripts/data/collect_commodity_images.py
```

The collector writes images to `web/public/images/commodities/{commodity_key}.jpg`, adds source/license/creator/retrieval columns to the CSV, and writes:

- `web/public/images/commodities/manifest.json`
- `web/public/images/commodities/ATTRIBUTION.md`

Only Wikimedia Commons images with explicit CC0, public-domain, CC BY or CC BY-SA metadata are eligible. Each photo is downsized and converted to JPEG for web use. If a confident commodity match or open license cannot be established, the collector skips it rather than borrowing a different commodity's photo.

## Important image-quality rule

The Commons search is an ingestion helper, not a guarantee of semantic correctness. Every downloaded entry is marked `downloaded_needs_visual_review`; visually inspect the downloaded file against its commodity label before committing photo assets or deploying them. Preserve the generated attribution records and comply with the individual image license.

## Marketplace integration

The shared listing card, main marketplace page and buyer marketplace use `CommodityImage`. Images are resolved from the canonical crop name first, then the listing title. The canonical catalog image is used instead of an arbitrary `listing.images[0]` or universal rice-photo fallback. Unknown names get a clearly labelled neutral produce illustration rather than an unrelated crop photo.

This catalogue photo is a commodity reference image, not evidence that the farmer's actual lot has been photographed or independently verified. Actual lot photos should be kept as separate seller-uploaded media on the listing detail page.
