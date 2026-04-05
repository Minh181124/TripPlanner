'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import MapLibreGL from 'maplibre-gl';
import Map, { Marker, Source, Layer, ViewState } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapPin } from 'lucide-react';

const GOONG_MAP_KEY = process.env.NEXT_PUBLIC_GOONG_MAP_KEY ?? '';

interface MapPlace {
  id: number | string;
  ten: string;
  lat: number;
  lng: number;
  order: number;
}

interface MapRoute {
  polyline: string;
  phuongtien?: string;
}

interface RouteMapProps {
  places: MapPlace[];
  routes?: MapRoute[];
  height?: string;
  className?: string;
}

export function RouteMap({ 
  places, 
  routes = [], 
  height = '400px',
  className = '' 
}: RouteMapProps) {
  const mapRef = useRef<any>(null);
  const [viewState, setViewState] = useState<Partial<ViewState>>({
    longitude: 106.660172, 
    latitude: 10.762622,
    zoom: 12,
  });

  // Fit bounds when places change
  useEffect(() => {
    if (!mapRef.current || places.length === 0) return;

    const bounds = new MapLibreGL.LngLatBounds();
    places.forEach((place) => {
      if (place.lat && place.lng) {
        bounds.extend([place.lng, place.lat]);
      }
    });

    if (!bounds.isEmpty()) {
      mapRef.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 15,
      });
    }
  }, [places]);

  return (
    <div className={`relative rounded-xl overflow-hidden shadow-inner ${className}`} style={{ height }}>
      <Map
        ref={mapRef}
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        mapStyle={`https://tiles.goong.io/assets/goong_map_web.json?api_key=${GOONG_MAP_KEY}`}
        style={{ width: '100%', height: '100%' }}
      >
        {/* Markers */}
        {places.map((place) => (
          <Marker
            key={`${place.id}-${place.order}`}
            longitude={place.lng}
            latitude={place.lat}
            anchor="bottom"
          >
            <div className="relative group cursor-pointer">
              {/* Order Badge */}
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg z-20 whitespace-nowrap">
                {place.order}. {place.ten}
              </div>
              {/* Pin Icon */}
              <div className="text-red-500 transform group-hover:scale-110 transition-transform">
                <MapPin className="w-8 h-8 fill-red-500/20" />
              </div>
              {/* Dot Shadow */}
              <div className="w-2 h-2 bg-black/20 rounded-full mx-auto -mt-1 blur-[1px]"></div>
            </div>
          </Marker>
        ))}

        {/* Routes / Polylines */}
        {routes.map((route, idx) => {
          if (!route.polyline) return null;
          
          try {
            let coordinates: number[][] = [];
            
            // Check if it's GeoJSON or encoded polyline
            if (typeof route.polyline === 'string' && route.polyline.startsWith('{')) {
              const geojson = JSON.parse(route.polyline);
              coordinates = geojson.coordinates || [];
            } else if (typeof route.polyline === 'string') {
              // It's likely an encoded polyline
              coordinates = decodePolyline(route.polyline);
            } else if (typeof route.polyline === 'object' && (route.polyline as any).coordinates) {
              coordinates = (route.polyline as any).coordinates;
            }

            if (coordinates.length < 2) return null;

            const geojsonData = {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: coordinates
              }
            };

            return (
              <Source key={`source-${idx}`} type="geojson" data={geojsonData as any}>
                <Layer
                  id={`layer-${idx}`}
                  type="line"
                  paint={{
                    'line-color': '#4f46e5',
                    'line-width': 4,
                    'line-opacity': 0.8,
                  }}
                  layout={{
                    'line-join': 'round',
                    'line-cap': 'round',
                  }}
                />
                {/* Outline for better visibility */}
                <Layer
                  id={`layer-bg-${idx}`}
                  type="line"
                  paint={{
                    'line-color': '#ffffff',
                    'line-width': 6,
                    'line-opacity': 0.4,
                  }}
                  layout={{
                    'line-join': 'round',
                    'line-cap': 'round',
                  }}
                  beforeId={`layer-${idx}`}
                />
              </Source>
            );
          } catch (e) {
            console.error('Error parsing polyline:', e);
            return null;
          }
        })}
      </Map>

      {/* Floating Info Badge */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-200 shadow-lg text-[10px] font-bold text-slate-700 flex items-center gap-2 z-10">
        <div className="w-2 h-2 rounded-full bg-red-500"></div>
        {places.length} Địa điểm
        <span className="text-slate-300">|</span>
        <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
        Bản đồ Goong
      </div>
    </div>
  );
}

/**
 * Decode polyline from Goong API format
 */
function decodePolyline(encoded: string): number[][] {
  const points: number[][] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < (encoded as any).length) {
    let result = 0;
    let shift = 0;
    let byte;

    do {
      byte = (encoded as any).charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const dlat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    result = 0;
    shift = 0;

    do {
      byte = (encoded as any).charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const dlng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    points.push([lng / 1e5, lat / 1e5]);
  }

  return points;
}
