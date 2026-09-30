from __future__ import annotations

from typing import Any

import httpx

OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"


class WeatherService:
    async def current(self, latitude: float, longitude: float) -> dict[str, Any]:
        if not -90 <= latitude <= 90:
            raise ValueError("latitude must be between -90 and 90.")
        if not -180 <= longitude <= 180:
            raise ValueError("longitude must be between -180 and 180.")

        params = {
            "latitude": latitude,
            "longitude": longitude,
            "current": ",".join([
                "temperature_2m",
                "relative_humidity_2m",
                "apparent_temperature",
                "precipitation",
                "rain",
                "weather_code",
                "cloud_cover",
                "pressure_msl",
                "wind_speed_10m",
                "wind_direction_10m",
                "wind_gusts_10m",
            ]),
            "timezone": "auto",
        }

        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(OPEN_METEO_URL, params=params)
            response.raise_for_status()
            payload = response.json()

        return {
            "latitude": payload.get("latitude"),
            "longitude": payload.get("longitude"),
            "timezone": payload.get("timezone"),
            "elevation_m": payload.get("elevation"),
            "current": payload.get("current"),
            "current_units": payload.get("current_units"),
        }
