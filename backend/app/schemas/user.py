from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, ConfigDict


class RoleSchema(BaseModel):
    id: str
    name: str
    description: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class FarmerProfileSummary(BaseModel):
    id: str
    fpo_member_id: Optional[str] = None
    experience_years: int = 0
    primary_crops: Optional[str] = None
    verification_status: str = "unverified"

    model_config = ConfigDict(from_attributes=True)


class BuyerProfileSummary(BaseModel):
    id: str
    business_name: Optional[str] = None
    buyer_type: str = "individual"
    gstin: Optional[str] = None
    delivery_address: Optional[str] = None
    verification_status: str = "unverified"

    model_config = ConfigDict(from_attributes=True)


class UserBase(BaseModel):
    phone: str = Field(..., min_length=10, max_length=15)
    email: Optional[EmailStr] = None
    full_name: str = Field(..., min_length=2, max_length=100)
    preferred_language: Optional[str] = "en"


class UserCreate(UserBase):
    password: str = Field(..., min_length=6, max_length=100)
    role_name: str = Field("farmer", description="Role: farmer, buyer, admin, or fpo")


class UserResponse(UserBase):
    id: str
    auth_user_id: Optional[str] = None
    profile_id: Optional[str] = None
    role: RoleSchema
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UserMeResponse(BaseModel):
    auth_user_id: Optional[str]
    application_user_id: str
    profile_id: Optional[str]
    email: Optional[str]
    phone: str
    full_name: str
    role: str
    status: str
    preferred_language: Optional[str] = "en"
    farmer_profile: Optional[FarmerProfileSummary] = None
    buyer_profile: Optional[BuyerProfileSummary] = None

    model_config = ConfigDict(from_attributes=True)
