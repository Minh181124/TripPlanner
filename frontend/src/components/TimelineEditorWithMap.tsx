'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  Clock,
  MapPin,
  Navigation,
  Car,
  Sunrise,
  Sun,
  Sunset,
  Moon,
  Loader,
  Search,
  Zap,
  AlertCircle,
  Plus,
  Map as MapIcon,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  GripVertical,
  Trash2
} from 'lucide-react';
import MapLibreGL from 'maplibre-gl';
import Map, { Marker, Source, Layer, ViewState } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useItinerary, StartLocation, useCalculateTimeline } from '@/features/itinerary';
import { useRouter } from 'next/navigation';
import apiClient from '@/shared/api/apiClient';

const GOONG_MAP_KEY = process.env.NEXT_PUBLIC_GOONG_MAP_KEY ?? '';

interface TimelineRoute {
  startIndex: number;
  endIndex: number;
  allRoutes: any[];
  selectedRouteIndex: number;
}

interface StartLocationSearchResult {
  place_id?: string;
  description?: string;
  main_text?: string;
  secondary_text?: string;
  diadiem_id?: number;
  ten: string;
  diachi: string;
  lat: number | null;
  lng: number | null;
  loai?: string;
  google_place_id?: string;
}

export function TimelineEditorWithMap() {
  const router = useRouter();
  const { 
    itinerary, 
    updateDayConfig, 
    updatePlaceStayDuration,
    updateItineraryTitle,
    updateStartDate,
    updateNumberOfDays,
    setCurrentDay,
    reorderPlacesInDay,
    removePlaceFromDay,
  } = useItinerary();
  const { calculateTimeline } = useCalculateTimeline();

  const currentDay = itinerary.currentDay;
  const dayData = itinerary.days[currentDay - 1];

  // Itinerary title state
  const [tieude, setTieude] = useState(itinerary.tieude || '');
  const [ngaybatdau, setNgaybatdau] = useState(
    itinerary.ngaybatdau 
      ? new Date(itinerary.ngaybatdau).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]
  );
  const [soNgay, setSoNgay] = useState(itinerary.so_ngay);

  // Map state
  const mapRef = useRef<any>(null);
  const [viewState, setViewState] = useState<Partial<ViewState>>({
    longitude: 105.8542,
    latitude: 21.0285,
    zoom: 12,
  });

  // Timeline calculation state
  const [travelRoutes, setTravelRoutes] = useState<TimelineRoute[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculationError, setCalculationError] = useState<string | null>(null);
  const [transportModes, setTransportModes] = useState<Record<number, string>>({});

  // Start location search
  const [startLocationQuery, setStartLocationQuery] = useState('');
  const [startLocationResults, setStartLocationResults] = useState<StartLocationSearchResult[]>([]);
  const [startLocationLoading, setStartLocationLoading] = useState(false);
  const [startLocationOpen, setStartLocationOpen] = useState(false);
  const startLocationSearchRef = useRef<HTMLDivElement>(null);
  const startLocationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // End location search
  const [endLocationQuery, setEndLocationQuery] = useState('');
  const [endLocationResults, setEndLocationResults] = useState<StartLocationSearchResult[]>([]);
  const [endLocationLoading, setEndLocationLoading] = useState(false);
  const [endLocationOpen, setEndLocationOpen] = useState(false);
  const endLocationSearchRef = useRef<HTMLDivElement>(null);
  const endLocationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Edit state
  const [editingInstanceId, setEditingInstanceId] = useState<string | null>(null);
  const [editingStayDuration, setEditingStayDuration] = useState<number>(60);

  // Sidebar toggle state
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Time state
  const [startTime, setStartTime] = useState(dayData?.startTime || '08:00');

  // Drag and Drop State
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const [isDragOverDelete, setIsDragOverDelete] = useState(false);

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, idx: number) => {
    setDraggedIdx(idx);
    e.dataTransfer.effectAllowed = 'move';
    // Small delay to prevent ghost image from disappearing
    setTimeout(() => {
      if (e.target && e.target instanceof HTMLElement) {
        e.target.style.opacity = '0.5';
      }
    }, 0);
  };

  const handleDragEnter = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (draggedIdx !== null && draggedIdx !== idx) {
      setDragOverIdx(idx);
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    if (e.target && e.target instanceof HTMLElement) {
      e.target.style.opacity = '1';
    }
    
    if (draggedIdx !== null && dragOverIdx !== null && draggedIdx !== dragOverIdx) {
      const newPlaces = [...(dayData?.places || [])];
      const draggedItem = newPlaces[draggedIdx];
      newPlaces.splice(draggedIdx, 1);
      newPlaces.splice(dragOverIdx, 0, draggedItem);
      
      reorderPlacesInDay(currentDay, newPlaces);
      setTimeout(() => handleAutoCalculate(), 100);
    }
    
    setDraggedIdx(null);
    setDragOverIdx(null);
  };

  const handleDeleteDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOverDelete(true);
    // Unset dragOverIdx so reorder doesn't happen if dropped here
    setDragOverIdx(null);
  };

  const handleDeleteDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverDelete(false);
  };

  const handleDeleteDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverDelete(false);
    if (draggedIdx !== null && dayData?.places?.[draggedIdx]) {
      const placeToRemove = dayData.places[draggedIdx];
      removePlaceFromDay(currentDay, placeToRemove.instanceId);
      setTimeout(() => handleAutoCalculate(), 100);
    }
    setDraggedIdx(null);
    setDragOverIdx(null);
  };

  // Initialize
  useEffect(() => {
    if (dayData) {
      setStartTime(dayData.startTime || '08:00');
      if (dayData.startLocation) {
        setStartLocationQuery(dayData.startLocation.name);
      } else {
        setStartLocationQuery('');
      }
      if (dayData.endLocation) {
        setEndLocationQuery(dayData.endLocation.name);
      } else {
        setEndLocationQuery('');
      }
    }
  }, [dayData, currentDay]);

  // Handle title change
  const handleTitleChange = (newTitle: string) => {
    setTieude(newTitle);
    updateItineraryTitle(newTitle);
  };

  // Handle start date change
  const handleStartDateChange = (newDate: string) => {
    setNgaybatdau(newDate);
    updateStartDate(new Date(newDate));
  };

  // Handle number of days change
  const handleNumberOfDaysChange = (newSoNgay: number) => {
    setSoNgay(newSoNgay);
    updateNumberOfDays(newSoNgay);
  };

  // Handle start location search
  const handleStartLocationSearch = (value: string) => {
    setStartLocationQuery(value);

    if (startLocationTimeoutRef.current) {
      clearTimeout(startLocationTimeoutRef.current);
    }

    if (value.length >= 2) {
      startLocationTimeoutRef.current = setTimeout(() => {
        searchStartLocation(value);
      }, 500);
    } else {
      setStartLocationResults([]);
      setStartLocationOpen(false);
    }
  };

  const searchStartLocation = async (keyword: string) => {
    try {
      setStartLocationLoading(true);
      // Use Goong Autocomplete API
      const data = await apiClient.get('/map/autocomplete', {
        params: {
          input: keyword,
          lat: 21.0285,
          lng: 105.8542,
        },
      });
      const results = Array.isArray(data) ? data : (data?.data || []);
      setStartLocationResults(results);
      setStartLocationOpen(true);
    } catch (error) {
      console.error('[TimelineEditorWithMap] Autocomplete search error:', error);
      setStartLocationResults([]);
    } finally {
      setStartLocationLoading(false);
    }
  };

  const geocodeAddress = async (address: string) => {
    try {
      if (!address || address.trim().length === 0) {
        console.warn('[TimelineEditorWithMap] Empty address for geocoding');
        return null;
      }

      const data: any = await apiClient.get('/map/geocode', {
        params: {
          address: address,
        },
      });

      const lat = data?.lat ?? data?.data?.lat;
      const lng = data?.lng ?? data?.data?.lng;

      if (lat && lng) {
        return {
          lat,
          lng,
          formatted_address: data?.formatted_address ?? data?.data?.formatted_address,
        };
      }
      
      console.warn('[TimelineEditorWithMap] No coordinates from geocode:', address);
      return null;
    } catch (error) {
      console.error('[TimelineEditorWithMap] Geocoding failed:', error);
      return null;
    }
  };

  const getCoordinatesFromAutocomplete = async (location: StartLocationSearchResult) => {
    if (location.place_id) {
      try {
        const data: any = await apiClient.get('/map/autocomplete-detail', {
          params: { place_id: location.place_id }
        });
        const loc = data?.result?.geometry?.location;
        if (loc?.lat && loc?.lng) {
          return { lat: loc.lat, lng: loc.lng };
        }
      } catch (error) {
        console.error('[TimelineEditorWithMap] Failed to get place details by place_id:', error);
      }
    }
    
    // Fallback to geocoding if place_id fails or is missing
    const addressText = location.main_text || location.description || location.diachi || location.ten || '';
    if (!addressText) return null;
    return geocodeAddress(addressText);
  };

  const handleSelectStartLocation = async (location: StartLocationSearchResult) => {
    // Get the address text to geocode
    const addressText = 
      location.main_text || 
      location.description || 
      location.diachi || 
      location.ten ||
      '';

    if (!addressText) {
      console.error('[TimelineEditorWithMap] No address text available for geocoding');
      return;
    }

    console.log('[TimelineEditorWithMap] Fetching coordinates for:', addressText);
    
    // Fetch exact coordinates
    const geocodeResult = await getCoordinatesFromAutocomplete(location);
    
    let finalLat = geocodeResult?.lat;
    let finalLng = geocodeResult?.lng;

    // If fetch fails, log a warning
    if (!finalLat || !finalLng) {
      console.warn('[TimelineEditorWithMap] Coordinate fetch failed, will use fallback coordinates');
    }

    // Save to context
    const startLocation: StartLocation = {
      name: location.main_text || location.ten || addressText,
      lat: finalLat || 21.0285,
      lng: finalLng || 105.8542,
    };

    console.log('[TimelineEditorWithMap] Selected location:', startLocation);

    updateDayConfig(currentDay, { startLocation });
    setStartLocationQuery(startLocation.name);
    setStartLocationOpen(false);
    setStartLocationResults([]);

    // Auto-calculate timeline
    handleAutoCalculate();
  };

  // Handle end location search
  const handleEndLocationSearch = (value: string) => {
    setEndLocationQuery(value);

    if (endLocationTimeoutRef.current) {
      clearTimeout(endLocationTimeoutRef.current);
    }

    if (value.length >= 2) {
      endLocationTimeoutRef.current = setTimeout(() => {
        searchEndLocation(value);
      }, 500);
    } else {
      setEndLocationResults([]);
      setEndLocationOpen(false);
    }
  };

  const searchEndLocation = async (keyword: string) => {
    try {
      setEndLocationLoading(true);
      const data = await apiClient.get('/map/autocomplete', {
        params: { input: keyword, lat: 21.0285, lng: 105.8542 },
      });
      const results = Array.isArray(data) ? data : (data?.data || []);
      setEndLocationResults(results);
      setEndLocationOpen(true);
    } catch (error) {
      console.error('[TimelineEditorWithMap] End location autocomplete search error:', error);
      setEndLocationResults([]);
    } finally {
      setEndLocationLoading(false);
    }
  };

  const handleSelectEndLocation = async (location: StartLocationSearchResult) => {
    const addressText = location.main_text || location.description || location.diachi || location.ten || '';
    if (!addressText) return;

    // Use robust place_id lookup instead of string geocoding
    const geocodeResult = await getCoordinatesFromAutocomplete(location);
    const endLocation: StartLocation = { 
      name: location.main_text || location.ten || addressText,
      lat: geocodeResult?.lat || 21.0285,
      lng: geocodeResult?.lng || 105.8542,
    };

    updateDayConfig(currentDay, { endLocation });
    setEndLocationQuery(endLocation.name);
    setEndLocationOpen(false);
    setEndLocationResults([]);

    handleAutoCalculate();
  };

  // Handle time update
  const handleUpdateStartTime = (newTime: string) => {
    setStartTime(newTime);
    updateDayConfig(currentDay, { startTime: newTime });
    handleAutoCalculate();
  };

  // Handle stay duration change
  const handleStayDurationChange = (instanceId: string, duration: number) => {
    updatePlaceStayDuration(currentDay, instanceId, duration);
    handleAutoCalculate();
  };

  // Auto-calculate timeline when dependencies change
  const handleAutoCalculate = useCallback(async () => {
    if (!dayData?.startLocation) {
      return;
    }
    
    // Require either places or an endLocation to calculate anything
    if ((!dayData.places || dayData.places.length === 0) && !dayData.endLocation) {
      return;
    }

    setIsCalculating(true);
    setCalculationError(null);

    try {
      const routesData = await calculateTimeline(currentDay, transportModes);
      setTravelRoutes(
        routesData.map((route) => ({
          startIndex: route.startIndex,
          endIndex: route.endIndex,
          allRoutes: route.routes,
          selectedRouteIndex: route.selectedRouteIndex,
        }))
      );

      // Auto fit map bounds
      fitMapBounds();
    } catch (error: any) {
      console.error('Calculation error:', error);
      setCalculationError(error?.message || 'Lỗi khi tính toán lịch trình');
    } finally {
      setIsCalculating(false);
    }
  }, [currentDay, dayData, calculateTimeline, transportModes]);

  // Fit bounds to include all markers
  const fitMapBounds = useCallback(() => {
    if (!mapRef.current || !dayData) return;

    const bounds = new MapLibreGL.LngLatBounds();

    // Add start location
    if (dayData.startLocation) {
      bounds.extend([dayData.startLocation.lng, dayData.startLocation.lat]);
    }

    // Add end location
    if (dayData.endLocation) {
      bounds.extend([dayData.endLocation.lng, dayData.endLocation.lat]);
    }

    // Add all places
    if (dayData.places && dayData.places.length > 0) {
      dayData.places.forEach((place) => {
        bounds.extend([place.lng, place.lat]);
      });
    }

    if (!bounds.isEmpty()) {
      mapRef.current?.fitBounds(bounds, {
        padding: 80,
        maxZoom: 14,
      });
    }
  }, [dayData]);

  // Handle route selection on map
  const handleSelectRoute = useCallback((routeIdx: number, altIdx: number) => {
    setTravelRoutes((prev) =>
      prev.map((route, idx) =>
        idx === routeIdx
          ? { ...route, selectedRouteIndex: altIdx }
          : route
      )
    );
  }, []);

  // Effect: Auto recalculate when places or locations or modes change
  useEffect(() => {
    const timer = setTimeout(() => {
      handleAutoCalculate();
    }, 500);

    return () => clearTimeout(timer);
  }, [
    dayData?.places, 
    dayData?.startLocation, 
    dayData?.endLocation, 
    transportModes, 
    dayData?.startTime, 
    handleAutoCalculate
  ]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        startLocationSearchRef.current &&
        !startLocationSearchRef.current.contains(event.target as Node)
      ) {
        setStartLocationOpen(false);
      }
      if (
        endLocationSearchRef.current &&
        !endLocationSearchRef.current.contains(event.target as Node)
      ) {
        setEndLocationOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (startLocationTimeoutRef.current) clearTimeout(startLocationTimeoutRef.current);
      if (endLocationTimeoutRef.current) clearTimeout(endLocationTimeoutRef.current);
    };
  }, []);

  if (!dayData) return null;

  const places = dayData.places || [];
  const hasPlaces = places.length > 0;

  // Create polyline layers for routes
  const polylineLayers = useMemo(() => {
    const layers = travelRoutes.flatMap((route, routeIdx) =>
      route.allRoutes.map((routeData, altIdx) => {
        const isSelected = altIdx === route.selectedRouteIndex;
        const polylineString = routeData.overviewPolyline;

        if (!polylineString) return null;

        return {
          id: `route-${routeIdx}-${altIdx}`,
          routeIdx,
          altIdx,
          polylineString,
          isSelected,
          distance: routeData.distance,
          duration: routeData.duration,
        };
      })
    );

    // Sort to make sure selected routes are drawn on top of unselected routes
    return layers.filter(Boolean).sort((a: any, b: any) => {
      if (a.isSelected === b.isSelected) return 0;
      return a.isSelected ? 1 : -1;
    });
  }, [travelRoutes]);

  // Calculate total distance and duration
  const totalDistance = useMemo(() => {
    return travelRoutes.reduce((sum, route) => {
      const distance = route.allRoutes?.[route.selectedRouteIndex]?.distance || 0;
      return sum + distance;
    }, 0);
  }, [travelRoutes]);

  const isSameStartAndEndLocation = useMemo(() => {
    if (!dayData?.startLocation || !dayData?.endLocation) return false;
    
    // Check coordinate distance (tighten tolerance to 0.0005 approx 50m)
    const isSameCoords = Math.abs(dayData.startLocation.lat - dayData.endLocation.lat) < 0.0005 &&
                         Math.abs(dayData.startLocation.lng - dayData.endLocation.lng) < 0.0005;
    
    // Check if name string is identical (only if they aren't generic defaults)
    const startName = dayData.startLocation.name?.trim().toLowerCase() || '';
    const endName = dayData.endLocation.name?.trim().toLowerCase() || '';
    const isGeneric = startName.includes('khách sạn') || endName.includes('khách sạn');
    
    const isSameName = !isGeneric && startName === endName && startName.length > 2;
    
    return isSameCoords || isSameName;
  }, [dayData?.startLocation, dayData?.endLocation]);

  const totalDuration = useMemo(() => {
    return travelRoutes.reduce((sum, route) => {
      const duration = route.allRoutes?.[route.selectedRouteIndex]?.duration || 0;
      return sum + duration;
    }, 0);
  }, [travelRoutes]);

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
      {/* Left Sidebar - Glassmorphism */}
      <div
        className={`flex flex-col bg-slate-50/80 backdrop-blur-md transition-all duration-300 ease-in-out overflow-hidden ${
          sidebarOpen ? 'w-112.5' : 'w-0'
        } border-r border-white/10 shadow-lg`}
      >
        {/* Sticky Header */}
        <div className="sticky top-0 z-20 bg-white/50 backdrop-blur-lg border-b border-white/10 p-4 space-y-3">
          {/* Trip Info */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tên chuyến đi</label>
              <input
                type="text"
                value={tieude}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Nhập tên chuyến đi của bạn..."
                className="w-full px-4 py-2.5 bg-white border-2 border-indigo-100 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-slate-900 text-sm font-bold shadow-sm transition-all hover:border-indigo-300"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1 uppercase tracking-wider">Ngày khởi hành</label>
                <input
                  type="date"
                  value={ngaybatdau}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-slate-900 text-xs shadow-sm transition-all hover:border-slate-300"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1 uppercase tracking-wider">Thời gian</label>
                <select
                  value={soNgay}
                  onChange={(e) => handleNumberOfDaysChange(parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-slate-900 text-xs shadow-sm transition-all hover:border-slate-300 cursor-pointer"
                >
                  {Array.from({ length: 7 }, (_, i) => i + 1).map((day) => (
                    <option key={day} value={day}>
                      {day} ngày
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Day Tabs - Floating Capsules */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {Array.from({ length: itinerary.so_ngay }, (_, i) => i + 1).map((day) => (
              <button
                key={day}
                onClick={() => {
                  setCurrentDay(day);
                }}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all backdrop-blur-sm ${ 
                  currentDay === day
                    ? 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-lg shadow-indigo-500/30'
                    : 'bg-white/30 border border-white/30 text-slate-700 hover:bg-white/50'
                }`}
              >
                Ngày {day}
              </button>
            ))}
          </div>
        </div>

        {/* Start Location and Time Config */}
        <div className="px-4 py-3 space-y-3 border-b border-white/10">
          <div>
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 mb-2">
              <Clock className="w-3 h-3 text-blue-500" />
              Giờ bắt đầu
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => handleUpdateStartTime(e.target.value)}
              className="w-full px-4 py-2 bg-white/40 border border-white/20 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 text-xs backdrop-blur-sm transition-all hover:bg-white/60"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div ref={startLocationSearchRef} className="relative">
              <label className="flex items-center gap-2 text-[11px] font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
                <MapPin className="w-3 h-3 text-red-500" />
                Điểm xuất phát
              </label>

              <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2.5 focus-within:ring-2 focus-within:ring-indigo-200 focus-within:border-indigo-500 transition-all hover:border-slate-300 shadow-sm">
                <Search className="w-3 h-3 text-slate-400" />
                <input
                  type="text"
                  value={startLocationQuery}
                  onChange={(e) => handleStartLocationSearch(e.target.value)}
                  onFocus={() => startLocationResults.length > 0 && setStartLocationOpen(true)}
                  placeholder="Từ: Khách sạn..."
                  className="flex-1 outline-none text-slate-900 text-xs bg-transparent placeholder-slate-400"
                />
                {startLocationLoading && <Loader className="w-3 h-3 text-indigo-500 animate-spin" />}
              </div>

              {startLocationOpen && startLocationResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white backdrop-blur-md border border-slate-200 rounded-xl shadow-xl z-50 max-h-40 overflow-y-auto">
                  {startLocationResults.map((location, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectStartLocation(location)}
                      className="w-full px-4 py-3 text-left hover:bg-slate-50 border-b border-slate-100 last:border-b-0 transition-colors"
                    >
                      <div className="font-semibold text-xs text-slate-900">
                        {location.main_text || location.ten || location.description}
                      </div>
                      <div className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                        {location.secondary_text || location.diachi}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div ref={endLocationSearchRef} className="relative">
              <label className="flex items-center gap-2 text-[11px] font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
                <MapPin className="w-3 h-3 text-blue-500" />
                Điểm kết thúc
              </label>

              <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2.5 focus-within:ring-2 focus-within:ring-indigo-200 focus-within:border-indigo-500 transition-all hover:border-slate-300 shadow-sm">
                <Search className="w-3 h-3 text-slate-400" />
                <input
                  type="text"
                  value={endLocationQuery}
                  onChange={(e) => handleEndLocationSearch(e.target.value)}
                  onFocus={() => endLocationResults.length > 0 && setEndLocationOpen(true)}
                  placeholder="Đến: Về lại khách sạn..."
                  className="flex-1 outline-none text-slate-900 text-xs bg-transparent placeholder-slate-400"
                />
                {endLocationLoading && <Loader className="w-3 h-3 text-indigo-500 animate-spin" />}
              </div>

              {endLocationOpen && endLocationResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white backdrop-blur-md border border-slate-200 rounded-xl shadow-xl z-50 max-h-40 overflow-y-auto">
                  {endLocationResults.map((location, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectEndLocation(location)}
                      className="w-full px-4 py-3 text-left hover:bg-slate-50 border-b border-slate-100 last:border-b-0 transition-colors"
                    >
                      <div className="font-semibold text-xs text-slate-900">
                        {location.main_text || location.ten || location.description}
                      </div>
                      <div className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                        {location.secondary_text || location.diachi}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {calculationError && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-700 text-xs backdrop-blur-sm">
              <AlertCircle className="w-3 h-3 shrink-0" />
              <span>{calculationError}</span>
            </div>
          )}
        </div>

        {/* Timeline Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4">
          {!hasPlaces ? (
            <button
              onClick={() => router.push('/local/places')}
              className="w-full py-8 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-indigo-50/50 to-blue-50/50 rounded-2xl border border-dashed border-indigo-300/50 hover:border-indigo-400 backdrop-blur-sm transition-all group"
            >
              <Plus className="w-6 h-6 text-indigo-600 group-hover:scale-110 transition-transform" />
              <p className="font-semibold text-indigo-700 text-sm">+ Thêm địa điểm để bắt đầu</p>
            </button>
          ) : (
            <div className="space-y-0">
              {/* Vertical Timeline */}
              <div className="relative">
                {/* Vertical Gradient Dashed Line Connector */}
                <div className="absolute left-5.5 top-9 bottom-0 w-0.5 border-l-[1.5px] border-dashed" style={{
                  backgroundImage: 'linear-gradient(180deg, #818cf8 0%, #60a5fa 100%)',
                  borderImage: 'linear-gradient(180deg, #818cf8 0%, #60a5fa 100%) 1'
                }}></div>

                {/* Start Location Node */}
                {dayData.startLocation && (
                  <div className="relative mb-0">
                    <div className="relative pl-16">
                      <div className="absolute -left-2 top-0 z-10 transform -translate-x-1">
                        <div className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 border-2 border-blue-400 shadow-lg">
                          <MapPin className="w-3 h-3 text-blue-600" />
                        </div>
                      </div>
                      <div className="text-xs font-semibold text-slate-700 bg-blue-50/80 backdrop-blur-sm shadow-sm py-2 px-4 rounded-xl inline-block border border-blue-100 mb-0">
                        Xuất phát: {dayData.startLocation.name || 'Điểm bắt đầu'}
                      </div>
                    </div>

                    {/* Travel Info Pill for Start -> Place 0 */}
                    {travelRoutes[0] && places.length > 0 && (
                      <div className="relative pl-16 py-3">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/80 backdrop-blur-sm border border-indigo-300/40 rounded-full shadow-sm">
                          <Car className="w-3.5 h-3.5 text-indigo-600" />
                          <span className="text-xs font-bold text-indigo-700">
                            {travelRoutes[0].allRoutes?.[travelRoutes[0].selectedRouteIndex]?.duration ? `${Math.round(travelRoutes[0].allRoutes[travelRoutes[0].selectedRouteIndex].duration / 60)} phút` : '—'}
                          </span>
                          <span className="text-xs text-slate-300">•</span>
                          <span className="text-xs font-medium text-slate-600 whitespace-nowrap">
                            {travelRoutes[0].allRoutes?.[travelRoutes[0].selectedRouteIndex]?.distance ? `${(travelRoutes[0].allRoutes[travelRoutes[0].selectedRouteIndex].distance / 1000).toFixed(1)} km` : '—'}
                          </span>
                          <div className="w-px h-3 bg-slate-300 mx-1"></div>
                          <select
                            value={transportModes[0] || 'car'}
                            onChange={(e) => setTransportModes(prev => ({ ...prev, [0]: e.target.value }))}
                            className="bg-transparent text-xs text-slate-700 font-medium outline-none cursor-pointer appearance-none hover:text-indigo-600 transition-colors"
                          >
                            <option value="car">🚗 Ô tô</option>
                            <option value="bike">🏍️ Xe máy</option>
                            <option value="taxi">🚕 Taxi</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Places Timeline Items */}
                {places.map((place, idx) => {
                  const isEditing = editingInstanceId === place.instanceId;
                  const nextTravelRoute = travelRoutes[idx + 1];
                  const travelDistance = nextTravelRoute?.allRoutes?.[nextTravelRoute.selectedRouteIndex]?.distance;
                  const travelDuration = nextTravelRoute?.allRoutes?.[nextTravelRoute.selectedRouteIndex]?.duration;

                  const isDragged = draggedIdx === idx;
                  const isDragOver = dragOverIdx === idx;

                  return (
                    <div 
                      key={place.instanceId} 
                      className={`relative transition-all duration-200 ${isDragged ? 'opacity-50 scale-[0.98]' : ''} ${
                        isDragOver && draggedIdx !== null
                          ? draggedIdx < idx
                            ? 'border-b-4 border-dashed border-indigo-400 pb-2 mb-2' 
                            : 'border-t-4 border-dashed border-indigo-400 pt-2 mt-2'
                          : ''
                      }`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, idx)}
                      onDragEnter={(e) => handleDragEnter(e, idx)}
                      onDragOver={(e) => e.preventDefault()}
                      onDragEnd={handleDragEnd}
                    >
                      {/* Timeline Item with Place Card */}
                      <div className="relative pl-16">
                        {/* Arrival Icon Dot - Soft UI Style */}
                        <div className="absolute -left-2 top-3 z-10 transform -translate-x-1">
                          <div className={`flex items-center justify-center w-7 h-7 rounded-full bg-white border-2 shadow-lg transition-all ${
                            isEditing 
                              ? 'border-indigo-400 shadow-indigo-400/50' 
                              : 'border-indigo-300 shadow-slate-400/30'
                          }`}>
                            {getArrivalTimeIcon(place.arrivalTime)}
                          </div>
                        </div>

                        {/* Premium Floating Place Card */}
                        <div
                          onClick={() => setEditingInstanceId(place.instanceId)}
                          className={`relative mb-3 px-4 pb-4 pt-8 rounded-3xl transition-all cursor-pointer ${
                            isEditing
                              ? 'bg-white shadow-xl shadow-indigo-500/20 border-indigo-500 -translate-y-0.5 ring-2 ring-indigo-200/60'
                              : 'bg-white/80 backdrop-blur-sm shadow-sm border border-white/30 hover:shadow-md hover:bg-white/90'
                          }`}
                        >
                          {/* Top-Left Corner Badge for Arrival Time */}
                          {place.arrivalTime && (
                            <div className="absolute top-0 left-0 bg-gradient-to-br from-indigo-600 to-indigo-500 text-white px-3 py-1 text-[10px] sm:text-xs font-bold rounded-tl-3xl rounded-br-2xl shadow-sm flex items-center gap-1.5 z-10 border-b border-r border-indigo-700/30">
                              <Clock className="w-3 h-3" />
                               {place.arrivalTime}
                            </div>
                          )}

                          {/* Header: Location Number & Title */}
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-semibold text-indigo-600 mb-1">
                                #{idx + 1} • {place.ten}
                              </div>
                              <p className="text-xs text-slate-600 line-clamp-2 font-medium">{place.diachi}</p>
                            </div>
                            <div className="text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing transition-colors p-1 -mr-2">
                              <GripVertical className="w-5 h-5" />
                            </div>
                          </div>




                        </div>
                      </div>

                      {/* Travel Info Pill (Between Cards) */}
                      {idx < places.length - 1 && nextTravelRoute && (
                        <div className="relative pl-16 py-3">
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/80 backdrop-blur-sm border border-indigo-300/40 rounded-full shadow-sm hover:shadow-md transition-all">
                            <Car className="w-3.5 h-3.5 text-indigo-600" />
                            <span className="text-xs font-bold text-indigo-700">
                              {travelDuration ? `${Math.round(travelDuration / 60)} phút` : '—'}
                            </span>
                            <span className="text-xs text-slate-300">•</span>
                            <span className="text-xs font-medium text-slate-600 whitespace-nowrap">
                              {travelDistance ? `${(travelDistance / 1000).toFixed(1)} km` : '—'}
                            </span>
                            <div className="w-px h-3 bg-slate-300 mx-1"></div>
                            <select
                              value={transportModes[idx + 1] || 'car'}
                              onChange={(e) => setTransportModes(prev => ({ ...prev, [idx + 1]: e.target.value }))}
                              className="bg-transparent text-xs text-slate-700 font-medium outline-none cursor-pointer appearance-none hover:text-indigo-600 transition-colors"
                            >
                              <option value="car">🚗 Ô tô</option>
                              <option value="bike">🏍️ Xe máy</option>
                              <option value="taxi">🚕 Taxi</option>
                            </select>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Final Travel Info Pill (From Last Place to End Location) */}
                {dayData.endLocation && travelRoutes[places.length] && (
                  <div className="relative pl-16 py-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/80 backdrop-blur-sm border border-indigo-300/40 rounded-full shadow-sm hover:shadow-md transition-all">
                      <Car className="w-3.5 h-3.5 text-indigo-600" />
                      <span className="text-xs font-bold text-indigo-700">
                        {travelRoutes[places.length].allRoutes?.[travelRoutes[places.length].selectedRouteIndex]?.duration ? `${Math.round(travelRoutes[places.length].allRoutes[travelRoutes[places.length].selectedRouteIndex].duration / 60)} phút` : '—'}
                      </span>
                      <span className="text-xs text-slate-300">•</span>
                      <span className="text-xs font-medium text-slate-600 whitespace-nowrap">
                        {travelRoutes[places.length].allRoutes?.[travelRoutes[places.length].selectedRouteIndex]?.distance ? `${(travelRoutes[places.length].allRoutes[travelRoutes[places.length].selectedRouteIndex].distance / 1000).toFixed(1)} km` : '—'}
                      </span>
                      <div className="w-px h-3 bg-slate-300 mx-1"></div>
                      <select
                        value={transportModes[places.length] || 'car'}
                        onChange={(e) => setTransportModes(prev => ({ ...prev, [places.length]: e.target.value }))}
                        className="bg-transparent text-xs text-slate-700 font-medium outline-none cursor-pointer appearance-none hover:text-indigo-600 transition-colors"
                      >
                        <option value="car">🚗 Ô tô</option>
                        <option value="bike">🏍️ Xe máy</option>
                        <option value="taxi">🚕 Taxi</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* End Trip Node */}
                {(places.length > 0 || dayData.endLocation) && (
                  <div className="relative mt-2">
                    <div className="relative pl-16">
                      <div className="absolute -left-2 top-0 z-10 transform -translate-x-1">
                        <div className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 border-2 border-blue-400 shadow-sm">
                          <MapPin className="w-3 h-3 text-blue-500" />
                        </div>
                      </div>
                      <div className="text-xs font-semibold text-slate-600 bg-white/80 backdrop-blur-sm shadow-sm py-2 px-4 rounded-xl inline-block border border-slate-200">
                        {dayData.endLocation ? (
                          <>🏁 Về đích: <span className="font-bold text-indigo-600 block sm:inline mt-1 sm:mt-0">{dayData.endLocation.name}</span></>
                        ) : (
                          <>🏁 Kết thúc ngắm cảnh lúc: <span className="font-bold text-slate-800">{places[places.length - 1]?.departureTime || '---'}</span></>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Add More Places Button */}
              <button
                onClick={() => router.push('/local/places')}
                className="w-full mt-6 py-3 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-100/50 to-blue-100/50 hover:from-indigo-100 hover:to-blue-100 rounded-2xl border border-indigo-200/50 backdrop-blur-sm transition-all text-indigo-700 text-sm font-semibold"
              >
                <Plus className="w-4 h-4" />
                Thêm địa điểm
              </button>
            </div>
          )}
        </div>

        {/* Delete Dropzone - Shows only when dragging */}
        {draggedIdx !== null && (
          <div 
            className={`transition-all duration-300 border-t z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] ${
              isDragOverDelete 
                ? 'bg-red-50/90 backdrop-blur-md border-red-500 py-8' 
                : 'bg-white/90 backdrop-blur-md border-slate-200 py-6'
            } px-4 flex flex-col items-center justify-center gap-3 shrink-0`}
            onDragOver={handleDeleteDragOver}
            onDragLeave={handleDeleteDragLeave}
            onDrop={handleDeleteDrop}
          >
            <Trash2 
              className={`w-10 h-10 ${
                isDragOverDelete ? 'text-red-500 scale-110 drop-shadow-md' : 'text-slate-400'
              } transition-all duration-300`} 
            />
            <span className={`text-sm md:text-base font-bold ${
              isDragOverDelete ? 'text-red-600' : 'text-slate-500'
            }`}>
              Kéo thả vào đây để xóa địa điểm
            </span>
          </div>
        )}
      </div>

      {/* Main Content - Map */}
      <div className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0 w-full h-full">
          <Map
            ref={mapRef}
            initialViewState={viewState}
            onMove={(evt) => setViewState(evt.viewState)}
            mapLib={MapLibreGL}
            mapStyle={`https://tiles.goong.io/assets/goong_map_web.json?api_key=${GOONG_MAP_KEY}`}
            style={{ width: '100%', height: '100%' }}
            attributionControl={false}
            interactiveLayerIds={polylineLayers.map((l: any) => l?.id).filter(Boolean)}
            onClick={(e) => {
              const feature = e.features?.[0];
              if (feature && feature.layer.id.startsWith('route-')) {
                const parts = feature.layer.id.split('-');
                const routeIdx = parseInt(parts[1], 10);
                const altIdx = parseInt(parts[2], 10);
                handleSelectRoute(routeIdx, altIdx);
              }
            }}
            cursor={viewState.zoom ? "pointer" : "grab"} // Basic cursor hint
          >
            {/* Start location marker */}
            {dayData.startLocation && (
              <Marker
                longitude={dayData.startLocation.lng}
                latitude={dayData.startLocation.lat}
                anchor="bottom"
              >
                <div className="bg-gradient-to-br from-blue-600 to-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg shadow-blue-500/50">
                  {isSameStartAndEndLocation ? 'S/E' : 'S'}
                </div>
              </Marker>
            )}

            {/* End location marker */}
            {dayData.endLocation && !isSameStartAndEndLocation && (
              <Marker
                longitude={dayData.endLocation.lng}
                latitude={dayData.endLocation.lat}
                anchor="bottom"
              >
                <div className="bg-gradient-to-br from-blue-600 to-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg shadow-blue-500/50">
                  E
                </div>
              </Marker>
            )}

            {/* Place markers */}
            {places.map((place, idx) => (
              <Marker key={idx} longitude={place.lng} latitude={place.lat} anchor="bottom">
                <div className="bg-gradient-to-br from-indigo-600 to-indigo-500 text-white w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-lg shadow-indigo-500/50 hover:scale-110 transition-transform cursor-pointer">
                  {idx + 1}
                </div>
              </Marker>
            ))}

            {/* Polyline layers for routes */}
            {polylineLayers.map((item) => {
              if (!item) return null;

              return (
                <Source
                  key={`source-${item.id}`}
                  id={`source-${item.id}`}
                  type="geojson"
                  data={{
                    type: 'Feature',
                    geometry: {
                      type: 'LineString',
                      coordinates: decodePolyline(item.polylineString),
                    },
                    properties: {},
                  }}
                >
                  <Layer
                    id={item.id}
                    type="line"
                    paint={{
                      'line-color': item.isSelected ? '#4f46e5' : '#818cf8',
                      'line-width': item.isSelected ? 6 : 4,
                      'line-opacity': item.isSelected ? 1 : 0.45,
                    }}
                  />
                  {item.isSelected && (
                    <Layer
                      id={`arrow-${item.id}`}
                      type="symbol"
                      layout={{
                        'symbol-placement': 'line',
                        'symbol-spacing': 80,
                        'text-field': '▶',
                        'text-size': 12,
                        'text-keep-upright': false,
                      }}
                      paint={{
                        'text-color': '#ffffff',
                        'text-halo-color': '#4f46e5',
                        'text-halo-width': 1.5,
                      }}
                    />
                  )}
                </Source>
              );
            })}
          </Map>
        </div>

        {/* Floating Sidebar Toggle Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute top-4 left-4 z-30 bg-white/90 hover:bg-white text-slate-700 p-3 rounded-xl shadow-xl backdrop-blur-md border border-white/20 transition-all hover:shadow-2xl hover:scale-105"
          title={sidebarOpen ? 'Ẩn sidebar' : 'Hiện sidebar'}
        >
          {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Map Loading Indicator */}
        {isCalculating && (
          <div className="absolute top-4 right-4 bg-white/90 px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 text-sm z-20 backdrop-blur-md border border-white/20">
            <Loader className="w-4 h-4 animate-spin text-indigo-500" />
            <span className="text-slate-700 font-medium">Đang tính toán...</span>
          </div>
        )}

        {/* Trip Summary Widget - Bottom Center */}
        {(hasPlaces || travelRoutes.length > 0) && (
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20">
            <div className="bg-white/95 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl px-6 py-3.5 flex items-center gap-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center text-white">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-600 font-medium">Địa điểm</p>
                  <p className="text-sm font-bold text-slate-900">{places.length}</p>
                </div>
              </div>

              <div className="h-8 w-px bg-gradient-to-b from-transparent via-slate-300 to-transparent"></div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white">
                  <Car className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-600 font-medium">Quãng đường</p>
                  <p className="text-sm font-bold text-slate-900">
                    {totalDistance ? `${(totalDistance / 1000).toFixed(1)} km` : '—'}
                  </p>
                </div>
              </div>

              <div className="h-8 w-px bg-gradient-to-b from-transparent via-slate-300 to-transparent"></div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-600 font-medium">Thời gian</p>
                  <p className="text-sm font-bold text-slate-900">
                    {totalDuration ? `${Math.round(totalDuration / 3600)}h ${Math.round((totalDuration % 3600) / 60)}m` : '—'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Get arrival time icon based on time of day
 */
function getArrivalTimeIcon(arrivalTime: string | undefined) {
  if (!arrivalTime) {
    return <MapPin className="w-3 h-3 text-indigo-600" />;
  }

  try {
    const hour = parseInt(arrivalTime.split(':')[0], 10);

    if (hour < 12) {
      // Morning: Sunrise
      return <Sunrise className="w-3 h-3 text-amber-500" />;
    } else if (hour < 18) {
      // Afternoon/Evening: Sun
      return <Sun className="w-3 h-3 text-yellow-500" />;
    } else {
      // Night: Moon
      return <Moon className="w-3 h-3 text-indigo-500" />;
    }
  } catch {
    return <MapPin className="w-3 h-3 text-indigo-600" />;
  }
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
