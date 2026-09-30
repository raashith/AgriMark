'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  CloudRain,
  CloudSun,
  Droplets,
  Eye,
  Gauge,
  MapPin,
  RefreshCw,
  Sun,
  Wind,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { dataService } from '@/lib/data-service';

type ForecastItem = {
  dt: number;
  main?: { temp?: number; humidity?: number; feels_like?: number };
  weather?: Array<{ main?: string; description?: string; icon?: string }>;
  rain?: { '3h'?: number };
  wind?: { speed?: number };
  clouds?: { all?: number };
};

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
  meta: { provider: string; observed_at?: string | null };
};

const weatherLabel = (condition?: string | null, description?: string | null) =>
  description || condition || 'Current conditions';

const iconUrl = (icon?: string | null) =>
  icon ? `https://openweathermap.org/img/wn/${icon}@2x.png` : null;

export default function WeatherPage() {
  const { user } = useAuth();
  const [manualCoordinates, setManualCoordinates] = useState<{ latitude: number; longitude: number; label: string } | null>(null);
  const [weather, setWeather] = useState<LiveWeather | null>(null);
  const [forecast, setForecast] = useState<ForecastItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [farmLabel, setFarmLabel] = useState<string>('Farm weather');

  const loadWeather = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setRefreshing(true);
      setError(null);

      let farms: Awaited<ReturnType<typeof dataService.getFarms>> = [];
      try {
        farms = await Promise.race([
          dataService.getFarms(user.id),
          new Promise<Awaited<ReturnType<typeof dataService.getFarms>>>((resolve) => window.setTimeout(() => resolve([]), 5000)),
        ]);
      } catch {}

      const farm = farms.find((item) => item.latitude != null && item.longitude != null);

      let latitude = farm?.latitude ?? null;
      let longitude = farm?.longitude ?? null;

      if (latitude == null || longitude == null) {
        const stored = typeof window !== 'undefined'
          ? window.localStorage.getItem('agrimark.weather.coordinates')
          : null;
        if (stored) {
          try {
            const parsed = JSON.parse(stored) as { latitude?: number; longitude?: number; label?: string };
            if (Number.isFinite(parsed.latitude) && Number.isFinite(parsed.longitude)) {
              latitude = parsed.latitude as number;
              longitude = parsed.longitude as number;
              setManualCoordinates({ latitude, longitude, label: parsed.label || 'Selected farm' });
              setFarmLabel(parsed.label || 'Selected farm');
            }
          } catch {}
        }
      }

      if (latitude == null || longitude == null) {
        setWeather(null);
        setForecast([]);
        setError('No farm GPS coordinates are saved yet. Add coordinates in My Farms, or select a location below to preview live weather.');
        return;
      }

      if (farm?.name || farm?.village || farm?.district) {
        setFarmLabel(farm.name || [farm.village, farm.district].filter(Boolean).join(', ') || 'Farm weather');
      }

      const params = new URLSearchParams({
        latitude: String(latitude),
        longitude: String(longitude),
      });

      const [currentResponse, forecastResponse] = await Promise.all([
        fetch(`/api/v1/interoperability/weather?${params.toString()}`, {
          cache: 'no-store',
        }),
        fetch(`/api/v1/interoperability/weather/forecast?${params.toString()}`, {
          cache: 'no-store',
        }),
      ]);

      const [currentPayload, forecastPayload] = await Promise.all([
        currentResponse.json().catch(() => null),
        forecastResponse.json().catch(() => null),
      ]);

      if (!currentResponse.ok || !forecastResponse.ok) {
        const message =
          currentPayload?.meta?.message ||
          forecastPayload?.meta?.message ||
          'Live weather provider is temporarily unavailable.';
        throw new Error(message);
      }

      setWeather(currentPayload);
      setForecast(forecastPayload?.data?.items || []);
    } catch (err) {
      setWeather(null);
      setForecast([]);
      setError(err instanceof Error ? err.message : 'Unable to load live weather.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem('agrimark.weather.coordinates');
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as { latitude?: number; longitude?: number; label?: string };
        if (Number.isFinite(parsed.latitude) && Number.isFinite(parsed.longitude)) {
          setManualCoordinates({
            latitude: parsed.latitude as number,
            longitude: parsed.longitude as number,
            label: parsed.label || 'Selected farm',
          });
          setFarmLabel(parsed.label || 'Selected farm');
        }
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (user?.id || manualCoordinates) void loadWeather();
  }, [user?.id, manualCoordinates]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (user?.id) void loadWeather();
    }, 15 * 60 * 1000);
    return () => window.clearInterval(timer);
  }, [user?.id]);

  const data = weather?.data;
  const observedLabel = useMemo(
    () => (data?.observed_at ? new Date(data.observed_at).toLocaleString() : 'Not available'),
    [data?.observed_at],
  );

  const dailyForecast = useMemo(() => {
    const grouped = new Map<string, ForecastItem>();
    for (const item of forecast) {
      const dateKey = new Date(item.dt * 1000).toLocaleDateString();
      if (!grouped.has(dateKey)) grouped.set(dateKey, item);
    }
    return Array.from(grouped.values()).slice(0, 5);
  }, [forecast]);

  return (
    <div className="relative space-y-6 overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 bg-[radial-gradient(circle_at_15%_10%,rgba(34,197,94,0.16),transparent_35%),radial-gradient(circle_at_90%_15%,rgba(56,189,248,0.13),transparent_32%)]" />

      <section className="rounded-[30px] border border-emerald-900/50 bg-[#0b1611] shadow-[0_24px_90px_rgba(0,0,0,0.32)] overflow-hidden">
        <div className="relative p-6 md:p-8">
          <div className="absolute -right-16 -top-20 h-52 w-52 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="absolute bottom-0 right-24 h-40 w-40 rounded-full bg-sky-500/10 blur-3xl" />

          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-800/70 bg-emerald-950/60 px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-emerald-300">
                <Activity className="h-3.5 w-3.5" />
                Live Weather Intelligence
              </div>
              <h1 className="mt-4 text-3xl font-black tracking-tight text-white md:text-5xl">
                Weather that follows the farm.
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-300 md:text-base">
                Real-time OpenWeather observations and a short-range forecast, anchored to the GPS coordinates saved on your AgriMark farm.
              </p>
            </div>

            <button
              onClick={() => void loadWeather()}
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-700/70 bg-emerald-950/60 px-4 py-3 text-sm font-bold text-emerald-100 shadow-lg shadow-emerald-950/20 transition hover:border-emerald-500 hover:bg-emerald-900/60 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh live data
            </button>
          </div>

          {data && (
            <div className="relative mt-6 flex flex-col gap-3 border-t border-white/10 pt-4 text-xs text-gray-400 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-emerald-400" />
                <span className="font-semibold text-gray-200">{data.location_name || farmLabel}</span>
                <span>{data.country || ''}</span>
              </div>
              <div className="font-mono">
                Observed {observedLabel} · Source {weather?.meta.provider}
              </div>
            </div>
          )}
        </div>
      </section>

      {error && (
        <section className="rounded-2xl border border-amber-800/50 bg-amber-950/20 p-4">
          <div className="flex items-start gap-3 text-sm text-amber-200">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-amber-100">Weather feed needs attention</p>
              <p className="mt-1 text-amber-200/80">{error}</p>
              {!weather && (
                <form
                  className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3"
                  onSubmit={(event) => {
                    event.preventDefault();
                    const form = event.currentTarget;
                    const lat = Number((form.elements.namedItem('latitude') as HTMLInputElement).value);
                    const lon = Number((form.elements.namedItem('longitude') as HTMLInputElement).value);
                    const label = String((form.elements.namedItem('label') as HTMLInputElement).value || 'Selected farm');
                    if (!Number.isFinite(lat) || !Number.isFinite(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
                      setError('Enter valid latitude and longitude values.');
                      return;
                    }
                    window.localStorage.setItem('agrimark.weather.coordinates', JSON.stringify({ latitude: lat, longitude: lon, label }));
                    setFarmLabel(label);
                    void loadWeather();
                  }}
                >
                  <input name="label" placeholder="Farm / village name" className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-gray-600 outline-none focus:border-emerald-600" />
                  <input name="latitude" inputMode="decimal" placeholder="Latitude" className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-gray-600 outline-none focus:border-emerald-600" />
                  <div className="flex gap-2">
                    <input name="longitude" inputMode="decimal" placeholder="Longitude" className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-gray-600 outline-none focus:border-emerald-600" />
                    <button type="submit" className="rounded-xl bg-emerald-500 px-4 py-2 text-xs font-black text-[#04100B] hover:bg-emerald-400">Load</button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </section>
      )}

      {!data && !error && loading && (
        <section className="rounded-3xl border border-white/10 bg-[#0b1712] p-8 text-sm text-gray-400">
          Loading the live farm weather feed…
        </section>
      )}

      {data && (
        <>
          <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1.45fr_repeat(4,minmax(0,1fr))]">
            <div className="rounded-3xl border border-white/10 bg-[#0d1914] p-5 shadow-xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-emerald-400">Current conditions</p>
                  <p className="mt-1 text-sm text-gray-400 capitalize">{weatherLabel(data.condition, data.description)}</p>
                </div>
                {iconUrl(data.icon) ? (
                  <img
                    src={iconUrl(data.icon)!}
                    alt={weatherLabel(data.condition, data.description)}
                    className="h-16 w-16"
                  />
                ) : (
                  <Sun className="h-14 w-14 text-amber-300" />
                )}
              </div>
              <div className="mt-2 flex items-end gap-2">
                <span className="text-5xl font-black tracking-tight text-white">{data.temperature_c ?? '—'}°</span>
                <span className="pb-1 text-sm font-semibold text-gray-400">C</span>
              </div>
              <p className="mt-2 text-xs text-gray-500">Feels like {data.feels_like_c ?? '—'}°C</p>
            </div>

            {[
              { label: 'Humidity', value: `${data.humidity_pct ?? '—'}%`, icon: Droplets },
              { label: 'Rain (1h)', value: `${data.rain_1h_mm ?? 0} mm`, icon: CloudRain },
              { label: 'Wind', value: `${data.wind_speed_mps ?? '—'} m/s`, icon: Wind },
              { label: 'Pressure', value: `${data.pressure_hpa ?? '—'} hPa`, icon: Gauge },
            ].map((metric) => (
              <div key={metric.label} className="group rounded-3xl border border-white/10 bg-[#0d1914] p-5 shadow-lg transition hover:-translate-y-0.5 hover:border-emerald-900/80">
                <metric.icon className="h-5 w-5 text-emerald-300" />
                <p className="mt-5 text-[10px] font-mono uppercase tracking-[0.18em] text-gray-500">{metric.label}</p>
                <p className="mt-1 text-2xl font-black text-white">{metric.value}</p>
              </div>
            ))}
          </section>

          <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.65fr_0.75fr]">
            <div className="rounded-3xl border border-white/10 bg-[#0b1712] p-5 md:p-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-sky-300">Forecast pipeline</p>
                  <h2 className="mt-1 text-xl font-bold text-white">Next 5 days</h2>
                </div>
                <span className="text-[11px] font-mono text-gray-500">OpenWeather · 3-hour forecast points</span>
              </div>

              {dailyForecast.length > 0 ? (
                <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-5">
                  {dailyForecast.map((item, index) => (
                    <div key={index} className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">
                      <p className="text-xs font-semibold text-gray-400">
                        {new Date(item.dt * 1000).toLocaleDateString(undefined, { weekday: 'short' })}
                      </p>
                      {iconUrl(item.weather?.[0]?.icon) && (
                        <img
                          src={iconUrl(item.weather?.[0]?.icon)!}
                          alt={weatherLabel(item.weather?.[0]?.main, item.weather?.[0]?.description)}
                          className="my-2 h-12 w-12"
                        />
                      )}
                      <p className="text-2xl font-black text-white">{item.main?.temp ?? '—'}°C</p>
                      <p className="mt-1 line-clamp-2 text-xs capitalize text-gray-400">{weatherLabel(item.weather?.[0]?.main, item.weather?.[0]?.description)}</p>
                      <div className="mt-3 space-y-1 text-[11px]">
                        <p className="text-cyan-300">Humidity {item.main?.humidity ?? '—'}%</p>
                        <p className="text-sky-300">Rain {item.rain?.['3h'] ?? 0} mm / 3h</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-5 rounded-2xl border border-dashed border-white/10 p-6 text-sm text-gray-500">
                  Forecast points are not available yet.
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#0b1712] p-5 md:p-6">
              <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-emerald-400">Farm context</p>
              <h2 className="mt-1 text-xl font-bold text-white">Decision signals</h2>

              <div className="mt-5 space-y-3">
                <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Cloud cover</span>
                    <span className="font-bold text-white">{data.cloudiness_pct ?? '—'}%</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-emerald-400" style={{ width: `${Math.min(100, Math.max(0, Number(data.cloudiness_pct || 0)))}%` }} />
                  </div>
                </div>

                <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-sky-300" />
                    <span className="text-xs text-gray-500">Visibility</span>
                  </div>
                  <p className="mt-2 text-lg font-bold text-white">
                    {data.visibility_m != null ? `${(data.visibility_m / 1000).toFixed(1)} km` : '—'}
                  </p>
                </div>

                <div className="rounded-2xl border border-emerald-900/40 bg-emerald-950/20 p-4">
                  <p className="text-[10px] font-mono uppercase tracking-[0.16em] text-emerald-300">Data provenance</p>
                  <p className="mt-2 text-sm text-emerald-100">
                    Live provider observation · {observedLabel}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
