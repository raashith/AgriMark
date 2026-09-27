from dataclasses import dataclass
from uuid import UUID

import httpx
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from .config import get_settings
from .firebase_auth import verify_firebase_id_token

bearer = HTTPBearer(auto_error=False)


@dataclass(frozen=True)
class AuthenticatedUser:
    id: UUID
    role: str
    email: str | None = None
    phone: str | None = None


_auth_client: httpx.Client | None = None


def _get_auth_client() -> httpx.Client:
    global _auth_client
    if _auth_client is None:
        _auth_client = httpx.Client(
            timeout=httpx.Timeout(5.0, connect=2.0),
            limits=httpx.Limits(max_connections=20, max_keepalive_connections=10),
        )
    return _auth_client


def _authenticate_firebase(token: str) -> AuthenticatedUser | None:
    try:
        payload = verify_firebase_id_token(token)
    except ValueError:
        return None

    firebase_uid = str(payload.get("uid") or "")
    if not firebase_uid:
        return None

    from .database import get_supabase

    identity = (
        get_supabase()
        .table("firebase_identities")
        .select("profile_id")
        .eq("firebase_uid", firebase_uid)
        .limit(1)
        .execute()
    )
    if not identity.data:
        return None

    profile_id = identity.data[0]["profile_id"]
    try:
        user_id = UUID(str(profile_id))
    except ValueError:
        return None

    profile = (
        get_supabase()
        .table("profiles")
        .select("id,role,phone")
        .eq("id", str(user_id))
        .limit(1)
        .execute()
    )
    if not profile.data:
        return None

    row = profile.data[0]
    return AuthenticatedUser(
        id=user_id,
        role=row.get("role", "farmer"),
        email=payload.get("email"),
        phone=row.get("phone") or payload.get("phone_number"),
    )


def _authenticate_supabase(token: str) -> AuthenticatedUser:
    settings = get_settings()
    key = settings.supabase_publishable_key or settings.supabase_service_role_key
    if not key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication is not configured",
        )

    try:
        response = _get_auth_client().get(
            f"{settings.supabase_url.rstrip('/')}/auth/v1/user",
            headers={"apikey": key, "Authorization": f"Bearer {token}"},
        )
        if response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired access token",
            )
        payload = response.json()
        user_id = UUID(payload["id"])
    except HTTPException:
        raise
    except (KeyError, ValueError, httpx.HTTPError) as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid access token",
        ) from exc

    return AuthenticatedUser(
        id=user_id,
        role=payload.get("role", "authenticated"),
        email=payload.get("email"),
        phone=payload.get("phone"),
    )


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer),
) -> AuthenticatedUser:
    if not credentials or credentials.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
        )

    token = credentials.credentials

    firebase_user = _authenticate_firebase(token)
    if firebase_user:
        return firebase_user

    return _authenticate_supabase(token)
