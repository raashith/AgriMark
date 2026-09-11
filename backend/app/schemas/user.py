from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, ConfigDict


class RoleSchema(BaseModel):
    id: str
    name: str
    description: Optional[str] = None

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
    role: RoleSchema
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
