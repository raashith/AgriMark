from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.schemas.farmer_data import WeatherResponse, AgriculturalWeatherResponse
from backend.app.services.farmer_data_service import FarmerDataService

router = APIRouter(prefix="/weather", tags=["Weather Intelligence & Agricultural Signals"])


@router.get("/current", response_model=WeatherResponse)
def get_current_weather(
    location: str = Query("Coimbatore"),
    db: Session = Depends(get_db)
):
    agri_w = FarmerDataService.get_weather_intelligence(db, location)
    return agri_w.weather


@router.get("/forecast", response_model=AgriculturalWeatherResponse)
def get_weather_forecast(
    location: str = Query("Coimbatore"),
    db: Session = Depends(get_db)
):
    return FarmerDataService.get_weather_intelligence(db, location)


@router.get("/agriculture", response_model=AgriculturalWeatherResponse)
def get_agricultural_weather_signals(
    location: str = Query("Coimbatore"),
    db: Session = Depends(get_db)
):
    return FarmerDataService.get_weather_intelligence(db, location)
