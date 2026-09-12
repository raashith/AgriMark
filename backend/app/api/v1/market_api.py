from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.schemas.farmer_data import (
    MarketPriceResponse, BestMarketResponse, PricePredictionResponse
)
from backend.app.services.farmer_data_service import FarmerDataService

router = APIRouter(prefix="/market", tags=["Market Intelligence & AGMARKNET/e-NAM Data"])


@router.get("/prices", response_model=List[MarketPriceResponse])
def get_market_prices(
    crop_name: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    return FarmerDataService.get_market_prices(db, crop_name)


@router.get("/prices/{crop}", response_model=List[MarketPriceResponse])
def get_crop_market_prices(
    crop: str,
    db: Session = Depends(get_db)
):
    return FarmerDataService.get_market_prices(db, crop)


@router.get("/best-markets", response_model=BestMarketResponse)
def get_best_markets(
    crop_name: str = Query("Tomato"),
    db: Session = Depends(get_db)
):
    return FarmerDataService.get_best_markets(db, crop_name)


@router.get("/predict-price", response_model=PricePredictionResponse)
def predict_commodity_price(
    crop_name: str = Query("Tomato"),
    market_name: str = Query("Koyambedu"),
    horizon_days: int = Query(7),
    db: Session = Depends(get_db)
):
    return FarmerDataService.predict_market_price(db, crop_name, market_name, horizon_days)
