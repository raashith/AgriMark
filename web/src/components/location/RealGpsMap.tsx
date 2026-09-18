'use client';

import React, { useEffect, useRef } from 'react';

interface RealGpsMapProps {
  center: { lat: number; lng: number };
  onPinChange: (lat: number, lng: number) => void;
  accuracy?: number | null;
}

export const RealGpsMap: React.FC<RealGpsMapProps> = ({ center, onPinChange, accuracy }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;

    // Dynamically load Leaflet CSS if not already present
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    const initMap = () => {
      const L = (window as any).L;
      if (!L) return;

      if (!mapInstanceRef.current && mapContainerRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: [center.lat, center.lng],
          zoom: 15,
          zoomControl: true,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap contributors',
        }).addTo(map);

        const customIcon = L.divIcon({
          className: 'custom-leaflet-marker',
          html: `<div style="background-color:#10b981; width:28px; height:28px; border-radius:50%; border:3px solid #ffffff; box-shadow:0 10px 15px -3px rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; color:#ffffff; font-weight:bold;">📍</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const marker = L.marker([center.lat, center.lng], {
          draggable: true,
          icon: customIcon,
        }).addTo(map);

        marker.on('dragend', (e: any) => {
          const position = e.target.getLatLng();
          onPinChange(position.lat, position.lng);
        });

        map.on('click', (e: any) => {
          marker.setLatLng(e.latlng);
          onPinChange(e.latlng.lat, e.latlng.lng);
        });

        mapInstanceRef.current = map;
        markerInstanceRef.current = marker;
      } else if (mapInstanceRef.current && markerInstanceRef.current) {
        mapInstanceRef.current.setView([center.lat, center.lng]);
        markerInstanceRef.current.setLatLng([center.lat, center.lng]);
      }
    };

    if (!(window as any).L) {
      const existingScript = document.getElementById('leaflet-js') as HTMLScriptElement | null;
      if (existingScript) {
        existingScript.addEventListener('load', () => initMap());
      } else {
        const script = document.createElement('script');
        script.id = 'leaflet-js';
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.async = true;
        script.onload = () => initMap();
        document.body.appendChild(script);
      }
    } else {
      initMap();
    }
  }, [center.lat, center.lng, onPinChange]);

  return (
    <div className="relative w-full h-64 rounded-2xl overflow-hidden border border-[#1e2d26] shadow-inner">
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {accuracy !== undefined && accuracy !== null && (
        <div className="absolute top-3 left-3 z-20 px-3 py-1 bg-black/80 text-emerald-300 font-mono text-[11px] font-bold rounded-full border border-emerald-800/60 backdrop-blur-md">
          Accuracy: {Math.round(accuracy)} m
        </div>
      )}

      <div className="absolute bottom-3 right-3 z-20 px-3 py-1 bg-[#121a16]/90 text-gray-300 font-mono text-[10px] rounded-lg border border-[#1e2d26]">
        Drag pin to adjust delivery point
      </div>
    </div>
  );
};
