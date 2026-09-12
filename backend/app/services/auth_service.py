import uuid
from typing import Optional
import httpx
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from backend.app.core.config import settings
from backend.app.repositories.user_repository import UserRepository
from backend.app.services.identity_service import IdentityService
from backend.app.schemas.user import UserCreate, UserMeResponse
from backend.app.schemas.auth import Token, LoginRequest, RefreshTokenRequest
from backend.app.security.passwords import get_password_hash, verify_password
from backend.app.security.jwt import create_access_token, decode_access_token
from backend.app.models.user import User


class AuthService:
    def __init__(self, db: Session):
        self.db = db
        self.user_repo = UserRepository(db)
        self.identity_service = IdentityService(db)

    def _call_supabase_signup(self, email: str, password: str) -> Optional[str]:
        """Calls Supabase Auth GoTrue REST API for user signup."""
        if not settings.SUPABASE_URL or "localhost" in settings.SUPABASE_URL or settings.SUPABASE_ANON_KEY == "your-supabase-anon-key-here":
            return str(uuid.uuid4())
        try:
            url = f"{settings.SUPABASE_URL.rstrip('/')}/auth/v1/signup"
            headers = {
                "apikey": settings.SUPABASE_ANON_KEY,
                "Content-Type": "application/json"
            }
            res = httpx.post(url, json={"email": email, "password": password}, headers=headers, timeout=5.0)
            if res.status_code in (200, 201):
                data = res.json()
                return data.get("id") or data.get("user", {}).get("id")
        except Exception:
            pass
        return str(uuid.uuid4())

    def _call_supabase_login(self, email: str, password: str) -> Optional[dict]:
        """Calls Supabase Auth GoTrue REST API for password authentication."""
        if not settings.SUPABASE_URL or "localhost" in settings.SUPABASE_URL or settings.SUPABASE_ANON_KEY == "your-supabase-anon-key-here":
            return None
        try:
            url = f"{settings.SUPABASE_URL.rstrip('/')}/auth/v1/token?grant_type=password"
            headers = {
                "apikey": settings.SUPABASE_ANON_KEY,
                "Content-Type": "application/json"
            }
            res = httpx.post(url, json={"email": email, "password": password}, headers=headers, timeout=5.0)
            if res.status_code == 200:
                return res.json()
        except Exception:
            pass
        return None

    def register_user(self, user_in: UserCreate) -> Token:
        # 1. Duplicate checks
        if self.user_repo.get_by_phone(user_in.phone):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A user with this phone number already exists."
            )
        if user_in.email and self.user_repo.get_by_email(user_in.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A user with this email address already exists."
            )

        # 2. Get/create Role
        role_name = user_in.role_name.lower()
        role = self.user_repo.get_role_by_name(role_name)
        if not role:
            role = self.user_repo.create_role_if_not_exists(
                name=role_name,
                description=f"{role_name.capitalize()} user role"
            )

        # 3. Supabase Auth signup
        email = user_in.email or f"{user_in.phone}@agrimark.local"
        auth_user_id = self._call_supabase_signup(email, user_in.password) or str(uuid.uuid4())

        # 4. Create application user + profile + role-specific profile
        hashed_password = get_password_hash(user_in.password)
        user = self.identity_service.create_user_identity(
            auth_user_id=auth_user_id,
            phone=user_in.phone,
            email=user_in.email,
            password_hash=hashed_password,
            full_name=user_in.full_name,
            role=role,
            preferred_language=user_in.preferred_language or "en"
        )

        user_me = self.identity_service.resolve_user_me(user)

        # 5. Issue token
        access_token = create_access_token(
            data={"sub": user.id, "auth_user_id": auth_user_id, "role": role.name}
        )

        return Token(
            access_token=access_token,
            token_type="bearer",
            refresh_token=f"refresh-{user.id}",
            user=user_me
        )

    def authenticate_user(self, login_in: LoginRequest) -> Token:
        identifier = login_in.phone_or_email.strip()
        user: Optional[User] = None

        if "@" in identifier:
            user = self.user_repo.get_by_email(identifier)
        else:
            user = self.user_repo.get_by_phone(identifier)

        # Try Supabase Auth login if email provided
        supa_res = None
        if user and user.email:
            supa_res = self._call_supabase_login(user.email, login_in.password)

        if supa_res:
            auth_user_id = supa_res.get("user", {}).get("id") or user.auth_user_id
            if auth_user_id and not user.auth_user_id:
                user.auth_user_id = auth_user_id
                self.db.commit()
        else:
            # Fallback local password verification
            if not user or not verify_password(login_in.password, user.password_hash):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Incorrect phone/email or password.",
                    headers={"WWW-Authenticate": "Bearer"},
                )

        if user.status != "active":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is deactivated or suspended."
            )

        user_me = self.identity_service.resolve_user_me(user)

        access_token = create_access_token(
            data={"sub": user.id, "auth_user_id": user.auth_user_id or user.id, "role": user.role.name}
        )

        return Token(
            access_token=access_token,
            token_type="bearer",
            refresh_token=supa_res.get("refresh_token") if supa_res else f"refresh-{user.id}",
            user=user_me
        )

    def refresh_access_token(self, refresh_in: RefreshTokenRequest) -> Token:
        token_str = refresh_in.refresh_token.replace("refresh-", "")
        user = self.user_repo.get_by_id(token_str)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired refresh token."
            )

        user_me = self.identity_service.resolve_user_me(user)
        access_token = create_access_token(
            data={"sub": user.id, "auth_user_id": user.auth_user_id or user.id, "role": user.role.name}
        )

        return Token(
            access_token=access_token,
            token_type="bearer",
            refresh_token=refresh_in.refresh_token,
            user=user_me
        )

    def forgot_password(self, email: str) -> dict:
        user = self.user_repo.get_by_email(email)
        if not user:
            # Prevent email enumeration by returning success message
            return {"message": "If an account exists for this email, password reset instructions have been sent."}

        # If Supabase URL configured, trigger recover API
        if settings.SUPABASE_URL and "localhost" not in settings.SUPABASE_URL:
            try:
                url = f"{settings.SUPABASE_URL.rstrip('/')}/auth/v1/recover"
                headers = {"apikey": settings.SUPABASE_ANON_KEY, "Content-Type": "application/json"}
                httpx.post(url, json={"email": email}, headers=headers, timeout=5.0)
            except Exception:
                pass

        return {"message": "If an account exists for this email, password reset instructions have been sent."}

    def reset_password(self, token: str, new_password: str) -> dict:
        token_data = decode_access_token(token)
        if not token_data or not token_data.user_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired password reset token.")

        user = self.user_repo.get_by_id(token_data.user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found.")

        user.password_hash = get_password_hash(new_password)
        self.db.commit()
        return {"message": "Password successfully reset."}
