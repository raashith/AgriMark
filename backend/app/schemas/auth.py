from typing import Optional
from pydantic import BaseModel, EmailStr
from backend.app.schemas.user import UserResponse, UserMeResponse


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    refresh_token: Optional[str] = None
    user: UserMeResponse


class TokenData(BaseModel):
    user_id: Optional[str] = None
    auth_user_id: Optional[str] = None
    role_name: Optional[str] = None


class LoginRequest(BaseModel):
    phone_or_email: str
    password: str


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

