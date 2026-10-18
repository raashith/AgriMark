import logging
import re
from datetime import date
from pathlib import Path
from uuid import UUID, uuid4

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
    FarmerCultivationCreate,
    FarmerCultivationResponse,
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
    # Pydantic Decimal values (notably area_acres) must be converted to JSON-safe
    # primitives before the Supabase/PostgREST client serializes the insert body.
    payload = request.model_dump(exclude_none=True, mode="json")
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



@router.get("/farmer-cultivations", response_model=list[FarmerCultivationResponse])
def list_farmer_cultivations(
    farm_id: UUID | None = None,
    user: AuthenticatedUser = Depends(get_current_user),
) -> list[FarmerCultivationResponse]:
    query = (
        get_supabase()
        .table("farmer_cultivation_records")
        .select("*,crops(name)")
        .eq("farmer_id", str(user.id))
        .order("created_at", desc=True)
    )
    if farm_id:
        query = query.eq("farm_id", str(farm_id))
    result = query.execute()
    items = []
    for raw_row in (result.data or []):
        row = dict(raw_row)
        crop = row.pop("crops", None)
        row["crop_name"] = crop.get("name") if isinstance(crop, dict) else None
        items.append(FarmerCultivationResponse(**row))
    return items


@router.post("/farmer-cultivations", response_model=FarmerCultivationResponse, status_code=201)
def create_farmer_cultivation(
    request: FarmerCultivationCreate,
    user: AuthenticatedUser = Depends(get_current_user),
) -> FarmerCultivationResponse:
    farm_result = (
        get_supabase()
        .table("farms")
        .select("id")
        .eq("id", str(request.farm_id))
        .eq("owner_id", str(user.id))
        .limit(1)
        .execute()
    )
    if not farm_result.data:
        raise HTTPException(status_code=403, detail="Select a farm that belongs to your account.")

    crop_result = (
        get_supabase()
        .table("crops")
        .select("id,name")
        .eq("id", str(request.crop_id))
        .limit(1)
        .execute()
    )
    if not crop_result.data:
        raise HTTPException(status_code=422, detail="Select a valid crop from the crop catalog.")

    payload = request.model_dump(exclude_none=True, mode="json")
    payload["farmer_id"] = str(user.id)
    # Store crop and seed labels alongside stable catalog IDs for reporting/export.
    if request.crop_name:
        payload["crop_name"] = request.crop_name.strip()
    else:
        payload["crop_name"] = crop_result.data[0].get("name")
    if request.seed_variety:
        payload["seed_variety"] = request.seed_variety.strip()
    # Persist richer cultivation data through the canonical farmer record table.
    if request.organic_practice is not None:
        payload["organic_practice"] = request.organic_practice
    if request.budget_inr is not None:
        payload["budget_inr"] = str(request.budget_inr)
    if request.agronomy_notes is not None:
        payload["agronomy_notes"] = request.agronomy_notes
    try:
        result = (
            get_supabase()
            .table("farmer_cultivation_records")
            .insert(payload)
            .select("*,crops(name)")
            .execute()
        )
        row = dict(_single(result))
        crop = row.pop("crops", None)
        row["crop_name"] = crop.get("name") if isinstance(crop, dict) else (row.get("crop_name") or crop_result.data[0].get("name"))
        row["seed_variety"] = row.get("seed_variety") or row.get("variety")
        return FarmerCultivationResponse(**row)
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Cultivation record creation failed for profile %s", user.id)
        raise HTTPException(
            status_code=503,
            detail="AgriMark could not save the cultivation record. Please retry.",
        ) from exc


_ALLOWED_DOCUMENT_MIME_TYPES = {
    "application/pdf": "pdf",
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
}
_MAX_DOCUMENT_SIZE = 10 * 1024 * 1024
_ALLOWED_DOCUMENT_TYPES = {
    "Land Record (Patta/Chitta)",
    "Aadhaar ID",
    "Kisan Credit Card",
    "Soil Test Report",
    "Organic Certification",
    "FPO Membership",
    "Trade License",
}


def _valid_document_signature(content_type: str, content: bytes) -> bool:
    if content_type == "application/pdf":
        return content.startswith(b"%PDF-")
    if content_type == "image/jpeg":
        return content.startswith(b"\\xff\\xd8\\xff")
    if content_type == "image/png":
        return content.startswith(b"\\x89PNG\\r\\n\\x1a\\n")
    if content_type == "image/webp":
        return len(content) >= 12 and content[:4] == b"RIFF" and content[8:12] == b"WEBP"
    return False


@router.get("/documents", response_model=list[FarmerDocumentResponse])
def list_farmer_documents(
    user: AuthenticatedUser = Depends(get_current_user),
) -> list[FarmerDocumentResponse]:
    result = (
        get_supabase()
        .table("farmer_documents")
        .select("*")
        .eq("user_id", str(user.id))
        .order("created_at", desc=True)
        .execute()
    )
    return [FarmerDocumentResponse(**row) for row in (result.data or [])]


@router.post("/documents", response_model=FarmerDocumentResponse, status_code=201)
async def upload_farmer_document(
    file: UploadFile = File(...),
    doc_type: str = Form(...),
    doc_number: str | None = Form(default=None),
    issuing_authority: str | None = Form(default=None),
    farm_id: UUID | None = Form(default=None),
    issue_date: date | None = Form(default=None),
    expiry_date: date | None = Form(default=None),
    description: str | None = Form(default=None),
    user: AuthenticatedUser = Depends(get_current_user),
) -> FarmerDocumentResponse:
    if doc_type not in _ALLOWED_DOCUMENT_TYPES:
        raise HTTPException(status_code=422, detail="Select a supported document type.")
    content_type = (file.content_type or "").lower().strip()
    if content_type not in _ALLOWED_DOCUMENT_MIME_TYPES:
        raise HTTPException(status_code=415, detail="Upload a PDF, JPG, PNG, or WebP document.")
    content = await file.read(_MAX_DOCUMENT_SIZE + 1)
    if not content:
        raise HTTPException(status_code=422, detail="The selected document is empty.")
    if len(content) > _MAX_DOCUMENT_SIZE:
        raise HTTPException(status_code=413, detail="Documents must be 10 MB or smaller.")
    if not _valid_document_signature(content_type, content):
        raise HTTPException(status_code=415, detail="The file contents do not match the selected document type.")

    if farm_id:
        farm = (
            get_supabase()
            .table("farms")
            .select("id")
            .eq("id", str(farm_id))
            .eq("owner_id", str(user.id))
            .limit(1)
            .execute()
        )
        if not farm.data:
            raise HTTPException(status_code=403, detail="Select a farm that belongs to your account.")

    original_name = Path(file.filename or "document").name
    display_name = original_name[:255] or "document"
    safe_name = re.sub(r"[^a-zA-Z0-9._-]", "_", original_name).strip("._")[-120:] or "document"
    object_path = f"{user.id}/{uuid4()}-{safe_name}"
    storage = get_supabase().storage.from_("farmer-documents")

    try:
        storage.upload(
            object_path,
            content,
            {
                "content-type": content_type,
                "cache-control": "3600",
                "upsert": "false",
            },
        )
    except Exception as exc:
        logger.exception("Private document upload failed for profile %s", user.id)
        raise HTTPException(status_code=503, detail="The private document store is unavailable. Please retry.") from exc

    payload = {
        "user_id": str(user.id),
        "farm_id": str(farm_id) if farm_id else None,
        "doc_type": doc_type,
        "doc_number": (doc_number or "").strip() or None,
        "issuing_authority": (issuing_authority or "").strip() or "Revenue Department",
        "issue_date": issue_date.isoformat() if issue_date else None,
        "expiry_date": expiry_date.isoformat() if expiry_date else None,
        "description": (description or "").strip() or None,
        "document_date": issue_date.isoformat() if issue_date else None,
        "verification_status": "unverified",
        "file_path": object_path,
        "file_name": display_name,
        "file_mime_type": content_type,
        "file_size_bytes": len(content),
        "is_private": True,
    }
    try:
        result = (
            get_supabase()
            .table("farmer_documents")
            .insert(payload)
            .select("*")
            .execute()
        )
        return FarmerDocumentResponse(**_single(result))
    except Exception as exc:
        try:
            storage.remove([object_path])
        except Exception:
            logger.warning("Uploaded document orphan cleanup failed for profile %s", user.id)
        logger.exception("Document metadata save failed for profile %s", user.id)
        raise HTTPException(
            status_code=503,
            detail="The document file was received, but its record could not be saved. Please retry.",
        ) from exc


@router.get("/documents/{document_id}/download-url")
def create_farmer_document_download_url(
    document_id: UUID,
    user: AuthenticatedUser = Depends(get_current_user),
) -> dict[str, str]:
    result = (
        get_supabase()
        .table("farmer_documents")
        .select("id,file_path")
        .eq("id", str(document_id))
        .eq("user_id", str(user.id))
        .limit(1)
        .execute()
    )
    row = _single(result)
    if not row.get("file_path"):
        raise HTTPException(status_code=404, detail="No file is attached to this document record.")
    try:
        link = get_supabase().storage.from_("farmer-documents").create_signed_url(row["file_path"], 60)
        url = link.get("signedURL") or link.get("signedUrl")
        if not url:
            raise ValueError("Storage did not return a signed URL")
        return {"url": str(url)}
    except Exception as exc:
        logger.exception("Signed document link creation failed for profile %s", user.id)
        raise HTTPException(status_code=503, detail="Unable to open this private document right now.") from exc


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
        # Pydantic parses this as Decimal; convert before the PostgREST client
        # attempts JSON serialization, matching the farm-acreage fix.
        "quantity": str(request.total_quantity_kg),
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
        logger.exception("Harvest batch creation failed for profile %s (cultivation_id=%s)", user.id, request.cultivation_id)
        raise HTTPException(status_code=500, detail="AgriMark could not save this harvest batch. Please retry.") from exc


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
