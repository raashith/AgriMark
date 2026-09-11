from fastapi import APIRouter, Depends

from ...core.auth import AuthenticatedUser, get_current_user
from ...core.database import get_supabase
from ...schemas.domain import ProfileResponse

router = APIRouter(prefix="/auth", tags=["auth"])


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
