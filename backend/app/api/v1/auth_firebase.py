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

    identity_result = (
        get_supabase()
        .table("firebase_identities")
        .select("profile_id,email")
        .eq("firebase_uid", uid)
        .limit(1)
        .execute()
    )

    if identity_result.data:
        profile_id = identity_result.data[0]["profile_id"]
    else:
        profile_id = str(uuid4())

    profile_result = (
        get_supabase()
        .table("profiles")
        .select("id,full_name,phone,role")
        .eq("id", profile_id)
        .limit(1)
        .execute()
    )

    if profile_result.data:
        profile = profile_result.data[0]
        updates = {}
        if full_name and not profile.get("full_name"):
            updates["full_name"] = full_name
        if phone and not profile.get("phone"):
            updates["phone"] = phone
        if updates:
            updated = (
                get_supabase()
                .table("profiles")
                .update(updates)
                .eq("id", profile_id)
                .execute()
            )
            if updated.data:
                profile = updated.data[0]
    else:
        profile = {
            "id": profile_id,
            "full_name": full_name or (email.split("@")[0] if email and "@" in email else "AgriMark User"),
            "phone": phone,
            "role": role,
        }
        try:
            created = get_supabase().table("profiles").upsert(profile).execute()
            if created.data:
                profile = created.data[0]
        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Unable to create AgriMark profile",
            ) from exc

    try:
        if identity_result.data:
            get_supabase().table("firebase_identities").update(
                {"email": email}
            ).eq("firebase_uid", uid).execute()
        else:
            get_supabase().table("firebase_identities").insert(
                {
                    "firebase_uid": uid,
                    "profile_id": profile_id,
                    "email": email,
                }
            ).execute()
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to link Firebase identity",
        ) from exc

    has_name = bool(profile.get("full_name") and str(profile.get("full_name")).strip())
    return {
        "user": ProfileResponse(**profile, needs_onboarding=not has_name).model_dump(),
    }
