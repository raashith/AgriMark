from typing import Optional
from sqlalchemy.orm import Session
from backend.app.models.user import User, Role


class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_role_by_name(self, role_name: str) -> Optional[Role]:
        return self.db.query(Role).filter(Role.name == role_name).first()

    def create_role_if_not_exists(self, name: str, description: str = "") -> Role:
        role = self.get_role_by_name(name)
        if not role:
            role = Role(id=f"role-{name}", name=name, description=description)
            self.db.add(role)
            self.db.commit()
            self.db.refresh(role)
        return role

    def get_by_id(self, user_id: str) -> Optional[User]:
        return self.db.query(User).filter(User.id == user_id).first()

    def get_by_phone(self, phone: str) -> Optional[User]:
        return self.db.query(User).filter(User.phone == phone).first()

    def get_by_email(self, email: str) -> Optional[User]:
        if not email:
            return None
        return self.db.query(User).filter(User.email == email).first()

    def create_user(
        self,
        phone: str,
        password_hash: str,
        full_name: str,
        role_id: str,
        email: Optional[str] = None,
        preferred_language: str = "en"
    ) -> User:
        user = User(
            phone=phone,
            email=email,
            password_hash=password_hash,
            full_name=full_name,
            role_id=role_id,
            preferred_language=preferred_language
        )
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user
