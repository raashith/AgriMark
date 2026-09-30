from fastapi import APIRouter, HTTPException, Query

from ...core.config import get_settings
from ...services.weather_service import WeatherService

router = APIRouter(prefix="/weather", tags=["weather"])
settings = get_settings()
service = WeatherService(settings.openweather_api_key)


def _provider_error(exc: Exception) -> HTTPException:
    if isinstance(exc, ValueError):
        return HTTPException(status_code=400, detail=str(exc))
    if isinstance(exc, RuntimeError):
        return HTTPException(status_code=503, detail=str(exc))
    return HTTPException(status_code=502, detail="Live OpenWeather request failed.")


@router.get("/current")
async def current_weather(
    latitude: float = Query(...),
    longitude: float = Query(...),
):
    try:
        data = await service.current(latitude, longitude)
        return {
            "success": True,
            "data": data,
            "meta": {
                "data_origin": "OPENWEATHER",
                "provider": "OpenWeather",
                "observed_at": data.get("observed_at"),
                "freshness": "provider_current",
            },
        }
    except Exception as exc:
        raise _provider_error(exc) from exc


@router.get("/forecast")
async def weather_forecast(
    latitude: float = Query(...),
    longitude: float = Query(...),
    days: int = Query(5, ge=1, le=5),
):
    try:
        data = await service.forecast(latitude, longitude, days)
        return {
            "success": True,
            "data": data,
            "meta": {
                "data_origin": "OPENWEATHER",
                "provider": "OpenWeather",
                "forecast_days": days,
                "freshness": "provider_forecast",
            },
        }
    except Exception as exc:
        raise _provider_error(exc) from exc
