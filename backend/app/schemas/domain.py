from datetime import date, datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, Field


class ProfileCreate(BaseModel):
    full_name: str | None = None
    phone: str | None = None
    role: str = "farmer"


class ProfileResponse(ProfileCreate):
    id: UUID
    needs_onboarding: bool = False


class FarmCreate(BaseModel):
    name: str | None = None
    village: str | None = None
    district: str | None = None
    state: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    area_acres: Decimal | None = Field(default=None, ge=0)
    soil_type: str | None = None
    irrigation_source: str | None = None


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


class HarvestBatchCreate(BaseModel):
    cultivation_id: UUID
    harvest_date: date
    total_quantity_kg: Decimal = Field(gt=0)
    quality_grade: str


class HarvestBatchResponse(HarvestBatchCreate):
    id: UUID
    trace_code: str


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



class FarmerCultivationCreate(BaseModel):
    farm_id: UUID
    crop_id: UUID
    variety: str | None = Field(default=None, max_length=160)
    crop_name: str | None = Field(default=None, max_length=160)
    seed_variety: str | None = Field(default=None, max_length=160)
    season: str = Field(default="Kharif", max_length=40)
    sowing_date: date | None = None
    expected_harvest_date: date | None = None
    area_acres: Decimal = Field(gt=0)
    expected_yield_kg: Decimal | None = Field(default=None, ge=0)
    status: str = Field(default="planned", max_length=30)
    notes: str | None = Field(default=None, max_length=4000)
    organic_practice: bool | None = None
    budget_inr: Decimal | None = Field(default=None, ge=0)
    agronomy_notes: str | None = Field(default=None, max_length=4000)


class FarmerCultivationResponse(BaseModel):
    id: UUID
    farmer_id: UUID
    farm_id: UUID
    crop_id: UUID
    variety: str | None = None
    season: str | None = None
    sowing_date: date | None = None
    expected_harvest_date: date | None = None
    area_acres: Decimal | None = None
    expected_yield_kg: Decimal | None = None
    status: str = "planned"
    notes: str | None = None
    crop_name: str | None = None
    seed_variety: str | None = None
    organic_practice: bool = False
    budget_inr: Decimal | None = None
    agronomy_notes: str | None = None
    created_at: datetime | None = None


class FarmerDocumentResponse(BaseModel):
    id: UUID
    user_id: UUID
    farm_id: UUID | None = None
    doc_type: str
    doc_number: str | None = None
    issuing_authority: str | None = None
    issue_date: date | None = None
    expiry_date: date | None = None
    description: str | None = None
    document_date: date | None = None
    tags: list[str] = Field(default_factory=list)
    verification_status: str = "unverified"
    file_path: str | None = None
    file_name: str | None = None
    file_mime_type: str | None = None
    file_size_bytes: int | None = None
    extracted_info: str | None = None
    is_private: bool = True
    created_at: datetime | None = None
