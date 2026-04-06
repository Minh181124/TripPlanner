'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  Search,
  MapPin,
  Loader,
  ChevronLeft,
  AlertCircle,
  ImageOff,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useItinerary } from '@/features/itinerary';
import type { PlaceItem } from '@/features/itinerary';
import { PlaceDetailModal } from '@/components/PlaceDetailModal';
import apiClient from '@/shared/api/apiClient';

interface PlaceSearchResult {
  diadiem_id: number;
  place_id?: string;
  google_place_id?: string;
  ten: string;
  diachi: string;
  quan_huyen?: string;
  lat: number;
  lng: number;
  loai: string;
  is_internal?: boolean;
  chitiet_diadiem?: any[];
  hoatdong_diadiem?: any[];
  hinhanh_diadiem?: { url: string }[];
  danhgia?: number;
  giatien?: number;
}

const PLACE_TYPES = [
  { value: 'all', label: '🌍 Tất cả', icon: 'all' },
  { value: 'restaurant', label: '🍽️ Nhà hàng', icon: 'restaurant' },
  { value: 'cafe', label: '☕ Cà phê', icon: 'cafe' },
  { value: 'lodging', label: '🏨 Khách sạn', icon: 'hotel' },
  { value: 'tourist_attraction', label: '🎯 Tham quan', icon: 'attraction' },
  { value: 'store', label: '🛍️ Mua sắm', icon: 'shopping' },
];

const PLACEHOLDER_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23f3f4f6" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" font-size="16" fill="%239ca3af" text-anchor="middle" dominant-baseline="middle" font-family="system-ui"%3ENo Image%3C/text%3E%3C/svg%3E';

export function PlaceSelector() {
  const router = useRouter();
  const { itinerary, addPlaceToDay } = useItinerary();
  const [query, setQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [places, setPlaces] = useState<PlaceSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<PlaceSearchResult | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const currentLat = itinerary.days[itinerary.currentDay - 1]?.places[0]?.lat || 21.0285;
  const currentLng = itinerary.days[itinerary.currentDay - 1]?.places[0]?.lng || 105.8542;

  const performSearch = useCallback(async (searchQuery: string, typeFilter: string) => {
    try {
      setLoading(true);
      setError(null);

      let keyword = searchQuery.trim();
      
      const params: any = { keyword, lat: currentLat, lng: currentLng };
      if (typeFilter !== 'all') {
        params.loai = typeFilter;
      }

      const data = await apiClient.get('/map/search', { params });

      const results = Array.isArray(data) ? data : (data?.data || []);
      setPlaces(results);
    } catch (err: any) {
      console.error('Search error:', err);
      setError(err?.response?.data?.message || 'Lỗi khi tìm kiếm địa điểm');
      setPlaces([]);
    } finally {
      setLoading(false);
    }
  }, [currentLat, currentLng]);

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (value.length >= 1 || selectedType !== 'all') {
      const timeout = setTimeout(() => performSearch(value, selectedType), 500);
      searchTimeoutRef.current = timeout;
    } else {
      setPlaces([]);
    }
  };

  const handleTypeChange = (type: string) => {
    setSelectedType(type);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    const timeout = setTimeout(() => performSearch(query, type), 300);
    searchTimeoutRef.current = timeout;
  };

  useEffect(() => {
    // Initial fetch of default places
    performSearch('', 'all');
  }, [performSearch]);

  const handleSelectPlace = (place: PlaceSearchResult) => {
    setSelectedPlace(place);
    setIsModalOpen(true);
  };

  const handleConfirmPlace = async (newPlace: PlaceItem, notes: string) => {
    try {
      const instanceId = crypto.randomUUID();
      const placeWithInstanceId: PlaceItem = { ...newPlace, instanceId, ghichu: notes || '' };

      addPlaceToDay(itinerary.currentDay, placeWithInstanceId);
      setIsModalOpen(false);
      setSelectedPlace(null);
      alert(`✓ Đã thêm ${newPlace.ten} vào ngày ${itinerary.currentDay}`);

      setTimeout(() => router.push('/planner'), 500);
    } catch (err) {
      console.error('Error adding place:', err);
      setError('Lỗi khi thêm địa điểm');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 md:px-8">
          <div className="flex items-center gap-3 mb-4">
            <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 rounded-lg transition-colors" title="Quay lại">
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Khám phá địa điểm</h1>
              <p className="text-sm text-slate-500">Ngày {itinerary.currentDay} - {itinerary.tieude}</p>
            </div>
          </div>

          <div className="relative">
            <div className="flex items-center gap-2 bg-white border-2 border-slate-200 rounded-lg px-4 py-2.5 focus-within:border-indigo-400 focus-within:shadow-md transition-all">
              <Search className="w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm kiếm nhà hàng, khách sạn, tham quan..."
                value={query}
                onChange={handleQueryChange}
                disabled={loading}
                className="flex-1 outline-none bg-transparent text-slate-900 placeholder-slate-400"
              />
              {loading && <Loader className="w-5 h-5 text-indigo-500 animate-spin" />}
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 md:px-8 pb-4 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 min-w-max">
            {PLACE_TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() => handleTypeChange(type.value)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                  selectedType === type.value
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
                disabled={loading}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
        {error && (
          <div className="mb-6 flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="text-sm">{error}</span>
            <button onClick={() => setError(null)} className="ml-auto text-red-600 hover:text-red-800">✕</button>
          </div>
        )}

        {loading && places.length === 0 && (
          <div className="text-center py-12">
            <Loader className="w-10 h-10 text-indigo-500 animate-spin mx-auto mb-3" />
            <p className="text-slate-600">Đang tìm kiếm...</p>
          </div>
        )}

        {!loading && places.length === 0 && query.length === 0 && selectedType === 'all' && (
          <div className="text-center py-16">
            <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 font-medium mb-2">Chưa có kết quả</p>
            <p className="text-slate-500 text-sm">Bắt đầu bằng cách gõ từ khóa hoặc chọn loại địa điểm</p>
          </div>
        )}

        {!loading && places.length === 0 && (query.length > 0 || selectedType !== 'all') && (
          <div className="text-center py-16">
            <AlertCircle className="w-12 h-12 text-amber-300 mx-auto mb-4" />
            <p className="text-slate-600 font-medium mb-2">Không tìm thấy kết quả</p>
            <p className="text-slate-500 text-sm">Hãy thử tìm kiếm với từ khóa khác</p>
          </div>
        )}

        {places.length > 0 && (
          <>
            <div className="mb-4">
              <p className="text-sm text-slate-600">
                Tìm thấy <span className="font-bold text-slate-900">{places.length}</span> địa điểm
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {places.map((place) => (
                <div
                  key={`${place.diadiem_id}-${place.ten}`}
                  onClick={() => handleSelectPlace(place)}
                  className="group cursor-pointer bg-white rounded-lg overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 flex flex-col"
                >
                  <div className="relative w-full h-40 bg-slate-100 overflow-hidden">
                    {place.hinhanh_diadiem?.[0]?.url ? (
                      <img
                        src={place.hinhanh_diadiem?.[0]?.url}
                        alt={place.ten}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE; }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                        <ImageOff className="w-8 h-8 text-slate-400" />
                      </div>
                    )}
                  </div>

                  <div className="p-3 flex-1 flex flex-col">
                    <h3 className="font-bold text-slate-900 line-clamp-2 mb-1 group-hover:text-indigo-600 transition-colors">
                      {place.ten}
                    </h3>
                    <div className="flex items-start gap-1.5 mb-3 flex-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <p className="text-xs text-slate-500 line-clamp-1">{place.diachi || place.quan_huyen || 'Không xác định'}</p>
                    </div>
                    <div className="mb-3 flex items-center gap-2">
                      <span className="inline-block px-2 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-full">
                        {PLACE_TYPES.find(t => t.value === place.loai)?.label.replace(/🌍 |🍽️ |☕ |🏨 |🎯 |🛍️ |🎮 /g, '') || place.loai || 'Địa điểm'}
                      </span>
                      {place.danhgia && (
                        <span className="text-xs font-medium text-amber-500 bg-amber-50 px-2 py-1 rounded-full flex items-center gap-1">
                          ⭐ {place.danhgia}
                        </span>
                      )}
                      {place.giatien ? (
                        <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(place.giatien)}
                        </span>
                      ) : null}
                    </div>

                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {selectedPlace && (
        <PlaceDetailModal
          isOpen={isModalOpen}
          place={selectedPlace}
          onClose={() => { setIsModalOpen(false); setSelectedPlace(null); }}
          onConfirm={handleConfirmPlace}
          currentDayPlaces={itinerary.days[itinerary.currentDay - 1]?.places || []}
        />
      )}
    </div>
  );
}
