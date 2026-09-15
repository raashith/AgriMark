'use client';

import React, { useState, useEffect } from 'react';
import { WeatherForecast } from '@/types';
import { dataService } from '@/lib/data-service';
import { CloudSun, Droplets, Wind, AlertTriangle, MapPin, Sun } from 'lucide-react';

export default function WeatherPage() {
  const [forecasts, setForecasts] = useState<WeatherForecast[]>([]);

  useEffect(() => {
    dataService.getWeather().then(setForecasts);
  }, []);

  const today = forecasts[0] || {
    location: 'Thanjavur Delta Region',
    district: 'Thanjavur',
    date: '2026-03-15',
    temp_c: 32,
    temp_min_c: 24,
    temp_max_c: 34,
    condition: 'Partly Cloudy',
    humidity_pct: 68,
    rainfall_mm: 2.0,
    wind_speed_kmh: 14,
    crop_warning: 'Moderate humidity. Monitor paddy crops for early sheath blight.',
    alert_level: 'advisory',
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#121a16] border border-[#1e2d26] p-6 md:p-8 rounded-3xl space-y-2 shadow-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-950/80 border border-emerald-800/60 rounded-full text-xs font-mono font-bold text-emerald-400">
          <CloudSun className="w-4 h-4" /> Climate & Crop Hazard Intelligence
        </div>
        <h1 className="text-2xl md:text-4xl font-extrabold text-white">
          Agri-Climate & Weather Warnings
        </h1>
        <p className="text-sm text-gray-300 max-w-xl">
          High-resolution micro-climate data, rainfall forecasts, and agronomic warnings for farm decision support.
        </p>
      </div>

      {/* Main Weather Card */}
      <div className="bg-[#121a16] border border-[#1e2d26] p-6 md:p-8 rounded-3xl space-y-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#1e2d26] pb-6">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <MapPin className="w-4 h-4" /> {today.location}
            </div>
            <p className="text-xs text-gray-400 font-mono mt-0.5">{today.date}</p>
          </div>

          <span className="px-3.5 py-1.5 bg-amber-950/80 border border-amber-800/60 text-amber-300 text-xs font-mono font-bold rounded-full uppercase">
            {today.alert_level} Advisory
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
          <div className="flex items-center gap-4">
            <Sun className="w-16 h-16 text-amber-400 shrink-0" />
            <div>
              <span className="text-4xl font-black text-white">{today.temp_c}°C</span>
              <p className="text-xs text-gray-400 font-medium">{today.condition}</p>
            </div>
          </div>

          <div className="p-4 bg-[#0a0f0d] border border-[#1e2d26] rounded-2xl space-y-1">
            <span className="text-[10px] uppercase font-mono text-gray-400 flex items-center gap-1">
              <Droplets className="w-3.5 h-3.5 text-blue-400" /> Humidity
            </span>
            <p className="text-xl font-bold text-white">{today.humidity_pct}%</p>
          </div>

          <div className="p-4 bg-[#0a0f0d] border border-[#1e2d26] rounded-2xl space-y-1">
            <span className="text-[10px] uppercase font-mono text-gray-400 flex items-center gap-1">
              <Droplets className="w-3.5 h-3.5 text-blue-400" /> Expected Rainfall
            </span>
            <p className="text-xl font-bold text-white">{today.rainfall_mm} mm</p>
          </div>

          <div className="p-4 bg-[#0a0f0d] border border-[#1e2d26] rounded-2xl space-y-1">
            <span className="text-[10px] uppercase font-mono text-gray-400 flex items-center gap-1">
              <Wind className="w-3.5 h-3.5 text-teal-400" /> Wind Speed
            </span>
            <p className="text-xl font-bold text-white">{today.wind_speed_kmh} km/h</p>
          </div>
        </div>

        {today.crop_warning && (
          <div className="p-4 bg-amber-950/40 border border-amber-800/60 rounded-2xl flex items-center gap-3 text-amber-200 text-xs">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <span className="font-bold text-amber-300">Agronomic Advisory: </span>
              <span>{today.crop_warning}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
