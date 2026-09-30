from fastapi import APIRouter, HTTPException, Query

from ...services.weather_service import WeatherService

router = APIRouter(prefix="/weather", tags=["weather"])
service = WeatherService()


@router.get("/current")
async def current_weather(
    latitude: float = Query(...),
    longitude: float = Query(...),
):
    try:
        data = await service.current(latitude, longitude)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=502, detail="Live weather provider request failed.") from exc

    return {
        "success": True,
        "data": data,
        "meta": {
            "data_origin": "OPEN_METEO",
            "provider": "Open-Meteo",
            "observed_at": (data.get("current") or {}).get("time"),
            "freshness": "provider_current",
        },
    }
