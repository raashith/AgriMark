from fastapi import APIRouter, Depends, HTTPException, status
import httpx

from ...core.auth import AuthenticatedUser, get_current_user
from ...core.config import get_settings
from ...core.database import get_supabase
from ...schemas.auth import AuthSessionResponse, LoginRequest, RefreshRequest, RegisterRequest
from ...schemas.domain import ProfileResponse

router = APIRouter(prefix="/auth", tags=["auth"])

_ALLOWED_REGISTRATION_ROLES = {"farmer", "fpo", "buyer", "logistics", "service_provider"}


def _auth_headers() -> dict[str, str]:
    settings = get_settings()
    key = settings.supabase_publishable_key or settings.supabase_service_role_key
    if not key:
        raise HTTPException(status_code=500, detail="Supabase auth is not configured")
    return {"apikey": key, "Content-Type": "application/json"}


def _auth_url(path: str) -> str:
    return f"{get_settings().supabase_url.rstrip('/')}/auth/v1/{path.lstrip('/')}"


async def _supabase_auth_request(method: str, path: str, body: dict) -> dict:
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            response = await client.request(method, _auth_url(path), headers=_auth_headers(), json=body)
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=503, detail="Authentication service unavailable") from exc

    try:
        payload = response.json()
    except ValueError:
        payload = {}
    if response.status_code >= 400:
        detail = payload.get("msg") or payload.get("message") or payload.get("error_description") or payload.get("error") or "Authentication failed"
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED if response.status_code in {400, 401} else response.status_code, detail=detail)
    return payload


@router.post("/register", response_model=AuthSessionResponse)
async def register(request: RegisterRequest) -> AuthSessionResponse:
    if request.role not in _ALLOWED_REGISTRATION_ROLES:
        raise HTTPException(status_code=400, detail="Unsupported registration role")
    if not request.email and not request.phone:
        raise HTTPException(status_code=400, detail="Email or phone is required")

    credentials: dict[str, str] = {"password": request.password}
    if request.email:
        credentials["email"] = request.email
    if request.phone:
        credentials["phone"] = request.phone

    payload = await _supabase_auth_request(
        "POST",
        "signup",
        {
            **credentials,
            "data": {
                "full_name": request.full_name,
                "phone": request.phone,
                "role": request.role,
            },
        },
    )

    user = payload.get("user") or {}
    session = payload.get("session") or {}
    user_id = user.get("id")
    if user_id and session.get("access_token"):
        get_supabase().table("profiles").upsert(
            {
                "id": user_id,
                "full_name": request.full_name,
                "phone": request.phone,
                "role": request.role,
            },
            on_conflict="id",
        ).execute()

    return AuthSessionResponse(
        access_token=session.get("access_token") or "",
        refresh_token=session.get("refresh_token"),
        expires_in=session.get("expires_in"),
        user=user,
    )


@router.post("/login", response_model=AuthSessionResponse)
async def login(request: LoginRequest) -> AuthSessionResponse:
    identifier = request.phone_or_email.strip()
    if "@" in identifier:
        body = {"email": identifier, "password": request.password}
    else:
        body = {"phone": identifier, "password": request.password}

    payload = await _supabase_auth_request("POST", "token?grant_type=password", body)
    user = payload.get("user") or {}
    return AuthSessionResponse(
        access_token=payload.get("access_token") or "",
        refresh_token=payload.get("refresh_token"),
        expires_in=payload.get("expires_in"),
        user=user,
    )


@router.post("/refresh", response_model=AuthSessionResponse)
async def refresh(request: RefreshRequest) -> AuthSessionResponse:
    payload = await _supabase_auth_request(
        "POST",
        "token?grant_type=refresh_token",
        {"refresh_token": request.refresh_token},
    )
    return AuthSessionResponse(
        access_token=payload.get("access_token") or "",
        refresh_token=payload.get("refresh_token"),
        expires_in=payload.get("expires_in"),
        user=payload.get("user") or {},
    )


@router.post("/logout")
async def logout(user: AuthenticatedUser = Depends(get_current_user)) -> dict[str, bool]:
    # Supabase logout is token-scoped; invalidating the access token is authoritative.
    await _supabase_auth_request("POST", "logout", {})
    return {"ok": True}


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
        return ProfileResponse(**result.data[0])
    return ProfileResponse(id=user.id, full_name=None, phone=user.phone, role="farmer")
