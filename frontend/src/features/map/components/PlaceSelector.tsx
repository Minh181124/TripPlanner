'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  Search,
  MapPin,
  Loader,
  ChevronLeft,
  AlertCircle,
  ImageOff,
  Filter,
  CheckCircle,
  X as CloseIcon,
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
  { value: 'restaurant', label: '🍽️ Nhà hàng', vn: 'Ẩm thực' },
  { value: 'cafe', label: '☕ Cà phê', vn: 'Cà phê' },
  { value: 'lodging', label: '🏨 Khách sạn', vn: 'Lưu trú' },
  { value: 'tourist_attraction', label: '🎯 Tham quan', vn: 'Tham quan' },
  { value: 'museum', label: '🏛️ Bảo tàng', vn: 'Bảo tàng' },
  { value: 'park', label: '🌳 Công viên', vn: 'Công viên' },
  { value: 'night_club', label: '💃 Giải trí', vn: 'Giải trí' },
  { value: 'shopping_mall', label: '🛍️ Mua sắm', vn: 'Mua sắm' },
  { value: 'store', label: '🛒 Cửa hàng', vn: 'Cửa hàng' },
  { value: 'art_gallery', label: '🎨 Nghệ thuật', vn: 'Nghệ thuật' },
];

const DISTRICTS = [
  'Quận 1', 'Quận 3', 'Quận 4', 'Quận 5', 'Quận 6', 'Quận 7', 'Quận 8', 'Quận 10', 'Quận 11', 'Quận 12',
  'Quận Bình Thạnh', 'Quận Gò Vấp', 'Quận Phú Nhuận', 'Quận Tân Bình', 'Quận Tân Phú', 'Thành phố Thủ Đức',
  'Huyện Bình Chánh', 'Huyện Cần Giờ', 'Huyện Củ Chi', 'Huyện Hóc Môn', 'Huyện Nhà Bè'
];

const PRICE_RANGES = [
  { label: 'Miễn phí', min: 0, max: 0 },
  { label: 'Dưới 100k', min: 0, max: 100000 },
  { label: '100k - 500k', min: 100000, max: 500000 },
  { label: '500k - 1M', min: 500000, max: 1000000 },
  { label: 'Trên 1M', min: 1000000, max: 100000000 },
];

const PLACEHOLDER_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23f3f4f6" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" font-size="16" fill="%239ca3af" text-anchor="middle" dominant-baseline="middle" font-family="system-ui"%3ENo Image%3C/text%3E%3C/svg%3E';

export function PlaceSelector() {
  const router = useRouter();
  const { itinerary, addPlaceToDay } = useItinerary();
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({
    loai: [] as string[],
    quan_huyen: [] as string[],
    price: null as { min: number, max: number } | null,
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  
  // Close filter dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const [places, setPlaces] = useState<PlaceSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<PlaceSearchResult | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const currentLat = itinerary.days[itinerary.currentDay - 1]?.places[0]?.lat || 21.0285;
  const currentLng = itinerary.days[itinerary.currentDay - 1]?.places[0]?.lng || 105.8542;

  const performSearch = useCallback(async (searchQuery: string, currentFilters: typeof filters) => {
    try {
      setLoading(true);
      setError(null);

      const params: any = { 
        keyword: searchQuery.trim(), 
        lat: currentLat, 
        lng: currentLng 
      };

      if (currentFilters.loai.length > 0) {
        params.loai = currentFilters.loai.join(',');
      }
      if (currentFilters.quan_huyen.length > 0) {
        params.quan_huyen = currentFilters.quan_huyen.join(',');
      }
      if (currentFilters.price) {
        params.gia_min = currentFilters.price.min;
        params.gia_max = currentFilters.price.max;
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
    const timeout = setTimeout(() => performSearch(value, filters), 500);
    searchTimeoutRef.current = timeout;
  };

  const updateFilters = (newFilters: typeof filters) => {
    setFilters(newFilters);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    const timeout = setTimeout(() => performSearch(query, newFilters), 300);
    searchTimeoutRef.current = timeout;
  };

  const toggleArrayFilter = (key: 'loai' | 'quan_huyen', value: string) => {
    const current = [...filters[key]];
    const index = current.indexOf(value);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(value);
    }
    updateFilters({ ...filters, [key]: current });
  };

  useEffect(() => {
    performSearch('', filters);
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

      // Signal back that we came from the selector to avoid resetting the itinerary
      sessionStorage.setItem('fromPlaceSelector', 'true');
      setTimeout(() => router.back(), 500);
    } catch (err) {
      console.error('Error adding place:', err);
      setError('Lỗi khi thêm địa điểm');
    }
  };

  const getTranslatedType = (loai: string) => {
    const type = PLACE_TYPES.find(t => t.value === loai);
    if (type) return type.vn;
    
    // Manual fallback for common google types
    const mapping: Record<string, string> = {
      'point_of_interest': 'Địa điểm',
      'establishment': 'Cơ sở',
      'food': 'Ẩm thực',
      'shopping_mall': 'Mua sắm',
      'department_store': 'Trung tâm TM',
      'supermarket': 'Siêu thị',
      'grocery_or_supermarket': 'Siêu thị',
      'store': 'Cửa hàng',
      'clothing_store': 'Cửa hàng quần áo',
      'home_goods_store': 'Đồ gia dụng',
      'parking': 'Gửi xe',
      'amusement_park': 'Khu vui chơi',
      'tourist_attraction': 'Tham quan',
      'place_of_worship': 'Tín ngưỡng',
      'church': 'Nhà thờ',
      'pagoda': 'Chùa',
      'natural_feature': 'Cảnh quan',
    };
    
    const translated = mapping[loai];
    if (translated) return translated;

    // Last resort: Clean up the string (e.g., "point_of_interest" -> "Point Of Interest")
    return loai.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-8 md:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => router.back()} 
                className="p-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-2xl transition-all shadow-sm active:scale-95" 
                title="Quay lại"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Tìm kiếm</h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="flex h-2 w-2 rounded-full bg-indigo-500"></span>
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{itinerary.tieude} • Ngày {itinerary.currentDay}</p>
                </div>
              </div>
            </div>

            <div className="relative flex-1 max-w-2xl flex items-center gap-3">
              <div className="flex-1 flex items-center gap-3 bg-white border-2 border-slate-100 rounded-[1.5rem] px-5 py-4 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all shadow-sm group">
                <Search className="w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Hôm nay bạn muốn đi đâu?"
                  value={query}
                  onChange={handleQueryChange}
                  disabled={loading}
                  className="flex-1 outline-none bg-transparent text-slate-900 placeholder-slate-400 font-bold"
                />
                {query && !loading && (
                  <button 
                    onClick={() => {
                      setQuery('');
                      performSearch('', filters);
                    }}
                    className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <CloseIcon className="w-4 h-4" />
                  </button>
                )}
                {loading && <Loader className="w-5 h-5 text-indigo-500 animate-spin" />}
              </div>

              {/* Enhanced Filter Button (Funnel) */}
              <div className="relative" ref={filterRef}>
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className={`flex items-center gap-2 px-6 py-4 rounded-[1.5rem] font-bold text-sm transition-all shadow-sm active:scale-95 border-2 ${
                    isFilterOpen || (filters.loai.length > 0 || filters.quan_huyen.length > 0 || filters.price)
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200' 
                    : 'bg-white border-slate-100 text-slate-700 hover:border-slate-200'
                  }`}
                >
                  <Filter className={`w-4 h-4 ${isFilterOpen ? 'animate-pulse' : ''}`} />
                  <span>Bộ lọc</span>
                  {(filters.loai.length > 0 || filters.quan_huyen.length > 0 || filters.price) && (
                    <span className="flex items-center justify-center min-w-[20px] h-5 px-1 bg-white text-indigo-600 text-[10px] font-black rounded-full ml-1">
                      {filters.loai.length + filters.quan_huyen.length + (filters.price ? 1 : 0)}
                    </span>
                  )}
                </button>

                {/* Filter Popover */}
                {isFilterOpen && (
                  <div className="absolute top-full right-0 mt-3 w-[450px] bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 z-50 overflow-hidden transform animate-in fade-in zoom-in duration-200">
                    <div className="p-5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Bộ lọc nâng cao</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">Tìm kiếm chính xác hơn cho chuyến đi của bạn</p>
                      </div>
                      <button onClick={() => setIsFilterOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                        <CloseIcon className="w-5 h-5 text-slate-400" />
                      </button>
                    </div>

                    <div className="p-6 space-y-8 max-h-[500px] overflow-y-auto custom-scrollbar">
                      {/* Categories section */}
                      <FilterSection title="Hạng mục">
                        <div className="grid grid-cols-2 gap-2">
                          {PLACE_TYPES.map((type) => (
                            <button
                              key={type.value}
                              onClick={() => toggleArrayFilter('loai', type.value)}
                              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all border ${
                                filters.loai.includes(type.value)
                                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
                                  : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-200'
                              }`}
                            >
                              <span className="text-sm font-bold truncate">{type.label}</span>
                            </button>
                          ))}
                        </div>
                      </FilterSection>

                      {/* District section */}
                      <FilterSection title="Theo địa phương (Quận / Huyện)">
                        <div className="flex flex-wrap gap-2">
                          {DISTRICTS.map((district) => (
                            <button
                              key={district}
                              onClick={() => toggleArrayFilter('quan_huyen', district)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                                filters.quan_huyen.includes(district)
                                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
                                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-indigo-200'
                              }`}
                            >
                              {district}
                            </button>
                          ))}
                        </div>
                      </FilterSection>

                      {/* Price Range section */}
                      <FilterSection title="Khoảng giá dự kiến">
                        <div className="flex flex-wrap gap-2">
                          {PRICE_RANGES.map((range) => (
                            <button
                              key={range.label}
                              onClick={() => updateFilters({ 
                                ...filters, 
                                price: filters.price?.min === range.min && filters.price?.max === range.max ? null : range 
                              })}
                              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                                filters.price?.min === range.min && filters.price?.max === range.max
                                  ? 'bg-green-600 border-green-600 text-white shadow-md'
                                  : 'bg-white border-slate-200 text-slate-600 hover:border-green-200'
                              }`}
                            >
                              {range.label}
                            </button>
                          ))}
                        </div>
                      </FilterSection>
                    </div>

                    <div className="p-4 bg-slate-50 border-t border-slate-200 flex gap-3">
                      <button 
                        onClick={() => {
                          const reset = { loai: [], quan_huyen: [], price: null };
                          setFilters(reset);
                          performSearch(query, reset);
                          setIsFilterOpen(false);
                        }}
                        className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 text-xs font-black rounded-2xl hover:bg-slate-100 transition-all"
                      >
                        Xóa tất cả bộ lọc
                      </button>
                      <button 
                        onClick={() => setIsFilterOpen(false)}
                        className="flex-1 py-3 bg-indigo-600 text-white text-xs font-black rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all"
                      >
                        Áp dụng ngay
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
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

        {!loading && places.length === 0 && query.length === 0 && filters.loai.length === 0 && filters.quan_huyen.length === 0 && !filters.price && (
          <div className="text-center py-16">
            <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 font-medium mb-2">Chưa có kết quả</p>
            <p className="text-slate-500 text-sm">Bắt đầu bằng cách gõ từ khóa hoặc chọn bộ lọc</p>
          </div>
        )}

        {!loading && places.length === 0 && (query.length > 0 || filters.loai.length > 0 || filters.quan_huyen.length > 0 || filters.price) && (
          <div className="text-center py-16">
            <AlertCircle className="w-12 h-12 text-amber-300 mx-auto mb-4" />
            <p className="text-slate-600 font-medium mb-2">Không tìm thấy kết quả</p>
            <p className="text-slate-500 text-sm">Hãy thử tìm kiếm với từ khóa khác</p>
          </div>
        )}

        {places.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                Kết quả tìm kiếm
                <span className="inline-flex items-center justify-center px-2 py-0.5 ml-1 text-[10px] font-bold bg-indigo-100 text-indigo-700 rounded-md">
                  {places.length}
                </span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {places.map((place) => (
                <div
                  key={`${place.diadiem_id}-${place.ten}`}
                  onClick={() => handleSelectPlace(place)}
                  className="group cursor-pointer bg-white rounded-[2rem] overflow-hidden border border-slate-200/60 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-500 hover:-translate-y-1.5 flex flex-col"
                >
                  <div className="relative w-full h-52 bg-slate-100 overflow-hidden">
                    {place.hinhanh_diadiem?.[0]?.url ? (
                      <img
                        src={place.hinhanh_diadiem?.[0]?.url}
                        alt={place.ten}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                        onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE; }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                        <ImageOff className="w-10 h-10 text-slate-300" />
                      </div>
                    )}
                    
                    {/* Badge at the top right of the image */}
                    <div className="absolute top-4 right-4 left-auto flex flex-col gap-2">
                      {place.danhgia && (
                        <div className="backdrop-blur-md bg-white/90 px-3 py-1.5 rounded-2xl shadow-lg flex items-center gap-1.5 border border-white/20">
                          <span className="text-amber-500 text-xs text-center leading-none">⭐</span>
                          <span className="text-sm font-black text-slate-900">{place.danhgia}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Type overlay at bottom left */}
                    <div className="absolute bottom-4 left-4">
                      <span className="inline-block px-4 py-1.5 backdrop-blur-md bg-indigo-600/90 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg whitespace-nowrap min-w-fit">
                        {getTranslatedType(place.loai)}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-bold text-slate-900 text-lg line-clamp-1 mb-1 group-hover:text-indigo-600 transition-colors">
                      {place.ten}
                    </h3>
                    <div className="flex items-start gap-2 mb-4 flex-1">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <p className="text-sm text-slate-500 line-clamp-2 leading-tight">
                        {place.diachi || place.quan_huyen || 'Khu vực chưa xác định'}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                      <p className="text-sm font-black text-indigo-600">
                        {place.giatien ? (
                          new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(place.giatien)
                        ) : (
                          <span className="text-slate-400 font-medium">Giá tham khảo...</span>
                        )}
                      </p>
                      <div className="w-8 h-8 rounded-full bg-slate-50 group-hover:bg-indigo-600 group-hover:text-white flex items-center justify-center transition-all">
                        <ChevronLeft className="w-4 h-4 rotate-180" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
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

function FilterSection({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{title}</h3>
      {children}
    </div>
  );
}
