import uuid
from typing import List, Optional
from datetime import datetime, date
from decimal import Decimal
from sqlalchemy.orm import Session
from sqlalchemy import func, text
from backend.app.models.farm_operations import (
    Farm, Crop, FieldObservation, FarmInputLog,
    FarmLaborLog, FarmTask, HarvestBatch, FarmerFinanceEntry
)
from backend.app.models.user import User, FarmerProfile, BuyerProfile
from backend.app.schemas.farm_operations import (
    FarmCreate, CropCreate, FieldObservationCreate,
    FarmInputLogCreate, FarmLaborLogCreate, FarmTaskCreate,
    HarvestBatchCreate, FarmerFinanceEntryCreate, FarmerDashboardResponse,
    CropSummary, TaskSummary
)


class FarmOperationsService:

    @staticmethod
    def get_or_create_farmer_profile_id(db: Session, user: User) -> str:
        profile = db.query(FarmerProfile).filter(FarmerProfile.user_id == user.id).first()
        if profile:
            return profile.id
        
        profile_id = f"farmer-{user.id[:8]}"
        new_profile = FarmerProfile(
            id=profile_id,
            user_id=user.id,
            verification_status="verified"
        )
        db.add(new_profile)
        db.commit()
        db.refresh(new_profile)
        return new_profile.id

    @staticmethod
    def create_farm(db: Session, farmer_profile_id: str, data: FarmCreate) -> Farm:
        farm = Farm(
            id=str(uuid.uuid4()),
            farmer_id=farmer_profile_id,
            name=data.name,
            location_name=data.location_name,
            latitude=data.latitude,
            longitude=data.longitude,
            total_area_acres=data.total_area_acres,
            soil_type=data.soil_type,
            irrigation_source=data.irrigation_source
        )
        db.add(farm)
        db.commit()
        db.refresh(farm)
        return farm

    @staticmethod
    def get_farmer_farms(db: Session, farmer_profile_id: str) -> List[Farm]:
        return db.query(Farm).filter(Farm.farmer_id == farmer_profile_id).all()

    @staticmethod
    def add_crop(db: Session, data: CropCreate) -> Crop:
        crop = Crop(
            id=str(uuid.uuid4()),
            farm_id=data.farm_id,
            name=data.name,
            variety=data.variety,
            sowing_date=data.sowing_date,
            expected_harvest_date=data.expected_harvest_date,
            acreage=data.acreage,
            status=data.status
        )
        db.add(crop)
        db.commit()
        db.refresh(crop)
        return crop

    @staticmethod
    def get_farm_crops(db: Session, farm_id: str) -> List[Crop]:
        return db.query(Crop).filter(Crop.farm_id == farm_id).all()

    @staticmethod
    def record_field_observation(db: Session, data: FieldObservationCreate) -> FieldObservation:
        ai_assessment = f"Assessment [{data.observation_type}]: Severity is {data.severity}. Recommended monitor frequency: 2 days."
        if data.severity in ["HIGH", "CRITICAL"]:
            ai_assessment += " Immediate agronomic intervention or targeted treatment advised."

        obs = FieldObservation(
            id=str(uuid.uuid4()),
            farm_id=data.farm_id,
            crop_id=data.crop_id,
            crop_stage=data.crop_stage,
            observation_type=data.observation_type,
            severity=data.severity,
            notes=data.notes,
            photo_url=data.photo_url,
            ai_assessment=ai_assessment
        )
        db.add(obs)
        db.commit()
        db.refresh(obs)
        return obs

    @staticmethod
    def log_farm_input(db: Session, data: FarmInputLogCreate) -> FarmInputLog:
        input_log = FarmInputLog(
            id=str(uuid.uuid4()),
            farm_id=data.farm_id,
            crop_id=data.crop_id,
            input_type=data.input_type,
            product_name=data.product_name,
            quantity_used=data.quantity_used,
            unit=data.unit,
            cost=data.cost,
            applied_date=data.applied_date or date.today()
        )
        db.add(input_log)

        farm = db.query(Farm).filter(Farm.id == data.farm_id).first()
        if farm:
            fin_entry = FarmerFinanceEntry(
                id=str(uuid.uuid4()),
                farmer_id=farm.farmer_id,
                farm_id=data.farm_id,
                crop_id=data.crop_id,
                entry_type="EXPENSE",
                category=f"INPUT_{data.input_type.upper()}",
                amount=data.cost,
                entry_date=data.applied_date or date.today(),
                notes=f"Auto input log: {data.product_name} ({data.quantity_used} {data.unit})"
            )
            db.add(fin_entry)

        db.commit()
        db.refresh(input_log)
        return input_log

    @staticmethod
    def log_farm_labor(db: Session, data: FarmLaborLogCreate) -> FarmLaborLog:
        labor_log = FarmLaborLog(
            id=str(uuid.uuid4()),
            farm_id=data.farm_id,
            crop_id=data.crop_id,
            task_type=data.task_type,
            worker_count=data.worker_count,
            hours_worked=data.hours_worked,
            labor_cost=data.labor_cost,
            work_date=data.work_date or date.today()
        )
        db.add(labor_log)

        farm = db.query(Farm).filter(Farm.id == data.farm_id).first()
        if farm:
            fin_entry = FarmerFinanceEntry(
                id=str(uuid.uuid4()),
                farmer_id=farm.farmer_id,
                farm_id=data.farm_id,
                crop_id=data.crop_id,
                entry_type="EXPENSE",
                category="LABOUR",
                amount=data.labor_cost,
                entry_date=data.work_date or date.today(),
                notes=f"Auto labour log: {data.task_type} ({data.worker_count} workers, {data.hours_worked} hrs)"
            )
            db.add(fin_entry)

        db.commit()
        db.refresh(labor_log)
        return labor_log

    @staticmethod
    def create_farm_task(db: Session, data: FarmTaskCreate) -> FarmTask:
        task = FarmTask(
            id=str(uuid.uuid4()),
            farm_id=data.farm_id,
            crop_id=data.crop_id,
            title=data.title,
            description=data.description,
            due_date=data.due_date,
            priority=data.priority,
            status=data.status
        )
        db.add(task)
        db.commit()
        db.refresh(task)
        return task

    @staticmethod
    def record_harvest(db: Session, data: HarvestBatchCreate) -> HarvestBatch:
        batch_id = str(uuid.uuid4())
        batch = HarvestBatch(
            id=batch_id,
            crop_id=data.crop_id,
            harvest_date=data.harvest_date,
            quantity_harvested_kg=data.quantity_harvested_kg,
            quality_grade=data.quality_grade,
            wastage_kg=data.wastage_kg,
            storage_method=data.storage_method,
            notes=data.notes
        )
        db.add(batch)

        crop = db.query(Crop).filter(Crop.id == data.crop_id).first()
        if crop:
            crop.status = "HARVESTED"

            farm = db.query(Farm).filter(Farm.id == crop.farm_id).first()
            if farm:
                lot_qty = float(data.quantity_harvested_kg - data.wastage_kg)
                db.execute(
                    text("""INSERT INTO produce_lots (id, farmer_id, farm_id, commodity_name, quantity_kg, harvest_date, quality_grade, status)
                       VALUES (:id, :farmer_id, :farm_id, :commodity_name, :quantity_kg, :harvest_date, :quality_grade, 'AVAILABLE')"""),
                    {
                        "id": f"lot-{batch_id[:8]}",
                        "farmer_id": farm.farmer_id,
                        "farm_id": farm.id,
                        "commodity_name": crop.name,
                        "quantity_kg": lot_qty,
                        "harvest_date": data.harvest_date,
                        "quality_grade": data.quality_grade
                    }
                )

        db.commit()
        db.refresh(batch)
        return batch

    @staticmethod
    def record_finance_entry(db: Session, farmer_profile_id: str, data: FarmerFinanceEntryCreate) -> FarmerFinanceEntry:
        entry = FarmerFinanceEntry(
            id=str(uuid.uuid4()),
            farmer_id=farmer_profile_id,
            farm_id=data.farm_id,
            crop_id=data.crop_id,
            entry_type=data.entry_type,
            category=data.category,
            amount=data.amount,
            entry_date=data.entry_date or date.today(),
            notes=data.notes
        )
        db.add(entry)
        db.commit()
        db.refresh(entry)
        return entry

    @staticmethod
    def get_farmer_dashboard(db: Session, farmer_profile_id: str) -> FarmerDashboardResponse:
        farms = db.query(Farm).filter(Farm.farmer_id == farmer_profile_id).all()
        farm_ids = [f.id for f in farms]

        total_acres = sum([f.total_area_acres for f in farms], Decimal("0.00"))
        
        crops = []
        if farm_ids:
            crops = db.query(Crop).filter(Crop.farm_id.in_(farm_ids)).all()
        
        active_crops = [c for c in crops if c.status in ["PLANTED", "GROWING"]]
        crop_ids = [c.id for c in crops]

        input_cost = Decimal("0.00")
        labor_cost = Decimal("0.00")
        harvested_kg = Decimal("0.00")

        if farm_ids:
            res_input = db.query(func.sum(FarmInputLog.cost)).filter(FarmInputLog.farm_id.in_(farm_ids)).scalar()
            input_cost = Decimal(str(res_input)) if res_input else Decimal("0.00")

            res_labor = db.query(func.sum(FarmLaborLog.labor_cost)).filter(FarmLaborLog.farm_id.in_(farm_ids)).scalar()
            labor_cost = Decimal(str(res_labor)) if res_labor else Decimal("0.00")

        if crop_ids:
            res_harvest = db.query(func.sum(HarvestBatch.quantity_harvested_kg)).filter(HarvestBatch.crop_id.in_(crop_ids)).scalar()
            harvested_kg = Decimal(str(res_harvest)) if res_harvest else Decimal("0.00")

        res_income = db.query(func.sum(FarmerFinanceEntry.amount)).filter(
            FarmerFinanceEntry.farmer_id == farmer_profile_id,
            FarmerFinanceEntry.entry_type == "INCOME"
        ).scalar()
        revenue = Decimal(str(res_income)) if res_income else Decimal("0.00")

        res_expenses = db.query(func.sum(FarmerFinanceEntry.amount)).filter(
            FarmerFinanceEntry.farmer_id == farmer_profile_id,
            FarmerFinanceEntry.entry_type == "EXPENSE"
        ).scalar()
        total_expense = Decimal(str(res_expenses)) if res_expenses else (input_cost + labor_cost)

        net_profit = revenue - total_expense
        margin_pct = (net_profit / revenue * Decimal("100")) if revenue > Decimal("0.00") else Decimal("0.00")

        upcoming_tasks = []
        if farm_ids:
            tasks = db.query(FarmTask).filter(
                FarmTask.farm_id.in_(farm_ids),
                FarmTask.status != "COMPLETED"
            ).order_by(FarmTask.due_date.asc()).limit(5).all()
            upcoming_tasks = [
                TaskSummary(
                    id=t.id,
                    title=t.title,
                    due_date=t.due_date,
                    priority=t.priority,
                    status=t.status
                ) for t in tasks
            ]

        crop_summaries = [
            CropSummary(
                id=c.id,
                name=c.name,
                variety=c.variety,
                acreage=c.acreage,
                status=c.status,
                sowing_date=c.sowing_date
            ) for c in crops
        ]

        return FarmerDashboardResponse(
            total_farms=len(farms),
            total_acreage=total_acres,
            active_crops_count=len(active_crops),
            total_harvested_kg=harvested_kg,
            total_input_cost=input_cost,
            total_labor_cost=labor_cost,
            total_production_cost=total_expense,
            total_revenue=revenue,
            net_profit=net_profit,
            profit_margin_percentage=round(margin_pct, 2),
            crops=crop_summaries,
            upcoming_tasks=upcoming_tasks
        )
