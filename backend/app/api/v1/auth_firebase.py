from uuid import uuid4

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

from ...core.database import get_supabase
from ...core.firebase_auth import verify_firebase_id_token
from ...schemas.domain import ProfileResponse

router = APIRouter(prefix="/auth/firebase", tags=["auth-firebase"])


class FirebaseSyncRequest(BaseModel):
    id_token: str
    firebase_uid: str
    email: str | None = None
    phone: str | None = None
    full_name: str | None = None
    requested_role: str | None = "farmer"


@router.post("/sync")
def sync_firebase_profile(request: FirebaseSyncRequest):
    try:
        decoded = verify_firebase_id_token(request.id_token)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired Firebase ID token",
        ) from exc

    uid = str(decoded.get("uid") or "")
    if not uid or uid != request.firebase_uid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Firebase identity mismatch",
        )

    if request.requested_role == "admin":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Self-registration as admin is prohibited.",
        )

    allowed_roles = {"farmer", "buyer", "fpo", "logistics", "service_provider"}
    role = request.requested_role if request.requested_role in allowed_roles else "farmer"

    email = request.email or decoded.get("email")
    phone = request.phone or decoded.get("phone_number")
    full_name = request.full_name or decoded.get("name")

    client = get_supabase()

    # The sync endpoint is server-side only, so it must use the service-role client.
    # The RPC is preferred because it creates the profile + Firebase identity atomically.
    try:
        rpc_res = (
            client.rpc(
                "ensure_firebase_identity",
                {
                    "p_firebase_uid": uid,
                    "p_email": email,
                    "p_full_name": full_name,
                    "p_phone": phone,
                    "p_requested_role": role,
                },
            )
            .execute()
        )
    except Exception as exc:
        # Surface the real infrastructure failure instead of hiding it behind
        # the misleading "unable to create profile" fallback.
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AgriMark profile service is temporarily unavailable. Please try again.",
        ) from exc

    if not rpc_res.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="AgriMark profile service returned no profile.",
        )

    profile = rpc_res.data[0] if isinstance(rpc_res.data, list) else rpc_res.data

    # Depending on the deployed RPC revision, it may return either a profile
    # record or only the profile UUID. Normalize the UUID shape when necessary.
    if isinstance(profile, str):
        profile_id = profile
        profile_result = (
            client.table("profiles")
            .select("id,full_name,phone,role")
            .eq("id", profile_id)
            .limit(1)
            .execute()
        )
        if not profile_result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="AgriMark profile could not be loaded after synchronization.",
            )
        profile = profile_result.data[0]

    has_name = bool(profile.get("full_name") and str(profile.get("full_name")).strip())

    try:
        return {
            "user": ProfileResponse(**profile, needs_onboarding=not has_name).model_dump(),
        }
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="AgriMark profile data is invalid.",
        ) from exc
