from typing import Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from backend.app.repositories.user_repository import UserRepository
from backend.app.schemas.user import UserCreate, UserResponse
from backend.app.schemas.auth import Token, LoginRequest
from backend.app.security.passwords import get_password_hash, verify_password
from backend.app.security.jwt import create_access_token
from backend.app.models.user import User


class AuthService:
    def __init__(self, db: Session):
        self.db = db
        self.user_repo = UserRepository(db)

    def register_user(self, user_in: UserCreate) -> UserResponse:
        # Check existing phone
        if self.user_repo.get_by_phone(user_in.phone):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A user with this phone number already exists."
            )
        # Check existing email if provided
        if user_in.email and self.user_repo.get_by_email(user_in.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A user with this email address already exists."
            )

        # Validate role
        role = self.user_repo.get_role_by_name(user_in.role_name.lower())
        if not role:
            role = self.user_repo.create_role_if_not_exists(
                name=user_in.role_name.lower(),
                description=f"{user_in.role_name.capitalize()} user role"
            )

        hashed_password = get_password_hash(user_in.password)
        user = self.user_repo.create_user(
            phone=user_in.phone,
            email=user_in.email,
            password_hash=hashed_password,
            full_name=user_in.full_name,
            role_id=role.id,
            preferred_language=user_in.preferred_language or "en"
        )
        return UserResponse.model_validate(user)

    def authenticate_user(self, login_in: LoginRequest) -> Token:
        identifier = login_in.phone_or_email.strip()
        user: Optional[User] = None

        if "@" in identifier:
            user = self.user_repo.get_by_email(identifier)
        else:
            user = self.user_repo.get_by_phone(identifier)

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

        access_token = create_access_token(
            data={"sub": user.id, "role": user.role.name}
        )
        return Token(
            access_token=access_token,
            token_type="bearer",
            user=UserResponse.model_validate(user)
        )
