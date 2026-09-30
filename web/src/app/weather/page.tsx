'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { CloudSun, Droplets, Wind, AlertTriangle, MapPin, Sun, RefreshCw, Gauge, Eye, CloudRain } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { dataService } from '@/lib/data-service';

type LiveWeather = {
  data: {
    location_name?: string | null;
    country?: string | null;
    condition?: string | null;
    description?: string | null;
    icon?: string | null;
    temperature_c?: number | null;
    feels_like_c?: number | null;
    humidity_pct?: number | null;
    pressure_hpa?: number | null;
    wind_speed_mps?: number | null;
    cloudiness_pct?: number | null;
    visibility_m?: number | null;
    rain_1h_mm?: number | null;
    observed_at?: string | null;
  };
  meta: {
    provider: string;
    observed_at?: string | null;
  };
};

const weatherLabel = (condition?: string | null, description?: string | null) =>
  description || condition || 'Current conditions';

export default function WeatherPage() {
  const { user } = useAuth();
  const [weather, setWeather] = useState<LiveWeather | null>(null);
  const [forecast, setForecast] = useState<Array<{ dt: number; main?: { temp?: number; humidity?: number; feels_like?: number }; weather?: Array<{ main?: string; description?: string; icon?: string }>; rain?: { '3h'?: number }; wind?: { speed?: number }; clouds?: { all?: number } }>>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadWeather = async () => {
    const farms = user?.id ? await dataService.getFarms(user.id) : [];
    const farm = farms.find((item) => item.latitude != null && item.longitude != null);

    if (!farm?.latitude || !farm.longitude) {
      setError('Add GPS coordinates to a farm to load live weather.');
      setWeather(null);
      setForecast([]);
      setLoading(false);
      return;
    }

    const params = new URLSearchParams({
      latitude: String(farm.latitude),
      longitude: String(farm.longitude),
    });

    try {
      setRefreshing(true);
      setError(null);

      const [currentResponse, forecastResponse] = await Promise.all([
        fetch(`/api/v1/interoperability/weather?${params.toString()}`, { cache: 'no-store' }),
        fetch(`/api/v1/interoperability/weather/forecast?${params.toString()}`, { cache: 'no-store' }),
      ]);

      if (!currentResponse.ok || !forecastResponse.ok) {
        throw new Error('Live weather provider is temporarily unavailable.');
      }

      const currentPayload = await currentResponse.json();
      const forecastPayload = await forecastResponse.json();

      setWeather(currentPayload);
      setForecast(forecastPayload?.data?.items || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load live weather.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadWeather();
    const interval = window.setInterval(() => void loadWeather(), 15 * 60 * 1000);
    return () => window.clearInterval(interval);
  }, [user?.id]);

  const data = weather?.data;
  const observedLabel = useMemo(() => {
    if (!data?.observed_at) return 'Not available';
    return new Date(data.observed_at).toLocaleString();
  }, [data?.observed_at]);

  return (
    <div className="space-y-6">
      <div className="bg-[#121a16] border border-[#1e2d26] p-6 md:p-8 rounded-3xl shadow-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-950/80 border border-emerald-800/60 rounded-full text-xs font-mono font-bold text-emerald-400">
              <CloudSun className="w-4 h-4" /> Live Weather Intelligence
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold text-white">Agri-Climate & Weather Warnings</h1>
            <p className="text-sm text-gray-300 max-w-2xl">
              Live current conditions and short-range forecast fetched from OpenWeather using the coordinates stored on your farm.
            </p>
          </div>
          <button
            onClick={() => void loadWeather()}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-800 bg-emerald-950/40 px-4 py-2.5 text-sm font-semibold text-emerald-200 hover:bg-emerald-950 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh now
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-amber-800/60 bg-amber-950/30 p-4 text-sm text-amber-200">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {!error && loading && (
        <div className="rounded-3xl border border-white/10 bg-[#0b1712] p-8 text-sm text-gray-400">Loading live weather…</div>
      )}

      {data && (
        <div className="bg-[#121a16] border border-[#1e2d26] p-6 md:p-8 rounded-3xl space-y-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#1e2d26] pb-6">
            <div>
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <MapPin className="w-4 h-4" /> {data.location_name || 'Farm location'}, {data.country || ''}
              </div>
              <p className="text-xs text-gray-400 font-mono mt-1">Observed: {observedLabel}</p>
            </div>
            <span className="px-3.5 py-1.5 bg-emerald-950/80 border border-emerald-800/60 text-emerald-300 text-xs font-mono font-bold rounded-full uppercase">
              LIVE • {weather?.meta.provider}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-4">
              {data.icon ? <img src={`https://openweathermap.org/img/wn/${data.icon}@2x.png`} alt={weatherLabel(data.condition, data.description)} className="h-16 w-16" /> : <Sun className="w-16 h-16 text-amber-400" />}
              <div>
                <span className="text-4xl font-black text-white">{data.temperature_c ?? '—'}°C</span>
                <p className="text-xs text-gray-400 capitalize">{weatherLabel(data.condition, data.description)}</p>
              </div>
            </div>

            <div className="p-4 bg-[#0a0f0d] border border-[#1e2d26] rounded-2xl space-y-1">
              <span className="text-[10px] uppercase font-mono text-gray-400 flex items-center gap-1"><Droplets className="w-3.5 h-3.5 text-blue-400" /> Humidity</span>
              <p className="text-xl font-bold text-white">{data.humidity_pct ?? '—'}%</p>
              <p className="text-[11px] text-gray-500">Feels like {data.feels_like_c ?? '—'}°C</p>
            </div>

            <div className="p-4 bg-[#0a0f0d] border border-[#1e2d26] rounded-2xl space-y-1">
              <span className="text-[10px] uppercase font-mono text-gray-400 flex items-center gap-1"><CloudRain className="w-3.5 h-3.5 text-blue-400" /> Rain · 1h</span>
              <p className="text-xl font-bold text-white">{data.rain_1h_mm ?? 0} mm</p>
              <p className="text-[11px] text-gray-500">Clouds {data.cloudiness_pct ?? '—'}%</p>
            </div>

            <div className="p-4 bg-[#0a0f0d] border border-[#1e2d26] rounded-2xl space-y-1">
              <span className="text-[10px] uppercase font-mono text-gray-400 flex items-center gap-1"><Wind className="w-3.5 h-3.5 text-teal-400" /> Wind</span>
              <p className="text-xl font-bold text-white">{data.wind_speed_mps ?? '—'} m/s</p>
              <p className="text-[11px] text-gray-500">Pressure {data.pressure_hpa ?? '—'} hPa</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-white/5 bg-black/20 p-4">
              <span className="text-[10px] uppercase font-mono text-gray-500 flex items-center gap-1"><Gauge className="w-3.5 h-3.5" /> Visibility</span>
              <p className="mt-2 text-lg font-bold text-white">{data.visibility_m != null ? `${(data.visibility_m / 1000).toFixed(1)} km` : '—'}</p>
            </div>
            <div className="rounded-2xl border border-white/5 bg-black/20 p-4">
              <span className="text-[10px] uppercase font-mono text-gray-500">Weather status</span>
              <p className="mt-2 text-lg font-bold text-emerald-300 capitalize">{weatherLabel(data.condition, data.description)}</p>
            </div>
            <div className="rounded-2xl border border-white/5 bg-black/20 p-4">
              <span className="text-[10px] uppercase font-mono text-gray-500">Data source</span>
              <p className="mt-2 text-lg font-bold text-white">OpenWeather</p>
              <p className="text-[11px] text-gray-500">Provider observation time shown above.</p>
            </div>
          </div>
        </div>
      )}

      {forecast.length > 0 && (
        <div className="rounded-3xl border border-white/10 bg-[#0b1712] p-5 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-sky-300">Forecast pipeline</p>
              <h2 className="mt-1 text-xl font-bold text-white">Next 5 days · 3-hour forecast points</h2>
            </div>
            <span className="text-[11px] font-mono text-gray-500">{forecast.length} provider points</span>
          </div>
          <div className="mt-5 grid grid-cols-2 md:grid-cols-5 gap-3">
            {Array.from(new Map(forecast.map((item) => [new Date(item.dt * 1000).toLocaleDateString(), item])).values()).slice(0, 5).map((item, i) => (
              <div key={i} className="rounded-2xl border border-white/5 bg-white/5 p-4">
                <p className="text-xs text-gray-500">{new Date(item.dt * 1000).toLocaleDateString(undefined, { weekday: 'short' })}</p>
                <p className="mt-2 text-2xl font-black text-white">{item.main?.temp ?? '—'}°C</p>
                <p className="mt-1 text-xs text-gray-400 capitalize">{weatherLabel(item.weather?.[0]?.main, item.weather?.[0]?.description)}</p>
                <p className="mt-2 text-[11px] text-cyan-300">Humidity {item.main?.humidity ?? '—'}%</p>
                <p className="text-[11px] text-sky-300">Rain {item.rain?.['3h'] ?? 0} mm / 3h</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
