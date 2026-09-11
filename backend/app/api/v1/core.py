from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query

from ...core.auth import AuthenticatedUser, get_current_user
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


def _owned_profile(user: AuthenticatedUser, profile_id: UUID) -> None:
    if user.id != profile_id:
        raise HTTPException(status_code=403, detail="Access denied")


@router.get("/crops", response_model=CropCatalogResponse)
def list_crops(search: str | None = Query(default=None, max_length=100)) -> CropCatalogResponse:
    query = get_supabase().table("crops").select("id,name,category").order("name")
    if search:
        query = query.ilike("name", f"%{search}%")
    result = query.execute()
    return CropCatalogResponse(items=[CropResponse(**row) for row in (result.data or [])])


@router.post("/profiles", response_model=ProfileResponse, status_code=201)
def create_profile(
    request: ProfileCreate,
    user: AuthenticatedUser = Depends(get_current_user),
) -> ProfileResponse:
    payload = request.model_dump(exclude_none=True)
    payload["id"] = str(user.id)
    payload["role"] = request.role if user.role == "service_role" else "farmer"
    try:
        result = get_supabase().table("profiles").upsert(payload).execute()
        return ProfileResponse(**_single(result))
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Unable to create profile") from exc


@router.get("/profiles/{profile_id}", response_model=ProfileResponse)
def get_profile(
    profile_id: UUID,
    user: AuthenticatedUser = Depends(get_current_user),
) -> ProfileResponse:
    _owned_profile(user, profile_id)
    result = get_supabase().table("profiles").select("id,full_name,phone,role").eq("id", str(profile_id)).limit(1).execute()
    return ProfileResponse(**_single(result))


@router.post("/profiles/{profile_id}/farms", response_model=FarmResponse, status_code=201)
def create_farm(
    profile_id: UUID,
    request: FarmCreate,
    user: AuthenticatedUser = Depends(get_current_user),
) -> FarmResponse:
    _owned_profile(user, profile_id)
    payload = request.model_dump(exclude_none=True)
    payload["owner_id"] = str(user.id)
    try:
        result = get_supabase().table("farms").insert(payload).execute()
        return FarmResponse(**_single(result))
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Unable to create farm") from exc


@router.get("/profiles/{profile_id}/farms", response_model=list[FarmResponse])
def list_farms(
    profile_id: UUID,
    user: AuthenticatedUser = Depends(get_current_user),
) -> list[FarmResponse]:
    _owned_profile(user, profile_id)
    result = get_supabase().table("farms").select("*").eq("owner_id", str(user.id)).order("created_at", desc=True).execute()
    return [FarmResponse(**row) for row in (result.data or [])]


@router.post("/cultivations", response_model=CultivationResponse, status_code=201)
def create_cultivation(
    request: CultivationCreate,
    user: AuthenticatedUser = Depends(get_current_user),
) -> CultivationResponse:
    farm = get_supabase().table("farms").select("id").eq("id", str(request.farm_id)).eq("owner_id", str(user.id)).limit(1).execute()
    _single(farm)
    try:
        result = get_supabase().table("cultivations").insert(request.model_dump(exclude_none=True, mode="json")).execute()
        return CultivationResponse(**_single(result))
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Unable to create cultivation") from exc


@router.get("/cultivations", response_model=list[CultivationResponse])
def list_cultivations(
    farm_id: UUID | None = None,
    crop_id: UUID | None = None,
    user: AuthenticatedUser = Depends(get_current_user),
) -> list[CultivationResponse]:
    query = get_supabase().table("cultivations").select("*, farms!inner(owner_id)").eq("farms.owner_id", str(user.id)).order("created_at", desc=True)
    if farm_id:
        query = query.eq("farm_id", str(farm_id))
    if crop_id:
        query = query.eq("crop_id", str(crop_id))
    result = query.execute()
    rows = [dict(row) for row in (result.data or [])]
    return [CultivationResponse(**{key: value for key, value in row.items() if key != "farms"}) for row in rows]


@router.post("/produce-lots", response_model=ProduceLotResponse, status_code=201)
def create_produce_lot(
    request: ProduceLotCreate,
    user: AuthenticatedUser = Depends(get_current_user),
) -> ProduceLotResponse:
    if request.cultivation_id:
        cultivation = get_supabase().table("cultivations").select("id, farms!inner(owner_id)").eq("id", str(request.cultivation_id)).eq("farms.owner_id", str(user.id)).limit(1).execute()
        _single(cultivation)
    payload = request.model_dump(exclude_none=True, mode="json")
    payload["owner_id"] = str(user.id)
    if "available_quantity" not in payload:
        payload["available_quantity"] = payload["quantity"]
    try:
        result = get_supabase().table("produce_lots").insert(payload).execute()
        return ProduceLotResponse(**_single(result))
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Unable to create produce lot") from exc


@router.post("/listings", response_model=ListingResponse, status_code=201)
def create_listing(
    request: ListingCreate,
    user: AuthenticatedUser = Depends(get_current_user),
) -> ListingResponse:
    lot = get_supabase().table("produce_lots").select("id").eq("id", str(request.lot_id)).eq("owner_id", str(user.id)).limit(1).execute()
    _single(lot)
    payload = request.model_dump(mode="json")
    payload["seller_id"] = str(user.id)
    try:
        result = get_supabase().table("listings").insert(payload).execute()
        return ListingResponse(**_single(result))
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Unable to create listing") from exc


@router.get("/listings", response_model=list[ListingResponse])
def list_listings(status: str = Query(default="active", max_length=30)) -> list[ListingResponse]:
    result = get_supabase().table("listings").select("*").eq("status", status).order("created_at", desc=True).execute()
    return [ListingResponse(**row) for row in (result.data or [])]
