from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

import httpx

OPENWEATHER_URL = "https://api.openweathermap.org/data/2.5/weather"


class WeatherService:
    def __init__(self, api_key: str | None):
        self.api_key = api_key

    async def current(self, latitude: float, longitude: float) -> dict[str, Any]:
        if not self.api_key:
            raise RuntimeError("OPENWEATHER_API_KEY is not configured on the backend.")
        if not -90 <= latitude <= 90:
            raise ValueError("latitude must be between -90 and 90.")
        if not -180 <= longitude <= 180:
            raise ValueError("longitude must be between -180 and 180.")

        params = {
            "lat": latitude,
            "lon": longitude,
            "appid": self.api_key,
            "units": "metric",
        }

        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(OPENWEATHER_URL, params=params)
            if response.status_code in (401, 403):
                raise RuntimeError("OpenWeather API rejected the backend API key.")
            response.raise_for_status()
            payload = response.json()

        observed_at = payload.get("dt")
        observed_iso = (
            datetime.fromtimestamp(observed_at, tz=timezone.utc).isoformat()
            if isinstance(observed_at, (int, float))
            else None
        )

        main = payload.get("main") or {}
        weather = payload.get("weather") or [{}]
        wind = payload.get("wind") or {}

        return {
            "latitude": payload.get("coord", {}).get("lat"),
            "longitude": payload.get("coord", {}).get("lon"),
            "timezone_offset_seconds": payload.get("timezone"),
            "location_name": payload.get("name"),
            "country": payload.get("sys", {}).get("country"),
            "condition": weather[0].get("main"),
            "description": weather[0].get("description"),
            "icon": weather[0].get("icon"),
            "temperature_c": main.get("temp"),
            "feels_like_c": main.get("feels_like"),
            "min_temperature_c": main.get("temp_min"),
            "max_temperature_c": main.get("temp_max"),
            "humidity_pct": main.get("humidity"),
            "pressure_hpa": main.get("pressure"),
            "wind_speed_mps": wind.get("speed"),
            "wind_direction_deg": wind.get("deg"),
            "wind_gust_mps": wind.get("gust"),
            "cloudiness_pct": (payload.get("clouds") or {}).get("all"),
            "visibility_m": payload.get("visibility"),
            "rain_1h_mm": (payload.get("rain") or {}).get("1h", 0),
            "snow_1h_mm": (payload.get("snow") or {}).get("1h", 0),
            "observed_at_unix": observed_at,
            "observed_at": observed_iso,
            "sunrise_unix": payload.get("sys", {}).get("sunrise"),
            "sunset_unix": payload.get("sys", {}).get("sunset"),
        }

    async def forecast(self, latitude: float, longitude: float, days: int = 5) -> dict[str, Any]:
        if not self.api_key:
            raise RuntimeError("OPENWEATHER_API_KEY is not configured on the backend.")
        if not 1 <= days <= 5:
            raise ValueError("days must be between 1 and 5.")
        params = {
            "lat": latitude,
            "lon": longitude,
            "appid": self.api_key,
            "units": "metric",
            "cnt": days * 8,
        }
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get("https://api.openweathermap.org/data/2.5/forecast", params=params)
            if response.status_code in (401, 403):
                raise RuntimeError("OpenWeather API rejected the backend API key.")
            response.raise_for_status()
            payload = response.json()
        return {
            "city": payload.get("city", {}),
            "items": payload.get("list", []),
        }
