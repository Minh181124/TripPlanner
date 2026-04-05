'use client';

import { useEffect, useRef, useMemo, useState } from 'react';
import Map, { Marker, Source, Layer, ViewState } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useRoutePreview } from '../hooks/useRoutePreview';
import { useItinerary } from '@/features/itinerary';
import { Loader2, AlertCircle, RotateCcw } from 'lucide-react';
import type { DiaDiem } from '@/shared/types/common.types';

/**
 * Kiểu nhẹ chỉ chứa các trường mà PlannerMap thực sự dùng.
 */
type PlannerMapPlace = Pick<DiaDiem, 'diadiem_id' | 'ten' | 'lat' | 'lng'> & {
  instanceId?: string;
};

// ---------------------------------------------------------------------------
// Hằng số
// ---------------------------------------------------------------------------

const GOONG_MAP_KEY = process.env.NEXT_PUBLIC_GOONG_MAP_KEY ?? '';

const DEFAULT_VIEW = {
  longitude: 106.6297,
  latitude: 10.8231,
  zoom: 12,
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface PlannerMapProps {
  googlePlaceIds?: string[];
  places?: PlannerMapPlace[];
  currentDayPlaces?: any[];
  currentDay?: number;
  selectedPlaces?: any[];
  profile?: string;
  className?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Bản đồ MapLibre/Goong tương tác hiển thị tuyến đường và các marker.
 * Sử dụng react-map-gl library với MapLibre backend.
 */
export default function PlannerMap({
  googlePlaceIds = [],
  places = [],
  currentDayPlaces = undefined,
  currentDay = 1,
  selectedPlaces = [],
  profile = 'mapbox/driving-traffic',
  className = '',
}: PlannerMapProps) {
  const dayPlaces = places.length > 0 ? places : currentDayPlaces || [];
  const { coordinates, routeData, isLoading, error } = useRoutePreview(
    googlePlaceIds,
    selectedPlaces,
    profile
  );

  const { getTotalStats } = useItinerary();
  const { totalDistance, totalTime } = useMemo(() => getTotalStats(), [getTotalStats]);

  const mapRef = useRef<any>(null);
  const [viewport, setViewport] = useState<Partial<ViewState>>(DEFAULT_VIEW);
  const [mapError, setMapError] = useState<string | null>(null);
  const [mapLoading, setMapLoading] = useState(true);

  const displayRouteValues = useMemo(() => {
    if (!routeData) return null;

    const distance = routeData.tong_khoangcach ?? 0;
    const isValidDistance = typeof distance === 'number' && !isNaN(distance) && distance > 0;

    const duration = routeData.tong_thoigian ?? 0;
    const isValidDuration = typeof duration === 'number' && !isNaN(duration) && duration > 0;

    return {
      distance: isValidDistance ? (distance / 1000).toFixed(1) : 'N/A',
      duration: isValidDuration ? Math.round(duration / 60) : 'N/A',
      isValid: isValidDistance && isValidDuration,
    };
  }, [routeData]);

  useEffect(() => {
    if (!mapRef.current || dayPlaces.length === 0) return;

    try {
      const map = mapRef.current.getMap?.() || mapRef.current;
      if (!map || !map.fitBounds) return;

      const bounds = dayPlaces.reduce(
        (acc, place) => ({
          minLng: Math.min(acc.minLng, place.lng),
          maxLng: Math.max(acc.maxLng, place.lng),
          minLat: Math.min(acc.minLat, place.lat),
          maxLat: Math.max(acc.maxLat, place.lat),
        }),
        {
          minLng: dayPlaces[0].lng,
          maxLng: dayPlaces[0].lng,
          minLat: dayPlaces[0].lat,
          maxLat: dayPlaces[0].lat,
        }
      );

      if (dayPlaces.length === 1) {
        setViewport({ longitude: dayPlaces[0].lng, latitude: dayPlaces[0].lat, zoom: 15 });
      } else {
        map.fitBounds(
          [[bounds.minLng, bounds.minLat], [bounds.maxLng, bounds.maxLat]],
          { padding: 50, duration: 1000 }
        );
      }
    } catch (err) {
      console.debug('[PlannerMap] Error fitting bounds:', err);
    }
  }, [dayPlaces]);

  if (!GOONG_MAP_KEY) {
    return (
      <div className={`relative w-full h-full rounded-xl overflow-hidden border border-slate-200 shadow-lg flex items-center justify-center bg-slate-50 ${className}`}>
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-3" />
          <p className="text-sm font-semibold text-red-900">Map Configuration Error</p>
          <p className="text-xs text-red-700 mt-1">GOONG_MAP_KEY is not configured</p>
        </div>
      </div>
    );
  }

  const mapStyle = `https://tiles.goong.io/assets/goong_map_web.json?api_key=${GOONG_MAP_KEY}`;

  const routeGeoJSON =
    coordinates && coordinates.length > 1
      ? {
          type: 'Feature' as const,
          geometry: { type: 'LineString' as const, coordinates },
          properties: {},
        }
      : null;

  return (
    <div
      id="planner-map-container"
      className={`relative w-full h-full rounded-xl overflow-hidden border border-slate-200 shadow-lg z-0 ${className}`}
    >
      <div className="absolute inset-0 z-0">
        <Map
          ref={mapRef}
          initialViewState={viewport}
          onMove={(evt) => setViewport(evt.viewState)}
          mapStyle={mapStyle}
          onLoad={() => { setMapLoading(false); setMapError(null); }}
          onError={(err: any) => { setMapError('Error loading map: ' + (err?.message || 'Unknown error')); }}
          style={{ width: '100%', height: '100%' }}
        >
          {routeGeoJSON && (
            <Source id="route-source" type="geojson" data={routeGeoJSON as any}>
              <Layer
                id="route-line"
                type="line"
                paint={{ 'line-color': '#6366f1', 'line-width': 4, 'line-opacity': 0.85 }}
                layout={{ 'line-join': 'round', 'line-cap': 'round' }}
              />
            </Source>
          )}

          {dayPlaces.map((place, idx) => (
            <Marker key={place.instanceId || place.diadiem_id} longitude={place.lng} latitude={place.lat}>
              <div
                className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold border-2 border-white shadow-lg cursor-pointer hover:bg-blue-700 transition-colors"
                title={place.ten}
              >
                {idx + 1}
              </div>
            </Marker>
          ))}
        </Map>
      </div>

      {mapLoading && !mapError && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-[2px] z-30 pointer-events-none">
          <div className="flex items-center gap-2 rounded-lg bg-white px-5 py-3 shadow-lg text-sm font-medium text-slate-900">
            <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
            Đang tải bản đồ…
          </div>
        </div>
      )}

      {mapError && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-[2px] z-30 pointer-events-auto">
          <div className="rounded-lg bg-white border border-red-200 px-6 py-8 shadow-lg text-center max-w-sm">
            <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-red-900 mb-2">Lỗi tải bản đồ</h3>
            <p className="text-xs text-red-700 mb-4">{mapError}</p>
            <button
              onClick={() => { setMapError(null); setMapLoading(true); }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              Thử lại
            </button>
          </div>
        </div>
      )}

      {isLoading && !mapError && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/30 backdrop-blur-[1px] z-20 pointer-events-none">
          <div className="flex items-center gap-2 rounded-lg bg-white px-5 py-3 shadow-lg text-sm font-medium text-slate-900">
            <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
            Đang tải tuyến đường…
          </div>
        </div>
      )}

      {error && !isLoading && !mapError && (
        <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-2.5 text-sm text-red-700 shadow-md z-20">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span className="truncate">{error}</span>
        </div>
      )}
    </div>
  );
}
