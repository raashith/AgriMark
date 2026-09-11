from pydantic import BaseModel
from backend.app.schemas.user import UserResponse


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class TokenData(BaseModel):
    user_id: str
    role_name: str


class LoginRequest(BaseModel):
    phone_or_email: str
    password: str
