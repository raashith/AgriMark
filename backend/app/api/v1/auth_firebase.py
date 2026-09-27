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
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired Firebase ID token") from exc

    uid = str(decoded.get("uid") or "")
    if not uid or uid != request.firebase_uid:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Firebase identity mismatch")

    email = request.email or decoded.get("email")
    phone = request.phone or decoded.get("phone_number")
    full_name = request.full_name or decoded.get("name")
    role = request.requested_role if request.requested_role in {"farmer", "buyer", "fpo", "logistics", "service_provider"} else "farmer"

    try:
        identity = (
            get_supabase().table("firebase_identities")
            .select("profile_id")
            .eq("firebase_uid", uid)
            .limit(1)
            .execute()
        )
        if identity.data:
            profile_id = identity.data[0]["profile_id"]
        else:
            profile_id = None

        if profile_id:
            profile_result = (
                get_supabase().table("profiles")
                .select("id,full_name,phone,role")
                .eq("id", profile_id)
                .limit(1)
                .execute()
            )
        else:
            profile_result = type("R", (), {"data": []})()

        if profile_result.data:
            profile = profile_result.data[0]
        else:
            profile = {
                "id": str(__import__("uuid").uuid4()),
                "full_name": full_name or (email.split("@")[0] if email and "@" in email else "AgriMark User"),
                "phone": phone,
                "role": role,
            }
            created = get_supabase().table("profiles").insert(profile).execute()
            if not created.data:
                raise RuntimeError("profile creation returned no row")
            profile = created.data[0]
            profile_id = profile["id"]

        updates = {}
        if full_name and not profile.get("full_name"):
            updates["full_name"] = full_name
        if phone and not profile.get("phone"):
            updates["phone"] = phone
        if updates:
            updated = get_supabase().table("profiles").update(updates).eq("id", profile["id"]).execute()
            if updated.data:
                profile = updated.data[0]

        if identity.data:
            get_supabase().table("firebase_identities").update({"email": email}).eq("firebase_uid", uid).execute()
        else:
            get_supabase().table("firebase_identities").insert({
                "firebase_uid": uid,
                "profile_id": profile["id"],
                "email": email,
            }).execute()

        has_name = bool(profile.get("full_name") and str(profile.get("full_name")).strip())
        return {"user": ProfileResponse(**profile, needs_onboarding=not has_name).model_dump()}
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Unable to synchronize Firebase identity") from exc
