import logging
from uuid import UUID, uuid4
import re

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile

from ...core.auth import AuthenticatedUser, get_current_user
from ...core.database import get_supabase, get_supabase_public
from ...schemas.domain import (
    CropCatalogResponse,
    CropResponse,
    CultivationCreate,
    CultivationResponse,
    FarmCreate,
    FarmResponse,
    FarmerCultivationRecordCreate,
    FarmerCultivationRecordResponse,
    FarmerDocumentResponse,
    HarvestBatchCreate,
    HarvestBatchResponse,
    ListingCreate,
    ListingResponse,
    ProduceLotCreate,
    ProduceLotResponse,
    ProfileCreate,
    ProfileResponse,
)

router = APIRouter(prefix="/core", tags=["core"])
logger = logging.getLogger(__name__)


def _single(result):
    data = result.data or []
    if not data:
        raise HTTPException(status_code=404, detail="Resource not found")
    return data[0] if isinstance(data, list) else data


def _owned_profile(user: AuthenticatedUser, profile_id: UUID) -> None:
    if user.id != profile_id:
        raise HTTPException(status_code=403, detail="Access denied")


@router.get("/crops", response_model=CropCatalogResponse)
def list_crops(search: str | None = Query(default=None, max_length=100)) -> CropCatalogResponse:
    query = get_supabase_public().table("crops").select("id,name,category").order("name")
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
        # Explicitly request the inserted representation so the API can return the
        # canonical row and the frontend can update without guessing a generated ID.
        result = get_supabase().table("farms").insert(payload).select("*").execute()
    except Exception as exc:
        # Keep the raw database exception in server logs, never expose credentials or
        # SQL internals to the browser. Map common failures to actionable messages.
        code = str(getattr(exc, "code", "") or "")
        logger.exception("Farm creation failed for authenticated profile %s (db_code=%s)", user.id, code or "unknown")
        if code in {"23503", "PGRST116"}:
            detail = "Your farmer profile could not be matched to this account. Sign out, sign in again, and retry."
            status_code = 409
        elif code in {"23514", "22P02"}:
            detail = "Please check the farm acreage and location details, then try again."
            status_code = 422
        elif code in {"PGRST204", "PGRST205", "42703", "42P01"}:
            detail = "The farm database schema is not ready on the AgriMark service. Please retry after the service is updated."
            status_code = 503
        elif type(exc).__name__ in {"ReadError", "ConnectError", "TimeoutException"}:
            detail = "The farm database is temporarily unreachable. Your form has not been confirmed as saved; please retry."
            status_code = 503
        else:
            detail = "AgriMark could not save this farm. Your details remain in the form; please retry."
            status_code = 500
        raise HTTPException(status_code=status_code, detail=detail) from exc

    try:
        return FarmResponse(**_single(result))
    except Exception as exc:
        logger.exception("Farm insert returned an unexpected response for profile %s", user.id)
        raise HTTPException(
            status_code=502,
            detail="AgriMark received an unexpected response after saving the farm. Refresh your farm list before retrying.",
        ) from exc


@router.get("/profiles/{profile_id}/farms", response_model=list[FarmResponse])
def list_farms(
    profile_id: UUID,
    user: AuthenticatedUser = Depends(get_current_user),
) -> list[FarmResponse]:
    _owned_profile(user, profile_id)
    result = get_supabase().table("farms").select("*").eq("owner_id", str(user.id)).order("created_at", desc=True).execute()
    return [FarmResponse(**row) for row in (result.data or [])]


@router.get("/cultivation-records", response_model=list[FarmerCultivationRecordResponse])
def list_farmer_cultivation_records(user: AuthenticatedUser = Depends(get_current_user)) -> list[FarmerCultivationRecordResponse]:
    result = (
        get_supabase().table("farmer_cultivation_records")
        .select("*,crops(name,category),farms(name,village,district)")
        .eq("farmer_id", str(user.id)).order("created_at", desc=True).execute()
    )
    items = []
    for row in result.data or []:
        item = dict(row)
        crop = item.pop("crops", None) or {}
        farm = item.pop("farms", None) or {}
        item.update({
            "crop_name": crop.get("name"),
            "crop_category": crop.get("category"),
            "farm_name": farm.get("name"),
            "farm_village": farm.get("village"),
            "farm_district": farm.get("district"),
        })
        items.append(FarmerCultivationRecordResponse(**item))
    return items


@router.post("/cultivation-records", response_model=FarmerCultivationRecordResponse, status_code=201)
def create_farmer_cultivation_record(
    request: FarmerCultivationRecordCreate,
    user: AuthenticatedUser = Depends(get_current_user),
) -> FarmerCultivationRecordResponse:
    farm_result = (
        get_supabase().table("farms").select("id,name,village,district")
        .eq("id", str(request.farm_id)).eq("owner_id", str(user.id)).limit(1).execute()
    )
    farm = _single(farm_result)
    crop_result = (
        get_supabase_public().table("crops").select("id,name,category")
        .eq("id", str(request.crop_id)).limit(1).execute()
    )
    crop = _single(crop_result)
    payload = request.model_dump(exclude_none=True, mode="json")
    payload["farmer_id"] = str(user.id)
    try:
        created = _single(
            get_supabase().table("farmer_cultivation_records").insert(payload).select("*").execute()
        )
    except Exception as exc:
        logger.exception("Cultivation record create failed for authenticated profile %s", user.id)
        raise HTTPException(status_code=400, detail="Unable to save cultivation record.") from exc
    return FarmerCultivationRecordResponse(
        **created,
        crop_name=crop.get("name"), crop_category=crop.get("category"),
        farm_name=farm.get("name"), farm_village=farm.get("village"), farm_district=farm.get("district"),
    )


@router.get("/documents", response_model=list[FarmerDocumentResponse])
def list_farmer_documents(user: AuthenticatedUser = Depends(get_current_user)) -> list[FarmerDocumentResponse]:
    result = (
        get_supabase().table("farmer_documents").select("*").eq("user_id", str(user.id))
        .order("created_at", desc=True).execute()
    )
    return [FarmerDocumentResponse(**row) for row in (result.data or [])]


@router.post("/documents/upload", response_model=FarmerDocumentResponse, status_code=201)
async def upload_farmer_document(
    doc_type: str = Form(..., max_length=120),
    doc_number: str | None = Form(default=None, max_length=160),
    issuing_authority: str | None = Form(default=None, max_length=200),
    farm_id: str | None = Form(default=None),
    file: UploadFile = File(...),
    user: AuthenticatedUser = Depends(get_current_user),
) -> FarmerDocumentResponse:
    allowed_mime_types = {"application/pdf", "image/jpeg", "image/png", "image/webp"}
    if file.content_type not in allowed_mime_types:
        raise HTTPException(status_code=415, detail="Upload a PDF, JPG, PNG, or WEBP document.")
    farm_uuid = None
    if farm_id:
        try:
            farm_uuid = UUID(farm_id)
        except ValueError as exc:
            raise HTTPException(status_code=422, detail="Select a valid farm.") from exc
        owned_farm = (
            get_supabase().table("farms").select("id").eq("id", str(farm_uuid))
            .eq("owner_id", str(user.id)).limit(1).execute()
        )
        _single(owned_farm)

    contents = await file.read(10 * 1024 * 1024 + 1)
    if not contents:
        raise HTTPException(status_code=422, detail="Choose a document file first.")
    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="The document must be smaller than 10 MB.")
    safe_name = re.sub(r"[^A-Za-z0-9._-]+", "_", file.filename or "document")[-120:] or "document"
    path = f"{user.id}/{uuid4()}-{safe_name}"
    storage = get_supabase().storage.from_("farmer-documents")
    try:
        storage.upload(path, contents, file_options={"content-type": file.content_type, "upsert": "false"})
        payload = {
            "user_id": str(user.id),
            "farm_id": str(farm_uuid) if farm_uuid else None,
            "doc_type": doc_type.strip(),
            "doc_number": doc_number.strip() if doc_number else None,
            "issuing_authority": issuing_authority.strip() if issuing_authority else None,
            "file_path": path,
            "file_name": file.filename or safe_name,
            "file_mime_type": file.content_type,
            "file_size_bytes": len(contents),
            "is_private": True,
            "verification_status": "unverified",
        }
        created = _single(get_supabase().table("farmer_documents").insert(payload).select("*").execute())
    except Exception as exc:
        try:
            storage.remove([path])
        except Exception:
            pass
        logger.exception("Private document upload failed for authenticated profile %s", user.id)
        raise HTTPException(status_code=500, detail="AgriMark could not save this document. Please retry.") from exc
    return FarmerDocumentResponse(**created)


@router.get("/documents/{document_id}/url")
def get_farmer_document_url(document_id: UUID, user: AuthenticatedUser = Depends(get_current_user)) -> dict[str, str]:
    document = (
        get_supabase().table("farmer_documents").select("id,file_path")
        .eq("id", str(document_id)).eq("user_id", str(user.id)).limit(1).execute()
    )
    row = _single(document)
    if not row.get("file_path"):
        raise HTTPException(status_code=404, detail="Document file not found.")
    try:
        signed = get_supabase().storage.from_("farmer-documents").create_signed_url(row["file_path"], 60)
        url = signed.get("signedURL") or signed.get("signedUrl")
        if not url:
            raise ValueError("Storage did not return a signed URL")
        return {"url": url}
    except Exception as exc:
        logger.exception("Private document URL generation failed for authenticated profile %s", user.id)
        raise HTTPException(status_code=500, detail="Unable to open this private document.") from exc


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
    query = get_supabase().table("cultivations").select("*,farms!inner(owner_id)").eq("farms.owner_id", str(user.id)).order("created_at", desc=True)
    if farm_id:
        query = query.eq("farm_id", str(farm_id))
    if crop_id:
        query = query.eq("crop_id", str(crop_id))
    result = query.execute()
    rows = [dict(row) for row in (result.data or [])]
    return [CultivationResponse(**{key: value for key, value in row.items() if key != "farms"}) for row in rows]


@router.get("/public/harvest-batches")
def list_public_harvest_batches() -> list[dict]:
    """Read-only public harvest data. Never exposes farm ownership details."""
    result = (
        get_supabase_public()
        .table("harvest_batches")
        .select("id,cultivation_id,harvested_at,quantity,unit,grade,trace_code")
        .order("harvested_at", desc=True)
        .limit(200)
        .execute()
    )
    return [
        {
            "id": row["id"],
            "cultivation_id": row["cultivation_id"],
            "harvest_date": str(row["harvested_at"])[:10],
            "total_quantity_kg": row["quantity"],
            "quality_grade": row["grade"],
            "trace_code": row["trace_code"],
        }
        for row in (result.data or [])
    ]


@router.get("/public/produce-lots")
def list_public_produce_lots() -> list[dict]:
    """Read-only public stock data. Farm owner IDs are intentionally excluded."""
    result = (
        get_supabase_public()
        .table("produce_lots")
        .select("id,cultivation_id,crop_id,quantity,unit,quality_grade,available_quantity,harvested_at,status,is_listed,crops(name)")
        .order("created_at", desc=True)
        .limit(200)
        .execute()
    )
    items = []
    for row in (result.data or []):
        crop = row.get("crops")
        item = dict(row)
        item.pop("crops", None)
        item["crop_name"] = crop.get("name") if isinstance(crop, dict) else None
        items.append(item)
    return items


@router.get("/harvest-batches", response_model=list[HarvestBatchResponse])
def list_harvest_batches(
    user: AuthenticatedUser = Depends(get_current_user),
) -> list[HarvestBatchResponse]:
    farms = get_supabase().table("farms").select("id").eq("owner_id", str(user.id)).execute()
    farm_ids = [row["id"] for row in (farms.data or [])]
    if not farm_ids:
        return []

    result = (
        get_supabase()
        .table("harvest_batches")
        .select("id,cultivation_id,harvested_at,quantity,grade,trace_code")
        .in_("farm_id", farm_ids)
        .order("harvested_at", desc=True)
        .execute()
    )
    return [
        HarvestBatchResponse(
            id=row["id"],
            cultivation_id=row["cultivation_id"],
            harvest_date=str(row["harvested_at"])[:10],
            total_quantity_kg=row["quantity"],
            quality_grade=row["grade"],
            trace_code=row["trace_code"],
        )
        for row in (result.data or [])
    ]


@router.post("/harvest-batches", response_model=HarvestBatchResponse, status_code=201)
def create_harvest_batch(
    request: HarvestBatchCreate,
    user: AuthenticatedUser = Depends(get_current_user),
) -> HarvestBatchResponse:
    cultivation = (
        get_supabase()
        .table("cultivations")
        .select("id,farm_id")
        .eq("id", str(request.cultivation_id))
        .limit(1)
        .execute()
    )
    cultivation_row = _single(cultivation)

    farm = (
        get_supabase()
        .table("farms")
        .select("id")
        .eq("id", cultivation_row["farm_id"])
        .eq("owner_id", str(user.id))
        .limit(1)
        .execute()
    )
    _single(farm)

    payload = {
        "cultivation_id": str(request.cultivation_id),
        "farm_id": cultivation_row["farm_id"],
        "harvested_at": request.harvest_date.isoformat(),
        "quantity": request.total_quantity_kg,
        "unit": "kg",
        "grade": request.quality_grade,
    }
    try:
        created = _single(get_supabase().table("harvest_batches").insert(payload).execute())
        return HarvestBatchResponse(
            id=created["id"],
            cultivation_id=created["cultivation_id"],
            harvest_date=str(created["harvested_at"])[:10],
            total_quantity_kg=created["quantity"],
            quality_grade=created["grade"],
            trace_code=created["trace_code"],
        )
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Unable to create harvest batch") from exc


@router.get("/produce-lots", response_model=list[ProduceLotResponse])
def list_produce_lots(
    user: AuthenticatedUser = Depends(get_current_user),
) -> list[ProduceLotResponse]:
    result = (
        get_supabase()
        .table("produce_lots")
        .select("*")
        .eq("owner_id", str(user.id))
        .order("created_at", desc=True)
        .execute()
    )
    return [ProduceLotResponse(**row) for row in (result.data or [])]


@router.post("/produce-lots", response_model=ProduceLotResponse, status_code=201)
def create_produce_lot(
    request: ProduceLotCreate,
    user: AuthenticatedUser = Depends(get_current_user),
) -> ProduceLotResponse:
    if request.cultivation_id:
        cultivation = get_supabase().table("cultivations").select("id,farm_id").eq("id", str(request.cultivation_id)).limit(1).execute()
        cultivation_row = _single(cultivation)
        farm = get_supabase().table("farms").select("id").eq("id", cultivation_row["farm_id"]).eq("owner_id", str(user.id)).limit(1).execute()
        _single(farm)

    payload = request.model_dump(exclude_none=True, mode="json")
    payload["owner_id"] = str(user.id)
    if "available_quantity" not in payload or payload["available_quantity"] is None:
        payload["available_quantity"] = payload["quantity"]
    if request.cultivation_id:
        cultivation_row = get_supabase().table("cultivations").select("farm_id").eq("id", str(request.cultivation_id)).limit(1).execute().data[0]
        payload["cultivation_id"] = str(request.cultivation_id)
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
    lot = get_supabase().table("produce_lots").select("id,status").eq("id", str(request.lot_id)).eq("owner_id", str(user.id)).limit(1).execute()
    lot_data = _single(lot)

    if lot_data.get("status") == "listed":
        raise HTTPException(status_code=400, detail="Produce lot is already listed")

    payload = request.model_dump(mode="json")
    payload["seller_id"] = str(user.id)
    try:
        result = get_supabase().table("listings").insert(payload).execute()
        created = _single(result)
        try:
            get_supabase().table("produce_lots").update({"status": "listed"}).eq("id", str(request.lot_id)).execute()
        except Exception as lot_exc:
            get_supabase().table("listings").delete().eq("id", created["id"]).execute()
            raise lot_exc
        return ListingResponse(**created)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Unable to create listing") from exc


@router.get("/listings", response_model=list[ListingResponse])
def list_listings(status: str = Query(default="active", max_length=30)) -> list[ListingResponse]:
    result = get_supabase_public().table("listings").select("*").eq("status", status).order("created_at", desc=True).execute()
    items = []
    for row in (result.data or []):
        item = dict(row)
        if item.get("lot_id"):
            try:
                lot_res = get_supabase_public().table("produce_lots").select("*,crops(name)").eq("id", item["lot_id"]).limit(1).execute()
                if lot_res.data:
                    lot_row = lot_res.data[0]
                    crop = lot_row.get("crops")
                    item["crop_name"] = crop.get("name") if isinstance(crop, dict) else item.get("title")
                    item["quality_grade"] = lot_row.get("quality_grade")
                    item["quantity_available_kg"] = lot_row.get("available_quantity")
            except Exception:
                pass
        item["price_per_kg"] = item.get("price_per_unit")
        items.append(ListingResponse(**item))
    return items
