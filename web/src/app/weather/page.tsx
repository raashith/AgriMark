'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity, AlertTriangle, CloudRain, Droplets, Eye, Gauge, MapPin,
  RefreshCw, Sun, Wind,
} from 'lucide-react';

type ForecastItem = {
  dt: number;
  main?: { temp?: number; humidity?: number; feels_like?: number };
  weather?: Array<{ main?: string; description?: string; icon?: string }>;
  rain?: { '3h'?: number };
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

const label = (main?: string | null, description?: string | null) => description || main || 'Current conditions';
const iconUrl = (icon?: string | null) => icon ? `https://openweathermap.org/img/wn/${icon}@2x.png` : null;

export default function WeatherPage() {
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number; label: string } | null>(null);
  const [weather, setWeather] = useState<LiveWeather | null>(null);
  const [forecast, setForecast] = useState<ForecastItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadWeather = async () => {
    try {
      setRefreshing(true); setLoading(true); setError(null);
      let lat = coordinates?.latitude ?? null;
      let lon = coordinates?.longitude ?? null;

      if (lat == null || lon == null) {
        const stored = window.localStorage.getItem('agrimark.weather.coordinates');
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (Number.isFinite(parsed.latitude) && Number.isFinite(parsed.longitude)) {
              lat = Number(parsed.latitude); lon = Number(parsed.longitude);
              setCoordinates({ latitude: lat, longitude: lon, label: parsed.label || 'Selected farm' });
            }
          } catch {}
        }
      }
      if (lat == null || lon == null) { lat = 13.1143; lon = 80.1081; }

      const params = new URLSearchParams({ latitude: String(lat), longitude: String(lon) });
      const [currentResponse, forecastResponse] = await Promise.all([
        fetch(`/api/v1/interoperability/weather?${params}`, { cache: 'no-store' }),
        fetch(`/api/v1/interoperability/weather/forecast?${params}`, { cache: 'no-store' }),
      ]);
      const [currentPayload, forecastPayload] = await Promise.all([
        currentResponse.json().catch(() => null),
        forecastResponse.json().catch(() => null),
      ]);
      if (!currentResponse.ok || !forecastResponse.ok) {
        throw new Error(currentPayload?.meta?.message || forecastPayload?.meta?.message || 'Live weather provider is temporarily unavailable.');
      }
      setWeather(currentPayload);
      setForecast(Array.isArray(forecastPayload?.data?.items) ? forecastPayload.data.items : []);
    } catch (err) {
      setWeather(null); setForecast([]);
      setError(err instanceof Error ? err.message : 'Unable to load live weather.');
    } finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => {
    const stored = window.localStorage.getItem('agrimark.weather.coordinates');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Number.isFinite(parsed.latitude) && Number.isFinite(parsed.longitude)) {
          setCoordinates({ latitude: Number(parsed.latitude), longitude: Number(parsed.longitude), label: parsed.label || 'Selected farm' });
        }
      } catch {}
    }
    void loadWeather();
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => void loadWeather(), 15 * 60 * 1000);
    return () => window.clearInterval(timer);
  }, [coordinates]);

  const data = weather?.data;
  const observed = useMemo(() => data?.observed_at ? new Date(data.observed_at).toLocaleString() : 'Not available', [data?.observed_at]);
  const dailyForecast = useMemo(() => {
    const grouped = new Map<string, ForecastItem>();
    for (const item of forecast) {
      const key = new Date(item.dt * 1000).toLocaleDateString();
      if (!grouped.has(key)) grouped.set(key, item);
    }
    return Array.from(grouped.values()).slice(0, 5);
  }, [forecast]);

  return (
    <div className="relative space-y-6">
      <section className="overflow-hidden rounded-[26px] border border-[#24382e] bg-[#07110d] shadow-[0_24px_90px_rgba(0,0,0,0.32)]">
        <div className="relative p-6 md:p-8">
          <div className="pointer-events-none absolute inset-0 tech-grid opacity-30" />
          <div className="pointer-events-none absolute -top-16 right-10 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#3e7b54]/60 bg-[#1b4d3e]/35 px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-[#9bc7a2]"><Activity className="h-3.5 w-3.5" /> Live Weather Intelligence</div>
              <h1 className="mt-4 text-[34px] font-bold tracking-tight text-[#f7f5ee] md:text-5xl">Weather that follows the farm.</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#adbdb2] md:text-base">Live conditions plus a 5-day planning window using the farm coordinates saved in AgriMark.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-[20px] border border-white/10 bg-white/[0.04] px-5 py-4 backdrop-blur">
                <p className="text-[10px] font-mono uppercase tracking-[0.16em] text-sky-300">Current</p>
                <p className="mt-1 text-4xl font-black text-[#f7f5ee]">{data?.temperature_c != null ? `${data.temperature_c}°C` : '— °C'}</p>
              </div>
              <button onClick={() => void loadWeather()} disabled={refreshing} className="inline-flex items-center gap-2 rounded-xl border border-[#3e7b54] bg-[#1b4d3e] px-4 py-3 text-sm font-bold text-[#f7f5ee] hover:bg-[#2b6650] disabled:opacity-50"><RefreshCw className={refreshing ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />Refresh</button>
            </div>
          </div>
          {data && <div className="relative mt-6 flex flex-col gap-2 border-t border-white/10 pt-4 text-xs text-[#adbdb2] sm:flex-row sm:items-center sm:justify-between"><span className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-[#52a67a]" />{data.location_name || coordinates?.label || 'Selected farm'} {data.country || ''}</span><span className="font-mono">Observed {observed} · {weather?.meta.provider}</span></div>}
        </div>
      </section>

      {error && <section className="rounded-2xl border border-amber-800/50 bg-amber-950/20 p-4 text-sm text-amber-200"><div className="flex gap-3"><AlertTriangle className="h-4 w-4 text-amber-300" /><div><p className="font-semibold text-amber-100">Weather feed needs attention</p><p className="mt-1 text-amber-200/80">{error}</p></div></div></section>}
      {!data && !error && loading && <section className="rounded-[20px] border border-white/10 bg-[#0e1712] p-8 text-sm text-[#adbdb2]">Loading the live farm weather feed…</section>}

      {data && <>
        <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1.45fr_repeat(4,minmax(0,1fr))]">
          <div className="rounded-[20px] border border-white/10 bg-[#0e1712] p-5"><div className="flex items-start justify-between"><div><p className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#3e7b54]">Current conditions</p><p className="mt-1 text-sm capitalize text-[#adbdb2]">{label(data.condition,data.description)}</p></div>{iconUrl(data.icon)?<img src={iconUrl(data.icon)!} alt={label(data.condition,data.description)} className="h-16 w-16"/>:<Sun className="h-14 w-14 text-[#e5a93c]"/>}</div><p className="mt-1 text-5xl font-black text-[#f7f5ee]">{data.temperature_c ?? '—'}°</p><p className="mt-1 text-xs text-gray-500">Feels like {data.feels_like_c ?? '—'}°C</p></div>
          {[
            {label:'Humidity',value:`${data.humidity_pct ?? '—'}%`,icon:Droplets},
            {label:'Rain (1h)',value:`${data.rain_1h_mm ?? 0} mm`,icon:CloudRain},
            {label:'Wind',value:`${data.wind_speed_mps ?? '—'} m/s`,icon:Wind},
            {label:'Pressure',value:`${data.pressure_hpa ?? '—'} hPa`,icon:Gauge},
          ].map((m)=>{const Icon=m.icon;return <div key={m.label} className="rounded-[20px] border border-white/10 bg-[#0e1712] p-5 shadow-lg"><Icon className="h-5 w-5 text-[#52a67a]"/><p className="mt-5 text-[10px] font-mono uppercase tracking-[0.18em] text-gray-500">{m.label}</p><p className="mt-1 text-2xl font-black text-[#f7f5ee]">{m.value}</p></div>})}
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.65fr_0.75fr]">
          <div className="rounded-[20px] border border-white/10 bg-[#0e1712] p-5 md:p-6">
            <div className="flex items-end justify-between gap-3"><div><p className="text-[10px] font-mono uppercase tracking-[0.18em] text-sky-300">Forecast pipeline</p><h2 className="mt-1 text-[21px] font-bold text-[#f7f5ee]">Next 5 days</h2></div><span className="hidden text-[11px] font-mono text-gray-500 md:block">OpenWeather · 3-hour points</span></div>
            {dailyForecast.length > 0 ? <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-5">{dailyForecast.map((item,i)=><div key={i} className="rounded-2xl border border-white/5 bg-white/[0.03] p-4"><p className="text-xs font-semibold text-gray-400">{new Date(item.dt*1000).toLocaleDateString(undefined,{weekday:'short'})}</p>{iconUrl(item.weather?.[0]?.icon)&&<img src={iconUrl(item.weather?.[0]?.icon)!} alt={label(item.weather?.[0]?.main,item.weather?.[0]?.description)} className="my-2 h-12 w-12"/>}<p className="text-2xl font-black text-white">{item.main?.temp ?? '—'}°C</p><p className="mt-1 line-clamp-2 text-xs capitalize text-gray-400">{label(item.weather?.[0]?.main,item.weather?.[0]?.description)}</p><div className="mt-3 space-y-1 text-[11px]"><p className="text-cyan-300">Humidity {item.main?.humidity ?? '—'}%</p><p className="text-sky-300">Rain {item.rain?.['3h'] ?? 0} mm / 3h</p></div></div>)}</div> : <div className="mt-5 rounded-2xl border border-dashed border-white/10 p-6 text-sm text-gray-500">Forecast points are not available yet.</div>}
          </div>
          <div className="rounded-[20px] border border-white/10 bg-[#0e1712] p-5 md:p-6"><p className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#3e7b54]">Farm context</p><h2 className="mt-1 text-[21px] font-bold text-[#f7f5ee]">Decision signals</h2><div className="mt-5 space-y-3"><div className="rounded-2xl bg-white/[0.03] p-4"><div className="flex justify-between text-xs"><span className="text-gray-500">Cloud cover</span><span className="font-bold text-white">{data.cloudiness_pct ?? '—'}%</span></div><div className="mt-2 h-1.5 rounded-full bg-white/10"><div className="h-full rounded-full bg-emerald-400" style={{width:`${Math.min(100,Math.max(0,Number(data.cloudiness_pct||0)))}%`}}/></div></div><div className="rounded-2xl bg-white/[0.03] p-4"><div className="flex items-center gap-2"><Eye className="h-4 w-4 text-sky-300"/><span className="text-xs text-gray-500">Visibility</span></div><p className="mt-2 text-lg font-bold text-white">{data.visibility_m != null ? `${(data.visibility_m/1000).toFixed(1)} km` : '—'}</p></div><div className="rounded-2xl border border-[#3e7b54]/50 bg-[#1b4d3e]/20 p-4"><p className="text-[10px] font-mono uppercase tracking-[0.16em] text-[#9bc7a2]">Data provenance</p><p className="mt-2 text-sm text-emerald-100">Live provider observation · {observed}</p></div></div></div>
        </section>
      </>}
    </div>
  );
}
