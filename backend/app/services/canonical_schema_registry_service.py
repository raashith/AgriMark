from typing import Dict, Any, List, Optional
import uuid

class CanonicalSchemaRegistryService:
    """
    Manages canonical agricultural schemas (Farmer, Farm, LandParcel, Crop, ProduceLot, Market, Commodity, Weather, Soil, etc.)
    and handles schema drift & compatibility checks.
    """
    def __init__(self):
        self._schemas: Dict[str, Dict[str, Any]] = {}
        self._versions: Dict[str, List[Dict[str, Any]]] = {}
        self._seed_canonical_schemas()

    def _seed_canonical_schemas(self):
        canonical_list = [
            ("Farmer", "IDENTITY", {"farmer_ref": "string", "name": "string", "phone": "string", "village": "string"}),
            ("Farm", "GEOSPATIAL", {"farm_ref": "string", "farmer_ref": "string", "area_acres": "float", "geometry": "GeoJSON"}),
            ("Crop", "CROP", {"crop_ref": "string", "crop_name": "string", "variety": "string", "category": "string"}),
            ("ProduceLot", "SUPPLY", {"lot_ref": "string", "crop_ref": "string", "quantity_kg": "float", "grade": "string"}),
            ("MarketPrice", "PRICE", {"market_ref": "string", "commodity": "string", "price_per_kg": "float", "date": "string"}),
            ("WeatherObservation", "WEATHER", {"station_ref": "string", "temp_celsius": "float", "rainfall_mm": "float", "timestamp": "string"}),
            ("SoilProfile", "SOIL", {"sample_ref": "string", "ph": "float", "nitrogen_mg_kg": "float", "organic_carbon_pct": "float"}),
            ("IoTDevice", "IoT", {"device_ref": "string", "device_type": "string", "battery_pct": "float", "status": "string"}),
            ("FinancialEvent", "FINANCE", {"event_ref": "string", "farmer_ref": "string", "amount_inr": "float", "type": "string"}),
            ("ExecutionEvent", "EXECUTION", {"event_ref": "string", "task_type": "string", "executor": "string", "status": "string"}),
        ]
        for name, domain, fields in canonical_list:
            s_id = str(uuid.uuid4())
            schema_item = {
                "id": s_id,
                "schema_name": name,
                "domain": domain,
                "canonical_version": "1.0.0",
                "description": f"Canonical schema for {name} domain"
            }
            version_item = {
                "id": str(uuid.uuid4()),
                "schema_id": s_id,
                "version": "1.0.0",
                "fields_definition": fields,
                "compatibility": "BACKWARD",
                "status": "ACTIVE"
            }
            self._schemas[name] = schema_item
            self._versions[s_id] = [version_item]

    def get_schema(self, schema_name: str) -> Optional[Dict[str, Any]]:
        return self._schemas.get(schema_name)

    def get_latest_version(self, schema_name: str) -> Optional[Dict[str, Any]]:
        schema = self._schemas.get(schema_name)
        if not schema:
            return None
        versions = self._versions.get(schema["id"], [])
        return versions[-1] if versions else None

    def validate_schema_compatibility(self, schema_name: str, new_fields: Dict[str, Any]) -> Dict[str, Any]:
        latest = self.get_latest_version(schema_name)
        if not latest:
            return {"is_compatible": True, "compatibility_level": "FULL", "breaking_changes": []}
        
        old_fields = latest["fields_definition"]
        breaking_changes = []
        # Check for removed fields
        for field in old_fields:
            if field not in new_fields:
                breaking_changes.append(f"Field '{field}' removed")
        
        # Check type mismatches
        for field, old_type in old_fields.items():
            if field in new_fields and new_fields[field] != old_type:
                breaking_changes.append(f"Field '{field}' type changed from {old_type} to {new_fields[field]}")

        is_compat = len(breaking_changes) == 0
        return {
            "is_compatible": is_compat,
            "compatibility_level": "BACKWARD" if is_compat else "NONE",
            "breaking_changes": breaking_changes,
            "recommendation": "ACCEPT" if is_compat else "QUARANTINE"
        }

    def detect_schema_drift(self, incoming_payload: Dict[str, Any], schema_name: str) -> Dict[str, Any]:
        latest = self.get_latest_version(schema_name)
        if not latest:
            return {"drift_detected": False, "details": "No reference schema found"}

        expected_fields = set(latest["fields_definition"].keys())
        actual_fields = set(incoming_payload.keys())

        missing = expected_fields - actual_fields
        new_unknown = actual_fields - expected_fields

        has_drift = len(new_unknown) > 0
        severity = "HIGH" if len(new_unknown) > 2 else ("MEDIUM" if len(new_unknown) > 0 else "LOW")

        return {
            "drift_detected": has_drift,
            "severity": severity,
            "missing_fields": list(missing),
            "unknown_fields": list(new_unknown),
            "action": "QUARANTINE" if severity == "HIGH" else ("WARN" if has_drift else "ALLOW")
        }


    def list_schemas(self) -> List[Dict[str, Any]]:
        return list(self._schemas.values())
