from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Dict, Any, List, Optional
from backend.app.services.data_provider_registry_service import DataProviderRegistryService
from backend.app.services.canonical_schema_registry_service import CanonicalSchemaRegistryService
from backend.app.schemas.data_commons import DataProviderResponse, DataConsumerResponse

router = APIRouter(prefix="/data", tags=["Data Commons Catalog"])

provider_service = DataProviderRegistryService()
schema_service = CanonicalSchemaRegistryService()

@router.get("/catalog")
def get_data_catalog(search: Optional[str] = None, domain: Optional[str] = None):
    providers = provider_service.list_providers()
    schemas = schema_service.list_schemas()
    
    entries = [
        {
            "id": "cat-001",
            "title": "Tamil Nadu Commodity Prices & Arrivals",
            "domain": "PRICE",
            "provider": "State Agriculture Department Platform",
            "quality_score": 98.5,
            "access_level": "RESTRICTED",
            "freshness": "HOURLY"
        },
        {
            "id": "cat-002",
            "title": "ICAR Soil & Pest Research Database",
            "domain": "SOIL",
            "provider": "ICAR Central Research Institute",
            "quality_score": 96.0,
            "access_level": "PUBLIC",
            "freshness": "SEASONAL"
        }
    ]
    if domain:
        entries = [e for e in entries if e["domain"] == domain]
    if search:
        entries = [e for e in entries if search.lower() in e["title"].lower()]

    return {
        "catalog_entries": entries,
        "total_providers": len(providers),
        "total_canonical_schemas": len(schemas)
    }

@router.get("/providers")
def list_providers():
    return provider_service.list_providers()

@router.get("/consumers")
def list_consumers():
    return provider_service.list_consumers()

@router.get("/schemas")
def list_schemas():
    return schema_service.list_schemas()
