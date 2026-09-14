from pydantic import BaseModel, Field


class RegisterRequest(BaseModel):
    email: str | None = None
    phone: str | None = None
    password: str = Field(min_length=8)
    full_name: str | None = None
    role: str = "farmer"


class LoginRequest(BaseModel):
    phone_or_email: str
    password: str


class RefreshRequest(BaseModel):
    refresh_token: str


class AuthSessionResponse(BaseModel):
    access_token: str
    refresh_token: str | None = None
    expires_in: int | None = None
    user: dict
