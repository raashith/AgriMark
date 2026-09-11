from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime


class OrganizationCreate(BaseModel):
    org_code: str
    name: str
    type: str # STARTUP, RESEARCHER, UNIVERSITY, KVK, FPO, NGO, GOVT, ENTERPRISE, MODEL_PROVIDER, etc.
    legal_metadata: Optional[Dict[str, Any]] = None
    contact_info: Optional[Dict[str, Any]] = None


class SandboxProjectCreate(BaseModel):
    project_code: str
    title: str
    org_id: str
    owner_id: str
    purpose: str
    crop_domains: Optional[List[str]] = None
    geography: Optional[str] = "Tamil Nadu"


class SandboxProjectResponse(SandboxProjectCreate):
    id: str
    environment: str # Default SANDBOX
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class SyntheticDataRequest(BaseModel):
    domain: str # FARMS, CROPS, PRICES, MARKETS, ORDERS, YIELDS, WEATHER, DISEASE, PEST, IRRIGATION, LOGISTICS
    count: int = 10
    crop_name: Optional[str] = "TOMATO"
    district: Optional[str] = "Salem"


class BenchmarkRunRequest(BaseModel):
    benchmark_code: str
    model_code: str
    dataset_version: Optional[str] = "v1.0"
    language: Optional[str] = "ta" # Tamil default evaluation


class PromotionRequestCreate(BaseModel):
    project_id: str
    target_environment: str # VALIDATION, STAGING, PILOT, PRODUCTION
    justification: str
    evidence_links: List[str]
