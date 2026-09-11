from typing import Dict, Any, List, Optional, Tuple

class SemanticNormalizationService:
    """
    AgriculturalSemanticRegistry: Multilingual crop, commodity, and term normalization across
    English, Tamil, Hindi, Telugu, Kannada, Malayalam, Marathi, Bengali, Gujarati, Punjabi.
    Also handles strict unit conversions without silent ambiguity.
    """

    CROP_ALIASES: Dict[str, Dict[str, str]] = {
        "TOMATO": {
            "en": "Tomato",
            "ta": "தக்காளி",
            "hi": "टमाटर",
            "te": "టమాటా",
            "kn": "ಟೊಮೆಟೊ",
            "ml": "തക്കാളി",
            "mr": "टोमॅटो",
            "gu": "ટામેટા"
        },
        "PADDY": {
            "en": "Paddy",
            "ta": "நெல்",
            "hi": "धान",
            "te": "వరి",
            "kn": "ಭತ್ತ",
            "ml": "നെല്ല്",
            "mr": "भात"
        },
        "COTTON": {
            "en": "Cotton",
            "ta": "பருத்தி",
            "hi": "कपास",
            "te": "పత్తి",
            "kn": "ಹತ್ತಿ",
            "ml": "പരുത്തി"
        },
        "ONION": {
            "en": "Onion",
            "ta": "வெங்காயம்",
            "hi": "प्याज",
            "te": "ఉల్లిपाय",
            "kn": "ಈರುಳ್ಳಿ"
        },
        "SUGARCANE": {
            "en": "Sugarcane",
            "ta": "கரும்பு",
            "hi": "गन्ना",
            "te": "చెరకు",
            "kn": "ಕಬ್ಬು"
        }
    }

    UNIT_CONVERSIONS: Dict[Tuple[str, str], float] = {
        ("QUINTAL", "KG"): 100.0,
        ("KG", "QUINTAL"): 0.01,
        ("TONNE", "KG"): 1000.0,
        ("KG", "TONNE"): 0.001,
        ("ACRE", "HECTARE"): 0.404686,
        ("HECTARE", "ACRE"): 2.47105,
        ("LITRE", "MILLILITRE"): 1000.0,
        ("MILLILITRE", "LITRE"): 0.001
    }

    def resolve_crop_canonical(self, term: str) -> Dict[str, Any]:
        cleaned = term.strip().upper()
        # Direct match
        if cleaned in self.CROP_ALIASES:
            return {
                "canonical_id": cleaned,
                "english": self.CROP_ALIASES[cleaned].get("en"),
                "aliases": self.CROP_ALIASES[cleaned],
                "confidence": 1.0
            }

        # Check aliases
        for canonical, aliases in self.CROP_ALIASES.items():
            for lang, val in aliases.items():
                if val.strip().lower() == term.strip().lower():
                    return {
                        "canonical_id": canonical,
                        "english": aliases.get("en"),
                        "aliases": aliases,
                        "confidence": 0.98
                    }

        # Extensible fallback
        return {
            "canonical_id": cleaned,
            "english": term.strip(),
            "aliases": {"en": term.strip()},
            "confidence": 0.50
        }

    def normalize_unit(self, original_value: float, original_unit: str, target_unit: Optional[str] = None) -> Dict[str, Any]:
        src_u = original_unit.strip().upper()
        if not target_unit:
            # Default target per category
            if src_u in ["QUINTAL", "TONNE", "KG", "GRAM"]:
                target_u = "KG"
            elif src_u in ["ACRE", "HECTARE"]:
                target_u = "HECTARE"
            elif src_u in ["LITRE", "MILLILITRE"]:
                target_u = "LITRE"
            else:
                target_u = src_u
        else:
            target_u = target_unit.strip().upper()

        if src_u == target_u:
            return {
                "original_value": original_value,
                "original_unit": original_unit,
                "normalized_value": original_value,
                "normalized_unit": target_u,
                "conversion_rule": "EXACT_MATCH"
            }

        rule_key = (src_u, target_u)
        if rule_key in self.UNIT_CONVERSIONS:
            factor = self.UNIT_CONVERSIONS[rule_key]
            norm_val = round(original_value * factor, 4)
            return {
                "original_value": original_value,
                "original_unit": original_unit,
                "normalized_value": norm_val,
                "normalized_unit": target_u,
                "conversion_rule": f"MULTIPLY_BY_{factor}"
            }

        # Ambiguous or unknown conversion safety exception
        return {
            "original_value": original_value,
            "original_unit": original_unit,
            "normalized_value": original_value,
            "normalized_unit": original_unit,
            "conversion_rule": "UNKNOWN_CONVERSION_PRESERVED_ORIGINAL"
        }

    def normalize_geospatial(self, geo_data: Dict[str, Any]) -> Dict[str, Any]:
        lat = geo_data.get("latitude")
        lon = geo_data.get("longitude")
        district = geo_data.get("district", "").strip().title()
        state = geo_data.get("state", "").strip().title()

        geojson = {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [lon, lat] if (lon and lat) else [0.0, 0.0]
            },
            "properties": {
                "district": district,
                "state": state,
                "crs": "EPSG:4326"
            }
        }
        return {
            "standard_coordinates": {"latitude": lat, "longitude": lon},
            "crs": "EPSG:4326",
            "district": district,
            "state": state,
            "geojson": geojson,
            "is_valid_geometry": (lat is not None and -90 <= lat <= 90 and lon is not None and -180 <= lon <= 180)
        }
