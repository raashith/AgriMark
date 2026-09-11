from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime


class DataProviderBase(BaseModel):
    provider_id: str
    name: str
    type: str # GOVERNMENT, RESEARCH, FPO, PRIVATE_COMPANY, BANK, INSURER, DEVICE, SATELLITE, WEATHER, etc.
    jurisdiction: Optional[str] = "IN"
    ownership: Optional[str] = None
    authority: Optional[str] = None
    contact: Optional[Dict[str, Any]] = None
    data_domains: Optional[List[str]] = None
    api_capabilities: Optional[Dict[str, Any]] = None
    trust_level: Optional[str] = "UNVERIFIED"
    legal_basis: Optional[str] = None
    consent_requirements: Optional[str] = None
    status: Optional[str] = "ACTIVE"


class DataProviderCreate(DataProviderBase):
    pass


class DataProviderResponse(DataProviderBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class DataConsumerBase(BaseModel):
    consumer_id: str
    name: str
    organization: Optional[str] = None
    purpose_declarations: Optional[List[str]] = None
    permissions: Optional[List[str]] = None
    retention_days: Optional[int] = 365
    allowed_transformations: Optional[List[str]] = None
    audit_state: Optional[str] = "COMPLIANT"


class DataConsumerCreate(DataConsumerBase):
    pass


class DataConsumerResponse(DataConsumerBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class DataProductBase(BaseModel):
    product_code: str
    title: str
    owner_id: str
    provider_id: str
    schema_ref: str
    version: Optional[str] = "1.0.0"
    quality_score: Optional[float] = 95.0
    freshness_tier: Optional[str] = "HOURLY"
    coverage_geo: Optional[str] = None
    license_type: Optional[str] = "RESTRICTED"
    access_policy: Optional[Dict[str, Any]] = None
    pricing_model: Optional[str] = "FREE"
    provenance_summary: Optional[str] = None


class DataProductCreate(DataProductBase):
    pass


class DataProductResponse(DataProductBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True


class DataQualityReport(BaseModel):
    product_id: str
    overall_score: float
    completeness_score: float
    accuracy_score: float
    timeliness_score: float
    consistency_score: float
    validity_score: float
    quality_flags: List[str] = []


class SemanticAliasQuery(BaseModel):
    term: str
    domain: str = "CROP"
    language: Optional[str] = "en"


class UnitNormalizationRequest(BaseModel):
    value: float
    unit: str
    target_unit: Optional[str] = None
