from uuid import UUID

from fastapi import APIRouter, HTTPException, Query

from ...core.database import get_supabase
from ...schemas.domain import (
    CropCatalogResponse,
    CropResponse,
    CultivationCreate,
    CultivationResponse,
    FarmCreate,
    FarmResponse,
    ListingCreate,
    ListingResponse,
    ProduceLotCreate,
    ProduceLotResponse,
    ProfileCreate,
    ProfileResponse,
)

router = APIRouter(prefix="/core", tags=["core"])


def _single(result):
    data = result.data
    if not data:
        raise HTTPException(status_code=404, detail="Resource not found")
    return data[0] if isinstance(data, list) else data


@router.get("/crops", response_model=CropCatalogResponse)
def list_crops(search: str | None = Query(default=None, max_length=100)) -> CropCatalogResponse:
    query = get_supabase().table("crops").select("id,name,category").order("name")
    if search:
        query = query.ilike("name", f"%{search}%")
    result = query.execute()
    return CropCatalogResponse(items=[CropResponse(**row) for row in (result.data or [])])


@router.post("/profiles", response_model=ProfileResponse, status_code=201)
def create_profile(request: ProfileCreate) -> ProfileResponse:
    try:
        result = get_supabase().table("profiles").insert(request.model_dump(exclude_none=True)).execute()
        return ProfileResponse(**_single(result))
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Unable to create profile") from exc


@router.get("/profiles/{profile_id}", response_model=ProfileResponse)
def get_profile(profile_id: UUID) -> ProfileResponse:
    result = get_supabase().table("profiles").select("id,full_name,phone,role").eq("id", str(profile_id)).limit(1).execute()
    return ProfileResponse(**_single(result))


@router.post("/profiles/{profile_id}/farms", response_model=FarmResponse, status_code=201)
def create_farm(profile_id: UUID, request: FarmCreate) -> FarmResponse:
    payload = request.model_dump(exclude_none=True)
    payload["owner_id"] = str(profile_id)
    try:
        result = get_supabase().table("farms").insert(payload).execute()
        return FarmResponse(**_single(result))
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Unable to create farm") from exc


@router.get("/profiles/{profile_id}/farms", response_model=list[FarmResponse])
def list_farms(profile_id: UUID) -> list[FarmResponse]:
    result = get_supabase().table("farms").select("*").eq("owner_id", str(profile_id)).order("created_at", desc=True).execute()
    return [FarmResponse(**row) for row in (result.data or [])]


@router.post("/cultivations", response_model=CultivationResponse, status_code=201)
def create_cultivation(request: CultivationCreate) -> CultivationResponse:
    try:
        result = get_supabase().table("cultivations").insert(request.model_dump(exclude_none=True, mode="json")).execute()
        return CultivationResponse(**_single(result))
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Unable to create cultivation") from exc


@router.get("/cultivations", response_model=list[CultivationResponse])
def list_cultivations(farm_id: UUID | None = None, crop_id: UUID | None = None) -> list[CultivationResponse]:
    query = get_supabase().table("cultivations").select("*").order("created_at", desc=True)
    if farm_id:
        query = query.eq("farm_id", str(farm_id))
    if crop_id:
        query = query.eq("crop_id", str(crop_id))
    result = query.execute()
    return [CultivationResponse(**row) for row in (result.data or [])]


@router.post("/produce-lots", response_model=ProduceLotResponse, status_code=201)
def create_produce_lot(request: ProduceLotCreate, owner_id: UUID) -> ProduceLotResponse:
    payload = request.model_dump(exclude_none=True, mode="json")
    payload["owner_id"] = str(owner_id)
    if "available_quantity" not in payload:
        payload["available_quantity"] = payload["quantity"]
    try:
        result = get_supabase().table("produce_lots").insert(payload).execute()
        return ProduceLotResponse(**_single(result))
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Unable to create produce lot") from exc


@router.post("/listings", response_model=ListingResponse, status_code=201)
def create_listing(request: ListingCreate, seller_id: UUID) -> ListingResponse:
    payload = request.model_dump(mode="json")
    payload["seller_id"] = str(seller_id)
    try:
        result = get_supabase().table("listings").insert(payload).execute()
        return ListingResponse(**_single(result))
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Unable to create listing") from exc


@router.get("/listings", response_model=list[ListingResponse])
def list_listings(status: str = Query(default="active", max_length=30)) -> list[ListingResponse]:
    result = get_supabase().table("listings").select("*").eq("status", status).order("created_at", desc=True).execute()
    return [ListingResponse(**row) for row in (result.data or [])]
