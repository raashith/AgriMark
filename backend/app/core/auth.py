from dataclasses import dataclass
from uuid import UUID

import httpx
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from .config import get_settings

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


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer),
) -> AuthenticatedUser:
    if not credentials or credentials.scheme.lower() != "bearer":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")

    settings = get_settings()
    key = settings.supabase_publishable_key or settings.supabase_service_role_key
    if not key:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Authentication is not configured")

    try:
        response = _get_auth_client().get(
            f"{settings.supabase_url.rstrip('/')}/auth/v1/user",
            headers={"apikey": key, "Authorization": f"Bearer {credentials.credentials}"},
        )
        if response.status_code != 200:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired access token")
        payload = response.json()
        user_id = UUID(payload["id"])
    except HTTPException:
        raise
    except (KeyError, ValueError, httpx.HTTPError) as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid access token") from exc

    return AuthenticatedUser(
        id=user_id,
        role=payload.get("role", "authenticated"),
        email=payload.get("email"),
        phone=payload.get("phone"),
    )
