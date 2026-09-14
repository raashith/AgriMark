from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from ...core.auth import AuthenticatedUser, _get_auth_client, get_current_user
from ...core.config import get_settings
from ...core.database import get_supabase
from ...schemas.domain import ProfileResponse

router = APIRouter(prefix="/auth", tags=["auth"])


class LoginRequest(BaseModel):
    email: str | None = None
    phone: str | None = None
    phone_or_email: str | None = None
    password: str = Field(min_length=1)


class RegisterRequest(BaseModel):
    full_name: str | None = None
    email: str | None = None
    phone: str | None = None
    password: str = Field(min_length=6)
    role: str = "farmer"


@router.get("/me", response_model=ProfileResponse)
def me(user: AuthenticatedUser = Depends(get_current_user)) -> ProfileResponse:
    result = (
        get_supabase()
        .table("profiles")
        .select("id,full_name,phone,role")
        .eq("id", str(user.id))
        .limit(1)
        .execute()
    )
    if result.data:
        prof = result.data[0]
        has_name = bool(prof.get("full_name") and str(prof.get("full_name")).strip())
        return ProfileResponse(**prof, needs_onboarding=not has_name)

    default_profile = {
        "id": str(user.id),
        "full_name": user.email.split("@")[0] if user.email else "AgriMark User",
        "phone": user.phone,
        "role": "farmer",
    }
    try:
        get_supabase().table("profiles").upsert(default_profile).execute()
    except Exception:
        pass
    return ProfileResponse(**default_profile, needs_onboarding=True)


@router.post("/login")
def login(request: LoginRequest):
    email = request.email or (request.phone_or_email if request.phone_or_email and "@" in request.phone_or_email else None)
    if not email:
        raise HTTPException(status_code=400, detail="A valid email address is required for password login.")

    settings = get_settings()
    key = settings.supabase_publishable_key or settings.supabase_service_role_key
    if not key:
        raise HTTPException(status_code=503, detail="Supabase authentication is not configured.")

    try:
        response = _get_auth_client().post(
            f"{settings.supabase_url.rstrip('/')}/auth/v1/token?grant_type=password",
            headers={"apikey": key, "Content-Type": "application/json"},
            json={"email": email, "password": request.password},
        )
        if response.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid email/phone or password.")
        token_data = response.json()
        access_token = token_data.get("access_token")
        user_info = token_data.get("user", {})
        user_id = user_info.get("id") if isinstance(user_info, dict) else None
        if not access_token or not user_id:
            raise HTTPException(status_code=401, detail="Invalid email/phone or password.")
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=401, detail="Invalid email/phone or password.") from exc

    prof_res = get_supabase().table("profiles").select("id,full_name,phone,role").eq("id", str(user_id)).limit(1).execute()
    if prof_res.data:
        profile_data = prof_res.data[0]
    else:
        profile_data = {
            "id": user_id,
            "full_name": email.split("@")[0],
            "phone": request.phone,
            "role": "farmer",
        }
        try:
            get_supabase().table("profiles").upsert(profile_data).execute()
        except Exception:
            pass

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": profile_data,
    }


@router.post("/register", status_code=201)
def register(request: RegisterRequest):
    allowed_roles = {"farmer", "buyer", "fpo", "logistics", "service_provider"}
    if request.role == "admin" or request.role not in allowed_roles:
        raise HTTPException(status_code=403, detail="Self-registration as admin is prohibited.")

    target_role = request.role if request.role in allowed_roles else "farmer"

    settings = get_settings()
    key = settings.supabase_publishable_key or settings.supabase_service_role_key
    if not key:
        raise HTTPException(status_code=503, detail="Supabase authentication is not configured.")

    email = request.email
    if not email:
        raise HTTPException(status_code=400, detail="A valid email address is required for registration.")

    try:
        response = _get_auth_client().post(
            f"{settings.supabase_url.rstrip('/')}/auth/v1/signup",
            headers={"apikey": key, "Content-Type": "application/json"},
            json={
                "email": email,
                "password": request.password,
                "data": {"full_name": request.full_name, "phone": request.phone},
            },
        )
        if response.status_code not in (200, 201):
            body = response.json() if response.text else {}
            msg = body.get("msg") or body.get("error_description") or "Unable to register account."
            raise HTTPException(status_code=400, detail=msg)

        signup_data = response.json()
        user_info = signup_data.get("user") or signup_data
        user_id = user_info.get("id") if isinstance(user_info, dict) else None
        if user_id:
            profile_payload = {
                "id": str(user_id),
                "full_name": request.full_name,
                "phone": request.phone,
                "role": target_role,
            }
            try:
                get_supabase().table("profiles").upsert(profile_payload).execute()
            except Exception:
                pass
        return {"message": "Registration successful", "user_id": user_id}
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Registration failed") from exc



@router.post("/logout")
def logout():
    return {"message": "Logged out successfully"}
