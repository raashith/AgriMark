import uuid
from typing import Optional
from sqlalchemy.orm import Session
from backend.app.models.user import User, Role, Profile, FarmerProfile, BuyerProfile
from backend.app.schemas.user import UserMeResponse, FarmerProfileSummary, BuyerProfileSummary


class IdentityService:
    def __init__(self, db: Session):
        self.db = db

    def resolve_user_me(self, user: User) -> UserMeResponse:
        """Assembles the canonical UserMeResponse from User, Profile, Role, and role profile."""
        profile_id = user.profile.id if user.profile else user.profile_id
        auth_user_id = user.auth_user_id or (user.profile.auth_user_id if user.profile else user.id)

        farmer_summary: Optional[FarmerProfileSummary] = None
        if user.farmer_profile:
            farmer_summary = FarmerProfileSummary.model_validate(user.farmer_profile)

        buyer_summary: Optional[BuyerProfileSummary] = None
        if user.buyer_profile:
            buyer_summary = BuyerProfileSummary.model_validate(user.buyer_profile)

        return UserMeResponse(
            auth_user_id=auth_user_id,
            application_user_id=user.id,
            profile_id=profile_id,
            email=user.email,
            phone=user.phone,
            full_name=user.full_name,
            role=user.role.name if user.role else "farmer",
            status=user.status or "active",
            preferred_language=user.preferred_language or "en",
            farmer_profile=farmer_summary,
            buyer_profile=buyer_summary
        )

    def create_user_identity(
        self,
        auth_user_id: str,
        phone: str,
        email: Optional[str],
        password_hash: str,
        full_name: str,
        role: Role,
        preferred_language: str = "en"
    ) -> User:
        """Creates Profile -> User -> FarmerProfile/BuyerProfile in an atomic transaction."""
        profile_id = str(uuid.uuid4())
        profile = Profile(
            id=profile_id,
            auth_user_id=auth_user_id,
            full_name=full_name
        )
        self.db.add(profile)
        self.db.flush()

        app_user_id = str(uuid.uuid4())
        user = User(
            id=app_user_id,
            auth_user_id=auth_user_id,
            profile_id=profile_id,
            email=email,
            phone=phone,
            password_hash=password_hash,
            full_name=full_name,
            role_id=role.id,
            status="active",
            preferred_language=preferred_language
        )
        self.db.add(user)
        self.db.flush()

        role_name = role.name.lower()
        if role_name == "farmer":
            farmer_prof = FarmerProfile(
                id=str(uuid.uuid4()),
                user_id=user.id,
                verification_status="verified"
            )
            self.db.add(farmer_prof)
        elif role_name == "buyer":
            buyer_prof = BuyerProfile(
                id=str(uuid.uuid4()),
                user_id=user.id,
                verification_status="verified"
            )
            self.db.add(buyer_prof)

        self.db.commit()
        self.db.refresh(user)
        return user
