'use client';

/**
 * AgriMarkLocationMap — MapLibre GL map component for AgriMark delivery location selection.
 *
 * Uses MapCN component patterns (copy-paste, no CLI required).
 * MapLibre GL is loaded from npm (not CDN) and self-hosted worker files.
 *
 * IMPORTANT: This component is client-only. Always import via:
 *   import dynamic from 'next/dynamic'
 *   const AgriMarkLocationMap = dynamic(() => import('./AgriMarkLocationMap'), { ssr: false })
 */

import React, { useEffect, useRef, useCallback } from 'react';
import type { Map as MapLibreMap, Marker } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Navigation2, Crosshair } from 'lucide-react';

export interface AgriMarkLocationMapProps {
  /** Initial/controlled center position */
  center: { lat: number; lng: number };
  /** Initial zoom level (default 15) */
  zoom?: number;
  /** Called whenever the delivery pin position changes */
  onPinChange: (lat: number, lng: number) => void;
  /** GPS accuracy in metres — shown as overlay if provided */
  accuracy?: number | null;
  /** Additional CSS class for the map wrapper */
  className?: string;
  /** Whether the "locate me" toolbar button should trigger GPS */
  onLocateRequest?: () => void;
}

// AgriMark brand color for the delivery pin
const PIN_COLOR = '#10b981'; // emerald-500
const PIN_BORDER = '#ffffff';

/**
 * Build a custom SVG delivery pin element.
 * Returns an HTMLElement suitable for MapLibre Marker({ element }).
 */
function buildDeliveryPinElement(): HTMLDivElement {
  const wrapper = document.createElement('div');
  wrapper.style.cssText = `
    cursor: grab;
    width: 36px;
    height: 44px;
    display: flex;
    flex-direction: column;
    align-items: center;
    filter: drop-shadow(0 4px 8px rgba(0,0,0,0.45));
  `;
  wrapper.setAttribute('aria-label', 'Delivery location pin — drag to adjust');
  wrapper.innerHTML = `
    <svg width="36" height="44" viewBox="0 0 36 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 0C8.059 0 0 8.059 0 18c0 12.375 16.125 25.125 17.25 26.063a1.125 1.125 0 0 0 1.5 0C19.875 43.125 36 30.375 36 18 36 8.059 27.941 0 18 0z"
            fill="${PIN_COLOR}"/>
      <circle cx="18" cy="18" r="7" fill="${PIN_BORDER}"/>
      <circle cx="18" cy="18" r="4" fill="${PIN_COLOR}"/>
    </svg>
  `;
  return wrapper;
}

/** Accuracy circle overlay using MapLibre GL source/layer */
function addAccuracyCircle(map: MapLibreMap, lat: number, lng: number, accuracyMetres: number) {
  const SOURCE_ID = 'agrimark-accuracy-circle';
  const LAYER_ID = 'agrimark-accuracy-layer';

  const radiusDegrees = accuracyMetres / 111320; // rough metres→degrees at equator

  // GeoJSON circle approximation (64 points)
  const points = 64;
  const coords: [number, number][] = [];
  for (let i = 0; i <= points; i++) {
    const angle = (i / points) * 2 * Math.PI;
    coords.push([lng + radiusDegrees * Math.cos(angle), lat + radiusDegrees * Math.sin(angle)]);
  }

  const geojson = {
    type: 'Feature' as const,
    geometry: { type: 'Polygon' as const, coordinates: [coords] },
    properties: {},
  };

  if (map.getSource(SOURCE_ID)) {
    (map.getSource(SOURCE_ID) as any).setData(geojson);
    return;
  }

  map.addSource(SOURCE_ID, { type: 'geojson', data: geojson });
  map.addLayer({
    id: LAYER_ID,
    type: 'fill',
    source: SOURCE_ID,
    paint: {
      'fill-color': PIN_COLOR,
      'fill-opacity': 0.12,
    },
  });
  map.addLayer({
    id: `${LAYER_ID}-outline`,
    type: 'line',
    source: SOURCE_ID,
    paint: {
      'line-color': PIN_COLOR,
      'line-width': 1.5,
      'line-opacity': 0.5,
    },
  });
}

export function AgriMarkLocationMap({
  center,
  zoom = 15,
  onPinChange,
  accuracy,
  className = '',
  onLocateRequest,
}: AgriMarkLocationMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const lastEmittedRef = useRef<{ lat: number; lng: number } | null>(null);
  const onPinChangeRef = useRef(onPinChange);

  // Keep callback ref fresh without re-running map effects
  useEffect(() => {
    onPinChangeRef.current = onPinChange;
  }, [onPinChange]);

  // Initialize MapLibre GL
  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current) return;

    let cancelled = false;

    async function initMap() {
      // Dynamic import — prevents SSR failures
      const MapLibreGL = await import('maplibre-gl');
      if (cancelled || !containerRef.current) return;

      // Self-host the worker to avoid unpkg CSP issues
      MapLibreGL.setWorkerUrl('/maplibre-gl-worker.mjs');
      const map = new MapLibreGL.Map({
        container: containerRef.current,
        // OpenFreeMap Liberty style — open-source, no API key
        style: 'https://tiles.openfreemap.org/styles/liberty',
        center: [center.lng, center.lat],
        zoom,
        attributionControl: false,
      });

      // Add attribution in compact form
      map.addControl(new MapLibreGL.AttributionControl({ compact: true }), 'bottom-left');

      // Add zoom controls
      map.addControl(new MapLibreGL.NavigationControl({ showCompass: true }), 'bottom-right');

      map.on('load', () => {
        if (cancelled) return;

        // Add accuracy circle if GPS accuracy is known
        if (accuracy && accuracy > 0) {
          addAccuracyCircle(map, center.lat, center.lng, accuracy);
        }
      });

      // Create draggable delivery pin
      const pinEl = buildDeliveryPinElement();
      const marker = new MapLibreGL.Marker({
        element: pinEl,
        draggable: true,
        anchor: 'bottom',
      })
        .setLngLat([center.lng, center.lat])
        .addTo(map);

      const notifyPinChange = (lat: number, lng: number) => {
        lastEmittedRef.current = { lat, lng };
        onPinChangeRef.current(lat, lng);
      };

      marker.on('drag', () => {
        const { lng: mLng, lat: mLat } = marker.getLngLat();
        notifyPinChange(mLat, mLng);
      });

      marker.on('dragend', () => {
        const { lng: mLng, lat: mLat } = marker.getLngLat();
        notifyPinChange(mLat, mLng);
      });

      // Clicking map moves the pin
      map.on('click', (e) => {
        marker.setLngLat(e.lngLat);
        notifyPinChange(e.lngLat.lat, e.lngLat.lng);
      });

      if (cancelled) {
        marker.remove();
        map.remove();
        return;
      }

      mapRef.current = map;
      markerRef.current = marker;
    }

    initMap().catch((err) => {
      console.error('[AgriMarkLocationMap] init failed:', err);
    });

    return () => {
      cancelled = true;
      markerRef.current?.remove();
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally run once

  // Fly map to new center when props update (after GPS or confirm)
  useEffect(() => {
    const map = mapRef.current;
    const marker = markerRef.current;
    if (!map || !marker) return;

    // Check if update came from pin drag to prevent flyTo stutter
    const lastEmitted = lastEmittedRef.current;
    if (
      lastEmitted &&
      Math.abs(lastEmitted.lat - center.lat) < 1e-6 &&
      Math.abs(lastEmitted.lng - center.lng) < 1e-6
    ) {
      return;
    }

    map.flyTo({ center: [center.lng, center.lat], zoom, speed: 1.2 });
    marker.setLngLat([center.lng, center.lat]);

    // Update accuracy circle if map is loaded
    if (map.isStyleLoaded() && accuracy && accuracy > 0) {
      addAccuracyCircle(map, center.lat, center.lng, accuracy);
    }
  }, [center.lat, center.lng, zoom, accuracy]);

  const handleLocate = useCallback(() => {
    onLocateRequest?.();
  }, [onLocateRequest]);

  return (
    <div className={`relative w-full rounded-2xl overflow-hidden border border-[#1e2d26] shadow-inner bg-[#0a0f0d] ${className}`}
         style={{ minHeight: '280px' }}>
      {/* MapLibre container */}
      <div
        ref={containerRef}
        className="w-full h-full absolute inset-0"
        role="application"
        aria-label="Delivery location map — drag the pin or click to select"
        style={{ minHeight: '280px' }}
      />

      {/* GPS accuracy overlay */}
      {accuracy !== null && accuracy !== undefined && (
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-3 py-1.5 bg-black/75 text-emerald-300 font-mono text-[11px] font-bold rounded-full border border-emerald-800/60 backdrop-blur-md"
             aria-live="polite">
          <Crosshair className="w-3 h-3" />
          <span>±{Math.round(accuracy)} m</span>
        </div>
      )}

      {/* Locate me button */}
      {onLocateRequest && (
        <button
          type="button"
          onClick={handleLocate}
          className="absolute top-3 right-3 z-10 p-2.5 bg-[#1B4D3E] hover:bg-emerald-700 border border-emerald-700 text-white rounded-xl shadow-lg transition focus:outline-none focus:ring-2 focus:ring-emerald-500"
          aria-label="Use my current GPS location"
          title="Use my current location"
        >
          <Navigation2 className="w-4 h-4" />
        </button>
      )}

      {/* Drag hint */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 px-3 py-1 bg-[#121a16]/90 text-gray-400 font-mono text-[10px] rounded-lg border border-[#1e2d26] pointer-events-none whitespace-nowrap">
        Drag pin or tap map to select delivery point
      </div>
    </div>
  );
}

export default AgriMarkLocationMap;
