# AgriMark Commodity Image Dataset — Source Manifest

This manifest records real-photo commodity image dataset sources. It does **not** claim the source archives have been downloaded into this repository or uploaded to Supabase. Dataset sizes and licensing below are based on the source dataset pages; re-check the license and version before production/commercial redistribution.

## Recommended source datasets

| Dataset | Images/classes | Real-photo characteristics | License stated by source | Source |
|---|---:|---|---|---|
| Indian Grain Classification | 7,500 images / 10 classes | Smartphone-captured grains/pulses; source notes that six classes contain a mix of original and augmented images. Chaana dal, peanut, rice and wheat are stated as original captures only. | Apache 2.0 (as stated on Kaggle) | https://www.kaggle.com/datasets/dmtandsully/indian-grain-classification |
| Indian Grains, Pulses and Millets | ~2,850 images / 38 classes | Manually photographed grains, millets and pulses; source says they were not downloaded from web image searches or other public datasets. | CC BY 4.0 (as stated on Kaggle) | https://www.kaggle.com/datasets/arunthiraviam/indian-grains-pulses-and-millets-dataset |
| INDIAN 10 CLASS GRAIN DATA | 7,500 images / 10 classes | Smartphone-captured grains/pulses; same project listing also appears on Figshare. Verify the current file version and exact license before reuse. | Verify on the source page | https://figshare.com/articles/dataset/INDIAN_10_CLASS_GRAIN_DATA/33464749 |
| GrainSet | >350,000 single-kernel images across wheat, maize, sorghum and rice | Expert annotated, high-resolution cereal-kernel images; designed for grain quality inspection rather than market-stall/commodity-bag images. | CC BY 4.0 (paper states Figshare deposit) | https://github.com/hellodfan/GrainSet |

## Suggested first phase

Start with the 38-class dataset for breadth and the 7,500-image dataset for a balanced 10-class benchmark. Keep train/validation/test splits from each dataset intact. Do not merge augmented derivatives into validation/test or treat multiple frames from the same burst/video as independent samples across splits.

Suggested target classes for AgriMark include rice, wheat, maize, sorghum, millet varieties, chickpea/chana, tur/toor, moong, urad, masoor, groundnut, soybean, cotton, sesame, and other commodities actually present in AgriMark's commodity table.

## Required manifest fields for every local image

- `commodity_code` / `commodity_name`
- `image_path` (local relative path or Supabase Storage object path)
- `source_dataset`
- `source_url`
- `source_license`
- `creator_or_attribution` (when required)
- `is_original_capture` (true/false/unknown)
- `is_augmented` (true/false/unknown)
- `split` (train/validation/test)
- `sha256` (to detect duplicates)

## Important distinction

These sources mainly depict loose grains, kernels and pulses. They are **not** a comprehensive dataset of market-arrival photographs, packaged sacks, auction-yard scenes, or all fresh fruits and vegetables. The app should show dataset-backed photos only for matching classes, not infer an image for every commodity from a similar-looking class.

## Next integration steps

1. Download the licensed archives from the source pages and preserve original license/readme files.
2. Validate archive hashes, image readability, duplicates, class labels, and split leakage.
3. Convert labels to AgriMark's canonical commodity codes.
4. Upload image files to a dedicated Supabase Storage bucket (separate from private farmer documents) and maintain a source/attribution manifest.
5. Add stable storage paths to a commodity-image metadata table; enable public reads only for images cleared for redistribution.
6. Verify actual record counts and public URL access before wiring the catalogue UI.

No dataset archive is bundled in this repository by this manifest alone.
