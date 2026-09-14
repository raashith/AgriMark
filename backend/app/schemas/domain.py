from datetime import date
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, Field


class ProfileCreate(BaseModel):
    full_name: str | None = None
    phone: str | None = None
    role: str = "farmer"


class ProfileResponse(ProfileCreate):
    id: UUID


class FarmCreate(BaseModel):
    name: str | None = None
    village: str | None = None
    district: str | None = None
    state: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    area_acres: Decimal | None = Field(default=None, ge=0)


class FarmResponse(FarmCreate):
    id: UUID
    owner_id: UUID


class CropResponse(BaseModel):
    id: UUID
    name: str
    category: str | None = None


class CultivationCreate(BaseModel):
    farm_id: UUID
    crop_id: UUID
    season: str | None = None
    sowing_date: date | None = None
    expected_harvest_date: date | None = None
    area_acres: Decimal | None = Field(default=None, ge=0)
    status: str = "planned"


class CultivationResponse(CultivationCreate):
    id: UUID


class ProduceLotCreate(BaseModel):
    cultivation_id: UUID | None = None
    crop_id: UUID
    quantity: Decimal = Field(ge=0)
    unit: str = "kg"
    quality_grade: str | None = None
    available_quantity: Decimal | None = Field(default=None, ge=0)
    harvested_at: date | None = None


class ProduceLotResponse(ProduceLotCreate):
    id: UUID
    owner_id: UUID
    status: str


class ListingCreate(BaseModel):
    lot_id: UUID
    title: str
    price_per_unit: Decimal = Field(ge=0)
    currency: str = "INR"
    min_order_quantity: Decimal = Field(default=1, gt=0)


class ListingResponse(ListingCreate):
    id: UUID
    seller_id: UUID
    status: str
    crop_name: str | None = None
    quality_grade: str | None = None
    price_per_kg: Decimal | None = None
    quantity_available_kg: Decimal | None = None
    seller_name: str | None = None
    location: str | None = None



class CropCatalogResponse(BaseModel):
    items: list[CropResponse]
