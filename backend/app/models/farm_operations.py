import uuid
from datetime import datetime, date
from sqlalchemy import Column, String, DateTime, Date, Numeric, Integer, Text, ForeignKey, CheckConstraint
from sqlalchemy.orm import relationship
from backend.app.core.database import Base


class Farm(Base):
    __tablename__ = "farms"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    farmer_id = Column(String(36), ForeignKey("farmer_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(100), nullable=False)
    location_name = Column(String(255), nullable=False)
    latitude = Column(Numeric(10, 7), nullable=True)
    longitude = Column(Numeric(10, 7), nullable=True)
    total_area_acres = Column(Numeric(8, 2), nullable=False)
    soil_type = Column(String(50), nullable=True)
    irrigation_source = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    crops = relationship("Crop", back_populates="farm", cascade="all, delete-orphan")
    observations = relationship("FieldObservation", back_populates="farm", cascade="all, delete-orphan")
    input_logs = relationship("FarmInputLog", back_populates="farm", cascade="all, delete-orphan")
    labor_logs = relationship("FarmLaborLog", back_populates="farm", cascade="all, delete-orphan")
    tasks = relationship("FarmTask", back_populates="farm", cascade="all, delete-orphan")


class Crop(Base):
    __tablename__ = "crops"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    farm_id = Column(String(36), ForeignKey("farms.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(100), nullable=False)
    variety = Column(String(100), nullable=True)
    sowing_date = Column(Date, nullable=False)
    expected_harvest_date = Column(Date, nullable=True)
    acreage = Column(Numeric(8, 2), nullable=False)
    status = Column(String(30), default="PLANTED") # PLANTED, GROWING, HARVESTED, FAILED
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    farm = relationship("Farm", back_populates="crops")
    observations = relationship("FieldObservation", back_populates="crop", cascade="all, delete-orphan")
    harvests = relationship("HarvestBatch", back_populates="crop", cascade="all, delete-orphan")


class FieldObservation(Base):
    __tablename__ = "field_observations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    farm_id = Column(String(36), ForeignKey("farms.id", ondelete="CASCADE"), nullable=False, index=True)
    crop_id = Column(String(36), ForeignKey("crops.id", ondelete="SET NULL"), nullable=True, index=True)
    crop_stage = Column(String(50), nullable=True) # SOWING, VEGETATIVE, FLOWERING, FRUITING, HARVEST_READY
    observation_type = Column(String(50), default="GENERAL") # PEST, DISEASE, NUTRIENT, WATER_STRESS, GENERAL
    severity = Column(String(20), default="LOW") # LOW, MEDIUM, HIGH, CRITICAL
    notes = Column(Text, nullable=False)
    photo_url = Column(String(500), nullable=True)
    ai_assessment = Column(Text, nullable=True)
    observed_at = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

    farm = relationship("Farm", back_populates="observations")
    crop = relationship("Crop", back_populates="observations")


class FarmInputLog(Base):
    __tablename__ = "farm_input_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    farm_id = Column(String(36), ForeignKey("farms.id", ondelete="CASCADE"), nullable=False, index=True)
    crop_id = Column(String(36), ForeignKey("crops.id", ondelete="SET NULL"), nullable=True, index=True)
    input_type = Column(String(50), nullable=False) # SEED, FERTILIZER, PESTICIDE, BIO_PRODUCT, IRRIGATION
    product_name = Column(String(150), nullable=False)
    quantity_used = Column(Numeric(10, 2), nullable=False)
    unit = Column(String(20), nullable=False) # KG, LITRES, BAGS, HOURS
    cost = Column(Numeric(12, 2), nullable=False, default=0.00)
    applied_date = Column(Date, default=date.today)
    created_at = Column(DateTime, default=datetime.utcnow)

    farm = relationship("Farm", back_populates="input_logs")


class FarmLaborLog(Base):
    __tablename__ = "farm_labor_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    farm_id = Column(String(36), ForeignKey("farms.id", ondelete="CASCADE"), nullable=False, index=True)
    crop_id = Column(String(36), ForeignKey("crops.id", ondelete="SET NULL"), nullable=True, index=True)
    task_type = Column(String(100), nullable=False) # PLOWING, SOWING, WEEDING, SPRAYING, HARVESTING
    worker_count = Column(Integer, nullable=False, default=1)
    hours_worked = Column(Numeric(6, 2), nullable=False)
    labor_cost = Column(Numeric(12, 2), nullable=False, default=0.00)
    work_date = Column(Date, default=date.today)
    created_at = Column(DateTime, default=datetime.utcnow)

    farm = relationship("Farm", back_populates="labor_logs")


class FarmTask(Base):
    __tablename__ = "farm_tasks"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    farm_id = Column(String(36), ForeignKey("farms.id", ondelete="CASCADE"), nullable=False, index=True)
    crop_id = Column(String(36), ForeignKey("crops.id", ondelete="SET NULL"), nullable=True, index=True)
    title = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    due_date = Column(Date, nullable=False)
    priority = Column(String(20), default="MEDIUM") # LOW, MEDIUM, HIGH, URGENT
    status = Column(String(20), default="PENDING") # PENDING, IN_PROGRESS, COMPLETED, CANCELLED
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    farm = relationship("Farm", back_populates="tasks")


class HarvestBatch(Base):
    __tablename__ = "harvest_batches"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    crop_id = Column(String(36), ForeignKey("crops.id", ondelete="CASCADE"), nullable=False, index=True)
    harvest_date = Column(Date, nullable=False)
    quantity_harvested_kg = Column(Numeric(12, 2), nullable=False)
    quality_grade = Column(String(20), default="STANDARD") # PREMIUM, STANDARD, GRADE_B, REJECT
    wastage_kg = Column(Numeric(10, 2), default=0.00)
    storage_method = Column(String(100), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    crop = relationship("Crop", back_populates="harvests")


class FarmerFinanceEntry(Base):
    __tablename__ = "farmer_finance_entries"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    farmer_id = Column(String(36), ForeignKey("farmer_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    farm_id = Column(String(36), ForeignKey("farms.id", ondelete="SET NULL"), nullable=True, index=True)
    crop_id = Column(String(36), ForeignKey("crops.id", ondelete="SET NULL"), nullable=True, index=True)
    entry_type = Column(String(20), nullable=False) # INCOME, EXPENSE
    category = Column(String(100), nullable=False) # SEEDS, FERTILIZER, LABOUR, HARVEST, SALES, FREIGHT
    amount = Column(Numeric(12, 2), nullable=False)
    entry_date = Column(Date, default=date.today)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
