'use client';

import { useState, useRef, useEffect } from 'react';
import { useItinerary, PlaceItem } from '@/features/itinerary';
import { PlaceDetailModal } from './PlaceDetailModal';
import { Search, MapPin, Loader } from 'lucide-react';
import apiClient from '@/shared/api/apiClient';

interface PlaceSearchProps {
  day: number;
}

interface SearchResult {
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
}

export function PlaceSearch({ day }: PlaceSearchProps) {
  const { addPlaceToDay, itinerary } = useItinerary();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<SearchResult | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddingPlace, setIsAddingPlace] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const currentDayData = itinerary.days[day - 1];

  // Debounced search
  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout (300ms debounce)
    if (value.length >= 2) {
      searchTimeoutRef.current = setTimeout(() => {
        searchPlaces(value);
      }, 300);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  };

  const searchPlaces = async (keyword: string) => {
    try {
      setLoading(true);
      const response = await apiClient.get('/map/search', {
        params: {
          keyword,
          lat: currentDayData?.places[0]?.lat || 21.0285,
          lng: currentDayData?.places[0]?.lng || 105.8542,
        },
      });

      setResults(response.data.data || []);
      setIsOpen(true);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlace = (place: SearchResult) => {
    setSelectedPlace(place);
    setIsModalOpen(true);
    setIsOpen(false);
  };

  const handleConfirmPlace = async (newPlace: PlaceItem, notes: string) => {
    console.log(`[PlaceSearch] 📥 handleConfirmPlace RECEIVED for: ${newPlace.ten} (diadiem_id: ${newPlace.diadiem_id})`);
    
    try {
      console.log('[PlaceSearch] 🔄 Setting isAddingPlace = true');
      setIsAddingPlace(true);
      
      // Generate unique instanceId for this place instance
      const instanceId = crypto.randomUUID();
      const placeWithInstanceId: PlaceItem = {
        ...newPlace,
        instanceId,
      };
      
      console.log(`[PlaceSearch] 📤 Calling addPlaceToDay(day=${day}) with place:`, { diadiem_id: placeWithInstanceId.diadiem_id, ten: placeWithInstanceId.ten, instanceId: placeWithInstanceId.instanceId, thutu: placeWithInstanceId.thutu, ghichu: placeWithInstanceId.ghichu });
      addPlaceToDay(day, placeWithInstanceId);
      console.log('[PlaceSearch] ✓ addPlaceToDay returned');
      
      // Reset search state immediately
      console.log('[PlaceSearch] 🧹 Resetting search state (query, results, selectedPlace, isModalOpen)');
      setQuery('');
      setResults([]);
      setSelectedPlace(null);
      setIsModalOpen(false);
      console.log('[PlaceSearch] ✓ Search state reset complete');
    } catch (error) {
      console.error('[PlaceSearch] ❌ Error adding place:', error);
    } finally {
      console.log('[PlaceSearch] 🔄 Setting isAddingPlace = false');
      setIsAddingPlace(false);
      console.log('[PlaceSearch] ✓ handleConfirmPlace COMPLETE');
    }
  };

  // Handle click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <div ref={searchRef} className="relative z-20">
        <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-3 py-2">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={handleQueryChange}
            onFocus={() => results.length > 0 && setIsOpen(true)}
            placeholder="Tìm địa điểm để thêm vào ngày này..."
            className="flex-1 outline-none text-sm text-slate-900 placeholder-gray-500 bg-white"
          />
          {loading && <Loader className="w-5 h-5 text-blue-600 animate-spin" />}
        </div>

        {isOpen && results.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
            {results.map((place) => (
              <button
                key={place.diadiem_id}
                onClick={() => handleSelectPlace(place)}
                className="w-full text-left px-4 py-3 text-slate-900 hover:bg-gray-50 border-b border-gray-100 last:border-0 transition-colors"
              >
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5 text-blue-600 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-slate-900">{place.ten}</p>
                    <p className="text-xs text-gray-500 truncate">{place.diachi}</p>
                    {place.quan_huyen && (
                      <p className="text-xs text-gray-400">{place.quan_huyen}</p>
                    )}
                    {place.is_internal && (
                      <span className="inline-block mt-1 px-1 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                        Đã lưu
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Place Detail Modal */}
      {selectedPlace && (
        <PlaceDetailModal
          isOpen={isModalOpen}
          place={selectedPlace}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedPlace(null);
          }}
          onConfirm={handleConfirmPlace}
          currentDayPlaces={currentDayData?.places || []}
          isLoading={isAddingPlace}
        />
      )}
    </>
  );
}
