import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Integer
from sqlalchemy.orm import relationship
from backend.app.core.database import Base


class Role(Base):
    __tablename__ = "roles"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(50), nullable=False, unique=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    users = relationship("User", back_populates="role")


class Profile(Base):
    __tablename__ = "profiles"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    auth_user_id = Column(String(36), nullable=True, index=True)
    full_name = Column(String(100), nullable=False)
    avatar_url = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="profile", uselist=False)


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    auth_user_id = Column(String(36), nullable=True, index=True)
    profile_id = Column(String(36), ForeignKey("profiles.id", ondelete="SET NULL"), nullable=True)
    email = Column(String(255), unique=True, nullable=True, index=True)
    phone = Column(String(20), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=False)
    role_id = Column(String(36), ForeignKey("roles.id"), nullable=False)
    status = Column(String(20), default="active")
    preferred_language = Column(String(10), default="en")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    role = relationship("Role", back_populates="users")
    profile = relationship("Profile", back_populates="user", uselist=False)
    farmer_profile = relationship("FarmerProfile", back_populates="user", uselist=False)
    buyer_profile = relationship("BuyerProfile", back_populates="user", uselist=False)


class FarmerProfile(Base):
    __tablename__ = "farmer_profiles"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    fpo_member_id = Column(String(100), nullable=True)
    experience_years = Column(Integer, default=0)
    primary_crops = Column(Text, nullable=True)
    verification_status = Column(String(20), default="unverified")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="farmer_profile")


class BuyerProfile(Base):
    __tablename__ = "buyer_profiles"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    business_name = Column(String(150), nullable=True)
    buyer_type = Column(String(50), default="individual")
    gstin = Column(String(20), nullable=True)
    delivery_address = Column(Text, nullable=True)
    verification_status = Column(String(20), default="unverified")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="buyer_profile")
