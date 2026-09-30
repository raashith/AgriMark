from __future__ import annotations

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
            response.raise_for_status()
            payload = response.json()

        return {
            "latitude": payload.get("coord", {}).get("lat"),
            "longitude": payload.get("coord", {}).get("lon"),
            "timezone_offset_seconds": payload.get("timezone"),
            "location_name": payload.get("name"),
            "country": payload.get("sys", {}).get("country"),
            "weather": payload.get("weather", []),
            "main": payload.get("main", {}),
            "wind": payload.get("wind", {}),
            "clouds": payload.get("clouds", {}),
            "visibility_m": payload.get("visibility"),
            "rain": payload.get("rain", {}),
            "snow": payload.get("snow", {}),
            "observed_at_unix": payload.get("dt"),
            "sunrise_unix": payload.get("sys", {}).get("sunrise"),
            "sunset_unix": payload.get("sys", {}).get("sunset"),
        }
