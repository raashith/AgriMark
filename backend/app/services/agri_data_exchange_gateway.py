from typing import Dict, Any, List, Optional
import uuid
from datetime import datetime

from backend.app.services.data_provider_registry_service import DataProviderRegistryService
from backend.app.services.canonical_schema_registry_service import CanonicalSchemaRegistryService
from backend.app.services.semantic_normalization_service import SemanticNormalizationService
from backend.app.services.consent_purpose_policy_service import ConsentPurposePolicyService
from backend.app.services.selective_disclosure_service import SelectiveDisclosureService
from backend.app.services.data_lineage_provenance_service import DataLineageProvenanceService

class AgriDataExchangeGateway:
    """
    AgriDataExchangeGateway Pipeline:
    REQUEST -> AUTHENTICATE -> PURPOSE -> CONSENT -> POLICY -> FIELD FILTER -> QUALITY -> TRANSFORM -> DELIVER -> AUDIT
    """
    def __init__(self,
                 provider_registry: DataProviderRegistryService,
                 schema_registry: CanonicalSchemaRegistryService,
                 semantic_norm: SemanticNormalizationService,
                 consent_policy: ConsentPurposePolicyService,
                 selective_disc: SelectiveDisclosureService,
                 lineage_service: DataLineageProvenanceService):
        self.provider_registry = provider_registry
        self.schema_registry = schema_registry
        self.semantic_norm = semantic_norm
        self.consent_policy = consent_policy
        self.selective_disc = selective_disc
        self.lineage_service = lineage_service
        self.audit_log: List[Dict[str, Any]] = []

    def process_data_exchange_request(self, request_payload: Dict[str, Any]) -> Dict[str, Any]:
        trace_id = str(uuid.uuid4())
        consumer_id = request_payload.get("consumer_id")
        farmer_ref = request_payload.get("farmer_ref")
        purpose = request_payload.get("purpose")
        domain = request_payload.get("domain", "CROP")
        requested_fields = request_payload.get("requested_fields", [])
        raw_data = request_payload.get("raw_data", {})

        # Step 1: AUTHENTICATE Consumer
        consumer = self.provider_registry.get_consumer(consumer_id)
        if not consumer:
            self._log_audit(trace_id, consumer_id, purpose, "AUTHENTICATION_FAILED", "Invalid DataConsumer ID")
            return {
                "trace_id": trace_id,
                "status": "REJECTED",
                "stage_failed": "AUTHENTICATE",
                "reason": f"DataConsumer '{consumer_id}' is not registered or authenticated."
            }

        # Step 2 & 3: PURPOSE & CONSENT Validation
        perm_check = self.consent_policy.validate_access_permission(farmer_ref, consumer_id, purpose, domain)
        if not perm_check["permitted"]:
            self._log_audit(trace_id, consumer_id, purpose, "ACCESS_DENIED", perm_check["reason"])
            return {
                "trace_id": trace_id,
                "status": "REJECTED",
                "stage_failed": "CONSENT_POLICY",
                "reason": perm_check["reason"]
            }

        # Step 4: FIELD FILTER & Data Minimization
        minimized_data = self.consent_policy.minimize_fields(raw_data, purpose)
        if requested_fields:
            minimized_data = {k: v for k, v in minimized_data.items() if k in requested_fields}

        # Step 5: QUALITY & SCHEMA DRIFT Check
        drift_check = self.schema_registry.detect_schema_drift(minimized_data, domain.capitalize())
        if drift_check.get("action") == "QUARANTINE":
            self._log_audit(trace_id, consumer_id, purpose, "QUARANTINED", "Severe schema drift detected")
            return {
                "trace_id": trace_id,
                "status": "QUARANTINED",
                "stage_failed": "SCHEMA_DRIFT",
                "reason": f"Schema drift detected: Missing fields {drift_check.get('missing_fields')}."
            }

        # Step 6: TRANSFORM & Semantic Normalization
        transformed_payload = {}
        for k, v in minimized_data.items():
            if k == "crop_name":
                norm_c = self.semantic_norm.resolve_crop_canonical(str(v))
                transformed_payload["crop_name_canonical"] = norm_c["canonical_id"]
                transformed_payload["crop_name_original"] = v
            elif k in ["quantity", "volume", "weight"]:
                unit = request_payload.get("original_unit", "KG")
                norm_u = self.semantic_norm.normalize_unit(float(v), unit)
                transformed_payload["quantity_normalized"] = norm_u["normalized_value"]
                transformed_payload["quantity_unit"] = norm_u["normalized_unit"]
            else:
                transformed_payload[k] = v

        # Step 7: RECORD LINEAGE & DELIVER
        node_src = self.lineage_service.record_node(f"req-{trace_id[:8]}", "Exchange Ingestion", "SOURCE", {"consumer_id": consumer_id})
        node_dst = self.lineage_service.record_node(f"out-{trace_id[:8]}", "Delivered Payload", "DATASET", {"purpose": purpose})
        self.lineage_service.connect_nodes(node_src["id"], node_dst["id"], "EXCHANGE_GATEWAY")

        self._log_audit(trace_id, consumer_id, purpose, "SUCCESS", "Delivered sanitized data payload")

        return {
            "trace_id": trace_id,
            "status": "DELIVERED",
            "consumer_id": consumer_id,
            "purpose": purpose,
            "domain": domain,
            "quality_tier": "HIGH",
            "schema_version": "1.0.0",
            "delivered_data": transformed_payload
        }

    def _log_audit(self, trace_id: str, consumer_id: str, purpose: str, status: str, details: str):
        self.audit_log.append({
            "trace_id": trace_id,
            "consumer_id": consumer_id,
            "purpose": purpose,
            "status": status,
            "details": details,
            "timestamp": datetime.utcnow().isoformat()
        })
