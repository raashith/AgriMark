from typing import List, Callable, Dict, Any, Optional
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from backend.app.core.database import get_db
from backend.app.security.jwt import decode_access_token
from backend.app.repositories.user_repository import UserRepository
from backend.app.models.user import User, Profile, FarmerProfile, BuyerProfile

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


def get_current_auth_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Returns token payload containing auth_user_id and user_id claims."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate authentication credentials.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    token_data = decode_access_token(token)
    if token_data is None or token_data.user_id is None:
        raise credentials_exception

    return {
        "user_id": token_data.user_id,
        "auth_user_id": token_data.auth_user_id or token_data.user_id,
        "role_name": token_data.role_name
    }


def get_current_app_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """Returns the authenticated public.users model instance."""
    auth_payload = get_current_auth_user(token, db)
    user_repo = UserRepository(db)
    user = user_repo.get_by_id(auth_payload["user_id"])
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Application user not found."
        )
    if user.status != "active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive or suspended."
        )
    return user


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """Alias for get_current_app_user for backward compatibility across existing routes."""
    return get_current_app_user(token, db)


def get_current_profile(
    current_user: User = Depends(get_current_app_user)
) -> Optional[Profile]:
    """Returns the user's Profile model instance."""
    return current_user.profile


def get_current_farmer(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_app_user)
) -> FarmerProfile:
    """Returns the active FarmerProfile model instance for farmer users."""
    if current_user.role.name != "farmer" and current_user.role.name != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Operation restricted to farmer accounts."
        )
    if not current_user.farmer_profile:
        # Create farmer profile on-the-fly if missing
        prof = FarmerProfile(id=f"farmer-{current_user.id[:8]}", user_id=current_user.id, verification_status="verified")
        db.add(prof)
        db.commit()
        db.refresh(prof)
        return prof
    return current_user.farmer_profile


def get_current_buyer(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_app_user)
) -> BuyerProfile:
    """Returns the active BuyerProfile model instance for buyer users."""
    if current_user.role.name != "buyer" and current_user.role.name != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Operation restricted to buyer accounts."
        )
    if not current_user.buyer_profile:
        prof = BuyerProfile(id=f"buyer-{current_user.id[:8]}", user_id=current_user.id, verification_status="verified")
        db.add(prof)
        db.commit()
        db.refresh(prof)
        return prof
    return current_user.buyer_profile


def require_role(allowed_roles: List[str]) -> Callable:
    def role_checker(current_user: User = Depends(get_current_app_user)) -> User:
        if current_user.role.name not in allowed_roles and current_user.role.name != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Operation restricted. Requires one of roles: {allowed_roles}"
            )
        return current_user
    return role_checker
