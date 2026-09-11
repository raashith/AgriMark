from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List
from backend.app.schemas.data_contract import DataContractCreate, DataContractResponse

router = APIRouter(prefix="/data/contracts", tags=["Data Contracts"])

contracts_store: Dict[str, Dict[str, Any]] = {
    "cnt-001": {
        "id": "cnt-001",
        "contract_code": "CNT-GOV-AGRIMARK-01",
        "provider_id": "prov-gov-001",
        "consumer_id": "cons-agrimark-001",
        "product_id": "prod-prices-001",
        "purpose": "ADVISORY",
        "scope": {"domains": ["CROP", "PRICE"]},
        "fields_allowed": ["commodity", "price_per_kg", "district"],
        "geography": "Tamil Nadu",
        "frequency": "HOURLY",
        "retention_days": 180,
        "consent_required": True,
        "status": "ACTIVE"
    }
}

@router.get("")
def list_contracts():
    return list(contracts_store.values())

@router.post("", response_model=Dict[str, Any])
def create_contract(contract: DataContractCreate):
    c_dict = contract.dict()
    c_id = f"cnt-{len(contracts_store) + 1:03d}"
    c_dict["id"] = c_id
    c_dict["status"] = "ACTIVE"
    contracts_store[c_id] = c_dict
    return c_dict

@router.get("/{contract_id}")
def get_contract(contract_id: str):
    contract = contracts_store.get(contract_id)
    if not contract:
        raise HTTPException(status_code=404, detail="Data Contract not found")
    return contract
