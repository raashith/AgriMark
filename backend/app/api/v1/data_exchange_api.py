from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from backend.app.services.data_provider_registry_service import DataProviderRegistryService
from backend.app.services.canonical_schema_registry_service import CanonicalSchemaRegistryService
from backend.app.services.semantic_normalization_service import SemanticNormalizationService
from backend.app.services.consent_purpose_policy_service import ConsentPurposePolicyService
from backend.app.services.selective_disclosure_service import SelectiveDisclosureService
from backend.app.services.data_lineage_provenance_service import DataLineageProvenanceService
from backend.app.services.agri_data_exchange_gateway import AgriDataExchangeGateway
from backend.app.schemas.data_contract import DataExchangeRequest

router = APIRouter(prefix="/data/exchange", tags=["Data Exchange Gateway"])

gateway = AgriDataExchangeGateway(
    provider_registry=DataProviderRegistryService(),
    schema_registry=CanonicalSchemaRegistryService(),
    semantic_norm=SemanticNormalizationService(),
    consent_policy=ConsentPurposePolicyService(),
    selective_disc=SelectiveDisclosureService(),
    lineage_service=DataLineageProvenanceService()
)

@router.post("/process")
def process_exchange_request(req: Dict[str, Any]):
    result = gateway.process_data_exchange_request(req)
    if result["status"] == "REJECTED":
        raise HTTPException(status_code=403, detail=result["reason"])
    return result

@router.get("/audit")
def get_exchange_audit():
    return {"total_exchanges": len(gateway.audit_log), "audit_trail": gateway.audit_log}
