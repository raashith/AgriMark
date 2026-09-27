from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ...core.database import get_supabase
from ...core.firebase_auth import verify_firebase_id_token
from ...schemas.domain import ProfileResponse

router = APIRouter(prefix="/auth/firebase", tags=["auth-firebase"])


class FirebaseSyncRequest(BaseModel):
    firebase_uid: str
    email: str | None = None
    phone: str | None = None
    full_name: str | None = None


@router.post("/sync")
def sync_firebase_profile(request: FirebaseSyncRequest):
    try:
        decoded = verify_firebase_id_token(request.firebase_uid)
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid or expired Firebase ID token")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired Firebase ID token")

    uid = str(decoded.get("uid") or "")
    if not uid or uid != request.firebase_uid:
        raise HTTPException(status_code=401, detail="Firebase identity mismatch")

    email = request.email or decoded.get("email")
    phone = request.phone or decoded.get("phone_number")
    full_name = request.full_name or decoded.get("name")

    existing = (
        get_supabase()
        .table("firebase_identities")
        .select("profile_id")
        .eq("firebase_uid", uid)
        .limit(1)
        .execute()
    )

    profile_id = existing.data[0]["profile_id"] if existing.data else uid

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
            profile = updated.data[0] if updated.data else profile
    else:
        payload = {
            "id": profile_id,
            "full_name": full_name or (email.split("@")[0] if email and "@" in email else "AgriMark User"),
            "phone": phone,
            "role": "farmer",
        }
        created = get_supabase().table("profiles").upsert(payload).execute()
        profile = created.data[0] if created.data else payload

    if not existing.data:
        get_supabase().table("firebase_identities").upsert(
            {
                "firebase_uid": uid,
                "profile_id": profile_id,
                "email": email,
            },
            on_conflict="firebase_uid",
        ).execute()

    has_name = bool(profile.get("full_name") and str(profile.get("full_name")).strip())
    return {
        "user": ProfileResponse(**profile, needs_onboarding=not has_name).model_dump(),
    }
