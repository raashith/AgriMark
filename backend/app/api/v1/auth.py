from fastapi import APIRouter, Depends, status, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.schemas.user import UserCreate, UserMeResponse
from backend.app.schemas.auth import Token, LoginRequest, RefreshTokenRequest, ForgotPasswordRequest, ResetPasswordRequest
from backend.app.services.auth_service import AuthService
from backend.app.services.identity_service import IdentityService
from backend.app.security.dependencies import get_current_app_user
from backend.app.models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    auth_service = AuthService(db)
    return auth_service.register_user(user_in)


@router.post("/login", response_model=Token)
def login(login_in: LoginRequest, db: Session = Depends(get_db)):
    auth_service = AuthService(db)
    return auth_service.authenticate_user(login_in)


@router.post("/token", response_model=Token)
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    auth_service = AuthService(db)
    login_req = LoginRequest(phone_or_email=form_data.username, password=form_data.password)
    return auth_service.authenticate_user(login_req)


@router.post("/logout")
def logout(current_user: User = Depends(get_current_app_user)):
    return {"message": "Successfully logged out.", "status": "session_terminated"}


@router.post("/refresh", response_model=Token)
def refresh_token(refresh_in: RefreshTokenRequest, db: Session = Depends(get_db)):
    auth_service = AuthService(db)
    return auth_service.refresh_access_token(refresh_in)


@router.get("/me", response_model=UserMeResponse)
def get_me(
    current_user: User = Depends(get_current_app_user),
    db: Session = Depends(get_db)
):
    identity_service = IdentityService(db)
    return identity_service.resolve_user_me(current_user)


@router.post("/forgot-password")
def forgot_password(req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    auth_service = AuthService(db)
    return auth_service.forgot_password(req.email)


@router.post("/reset-password")
def reset_password(req: ResetPasswordRequest, db: Session = Depends(get_db)):
    auth_service = AuthService(db)
    return auth_service.reset_password(req.token, req.new_password)
