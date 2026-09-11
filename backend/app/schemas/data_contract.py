from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime


class DataContractCreate(BaseModel):
    contract_code: str
    provider_id: str
    consumer_id: str
    product_id: str
    purpose: str # ADVISORY, CREDIT, INSURANCE, RESEARCH, POLICY_ANALYSIS, MODEL_TRAINING
    scope: Optional[Dict[str, Any]] = None
    fields_allowed: Optional[List[str]] = None
    geography: Optional[str] = None
    time_range: Optional[Dict[str, Any]] = None
    frequency: Optional[str] = "ON_DEMAND"
    retention_days: Optional[int] = 90
    processing_permissions: Optional[List[str]] = None
    sharing_permissions: Optional[List[str]] = None
    consent_required: Optional[bool] = True
    security_requirements: Optional[Dict[str, Any]] = None


class DataContractResponse(DataContractCreate):
    id: str
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ConsentGrantRequest(BaseModel):
    farmer_ref: str
    consumer_id: str
    data_scope: List[str]
    purpose: str
    duration_days: int = 365


class ConsentRecordResponse(BaseModel):
    id: str
    farmer_ref: str
    consumer_id: str
    data_scope: List[str]
    purpose: str
    duration_days: int
    status: str # GRANTED, DENIED, WITHDRAWN, EXPIRED, REVOKED
    granted_at: datetime
    withdrawn_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None


class DataExchangeRequest(BaseModel):
    consumer_id: str
    product_id: str
    purpose: str
    requester_ref: str
    requested_fields: List[str]
    filters: Optional[Dict[str, Any]] = None
