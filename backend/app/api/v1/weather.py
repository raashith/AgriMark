from fastapi import APIRouter, HTTPException, Query

from ...core.config import get_settings
from ...services.weather_service import WeatherService

router = APIRouter(prefix="/weather", tags=["weather"])
settings = get_settings()
service = WeatherService(settings.openweather_api_key)


@router.get("/current")
async def current_weather(
    latitude: float = Query(...),
    longitude: float = Query(...),
):
    try:
        data = await service.current(latitude, longitude)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=502, detail="Live OpenWeather request failed.") from exc

    return {
        "success": True,
        "data": data,
        "meta": {
            "data_origin": "OPENWEATHER",
            "provider": "OpenWeather",
            "observed_at_unix": data.get("observed_at_unix"),
            "freshness": "provider_current",
        },
    }
