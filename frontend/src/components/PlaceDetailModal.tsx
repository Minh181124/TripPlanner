'use client';

import { useState, useEffect } from 'react';
import { X, MapPin, Phone, Globe, Clock, Navigation2, Tag } from 'lucide-react';
import apiClient from '@/shared/api/apiClient';
import type { PlaceItem } from '@/features/itinerary';

interface PlaceDetailModalProps {
  isOpen: boolean;
  place: any; // Resultado da busca
  onClose: () => void;
  onConfirm: (place: PlaceItem, notes: string) => void;
  currentDayPlaces: PlaceItem[];
  isLoading?: boolean;
}

export function PlaceDetailModal({
  isOpen,
  place,
  onClose,
  onConfirm,
  currentDayPlaces = [],
  isLoading = false,
}: PlaceDetailModalProps) {
  const [notes, setNotes] = useState('');
  const [distanceInfo, setDistanceInfo] = useState<{
    distance: string;
    duration: string;
  } | null>(null);
  const [loadingDistance, setLoadingDistance] = useState(false);
  const [placeDetail, setPlaceDetail] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  // Fetch place detail quando modal abrir
  useEffect(() => {
    if (isOpen && place && !placeDetail) {
      fetchPlaceDetail();
    }
  }, [isOpen, place]);

  const fetchPlaceDetail = async () => {
    if (!place?.diadiem_id) {
      setPlaceDetail(place);
      return;
    }

    try {
      setLoadingDetail(true);
      const response = await apiClient.get('/map/place-detail', {
        params: { place_id: place.diadiem_id },
      });

      if (response.data?.data) {
        setPlaceDetail(response.data.data);
      } else {
        setPlaceDetail(place);
      }
    } catch (error) {
      console.error('Error fetching place detail:', error);
      setPlaceDetail(place);
    } finally {
      setLoadingDetail(false);
    }
  };



  const handleConfirm = async () => {
    // Guard: prevent multiple clicks - CHECK FIRST
    if (isConfirming || isLoading || loadingDetail) {
      console.warn('[PlaceDetailModal] 🚫 handleConfirm BLOCKED by guard', { isConfirming, isLoading, loadingDetail });
      return;
    }

    if (!place) {
      console.error('[PlaceDetailModal] 🚫 handleConfirm called with no place!');
      return;
    }

    try {
      setIsConfirming(true);
      console.log(`[PlaceDetailModal] ✅ handleConfirm STARTED for: ${place.ten} (diadiem_id: ${place.diadiem_id})`);

      const newPlace: PlaceItem = {
        instanceId: '', // Will be generated in PlaceSearch before calling addPlaceToDay
        diadiem_id: place.diadiem_id,
        place_id: place.place_id || place.google_place_id,
        ten: place.ten,
        diachi: place.diachi,
        lat: place.lat,
        lng: place.lng,
        loai: place.loai,
        thutu: (currentDayPlaces.length || 0) + 1,
        ghichu: notes,
      };

      console.log('[PlaceDetailModal] 📤 Calling onConfirm with place:', { diadiem_id: newPlace.diadiem_id, ten: newPlace.ten });
      onConfirm(newPlace, notes);
      console.log('[PlaceDetailModal] ✓ onConfirm returned');
      
      // Close modal immediately after confirming
      console.log('[PlaceDetailModal] 📤 Calling onClose');
      onClose();
      console.log('[PlaceDetailModal] ✓ onClose returned');
      
      // Reset state
      setNotes('');
      setPlaceDetail(null);
      console.log('[PlaceDetailModal] ✓ State reset complete');
    } catch (err) {
      console.error('[PlaceDetailModal] ❌ Error in handleConfirm:', err);
    } finally {
      console.log('[PlaceDetailModal] 🔄 Finally block: Setting isConfirming to false');
      setIsConfirming(false);
    }
  };

  if (!isOpen || !place) return null;

  const displayPlace = placeDetail || place;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
        onClick={onClose}
      />
      
      <div 
        className={`relative w-full max-w-2xl bg-white/95 backdrop-blur-xl rounded-[2.5rem] shadow-2xl overflow-hidden transform transition-all duration-500 ease-out border border-white/20 ${
          isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-8'
        }`}
      >
        <div className="absolute top-6 right-6 z-10 flex gap-2">
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-md shadow-lg flex items-center justify-center text-slate-400 hover:text-slate-900 hover:scale-110 transition-all active:scale-95"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="max-h-[min(90vh,800px)] overflow-y-auto scrollbar-hide">
          {/* Hero Section / Optimized Image Grid */}
          <div className="relative h-80 group">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/70 z-[1]" />
            
            <div className="h-full bg-slate-100 overflow-hidden">
              {displayPlace.hinhanh_diadiem && displayPlace.hinhanh_diadiem.length > 0 ? (
                <div className={`grid gap-1 h-full h-full ${
                  displayPlace.hinhanh_diadiem.length === 1 ? 'grid-cols-1' : 
                  displayPlace.hinhanh_diadiem.length === 2 ? 'grid-cols-2' : 
                  'grid-cols-4 grid-rows-2'
                }`}>
                  {displayPlace.hinhanh_diadiem.length === 1 ? (
                    <img
                      src={displayPlace.hinhanh_diadiem[0].url}
                      className="w-full h-full object-cover"
                      alt={displayPlace.ten}
                      onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE; }}
                    />
                  ) : displayPlace.hinhanh_diadiem.length === 2 ? (
                    displayPlace.hinhanh_diadiem.slice(0, 2).map((img: any, i: number) => (
                      <img
                        key={i}
                        src={img.url}
                        className="w-full h-full object-cover"
                        alt={`${displayPlace.ten} ${i}`}
                        onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE; }}
                      />
                    ))
                  ) : (
                    <>
                      <div className="col-span-2 row-span-2 overflow-hidden">
                        <img
                          src={displayPlace.hinhanh_diadiem[0].url}
                          className="w-full h-full object-cover"
                          alt={displayPlace.ten}
                        />
                      </div>
                      <div className="col-span-2 row-span-1 overflow-hidden">
                        <img
                          src={displayPlace.hinhanh_diadiem[1].url}
                          className="w-full h-full object-cover"
                          alt={displayPlace.ten}
                        />
                      </div>
                      <div className="col-span-2 row-span-1 overflow-hidden">
                        <img
                          src={displayPlace.hinhanh_diadiem[2]?.url || displayPlace.hinhanh_diadiem[0].url}
                          className="w-full h-full object-cover"
                          alt={displayPlace.ten}
                        />
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-slate-200 flex items-center justify-center">
                  <MapPin className="w-16 h-16 text-slate-300" />
                </div>
              )}
            </div>

            <div className="absolute bottom-6 left-8 right-8 z-[2]">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <span className="px-3 py-1 bg-indigo-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-full shadow-lg">
                  {displayPlace.loai || 'Địa điểm'}
                </span>
                {displayPlace.danhgia && (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-white/90 backdrop-blur-md rounded-full shadow-lg border border-white/20">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span className="text-sm font-bold text-slate-900">{displayPlace.danhgia}</span>
                  </div>
                )}
              </div>
              <h2 className="text-4xl font-extrabold text-white drop-shadow-md tracking-tight leading-tight">{displayPlace.ten}</h2>
            </div>
          </div>

          <div className="p-8 space-y-10">
            {/* Primary Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <SectionTitle icon={<MapPin className="text-red-500" />} title="Địa chỉ" />
                  <p className="text-slate-600 text-sm leading-relaxed font-bold pl-8 mt-2">
                    {displayPlace.diachi}
                  </p>
                </div>

                {displayPlace.giatien != null && (
                  <div>
                    <SectionTitle icon={<Tag className="text-green-500" />} title="Giá tham khảo" />
                    <p className="text-green-600 text-lg font-extrabold pl-8 mt-1">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(displayPlace.giatien))}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                {displayPlace.tu_khoa && (
                  <div>
                    <SectionTitle icon={<Globe className="text-blue-500" />} title="Từ khóa / Đặc điểm" />
                    <div className="flex flex-wrap gap-2 pl-8 mt-3">
                      {displayPlace.tu_khoa.split(',').map((tag: string, i: number) => (
                        <span key={i} className="px-3 py-1 bg-slate-100 text-slate-600 text-[11px] font-bold rounded-lg border border-slate-200">
                          #{tag.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {(placeDetail?.chitiet_diadiem?.[0]?.sodienthoai) && (
                  <div>
                    <SectionTitle icon={<Phone className="text-indigo-500" />} title="Liên hệ" />
                    <a href={`tel:${placeDetail.chitiet_diadiem[0].sodienthoai}`} className="text-indigo-600 text-sm font-bold pl-8 hover:underline block mt-1">
                      {placeDetail.chitiet_diadiem[0].sodienthoai}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Description & Website */}
            <div className="space-y-6">
              {(placeDetail?.chitiet_diadiem?.[0]?.mota_tonghop || placeDetail?.chitiet_diadiem?.[0]?.mota_google) && (
                <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                  <SectionTitle icon={<Info className="text-slate-600" />} title="Giới thiệu địa điểm" />
                  <div className="text-slate-700 text-sm leading-relaxed mt-4 pl-8 font-bold space-y-3">
                    {placeDetail.chitiet_diadiem[0].mota_tonghop && <p>{placeDetail.chitiet_diadiem[0].mota_tonghop}</p>}
                    {placeDetail.chitiet_diadiem[0].mota_google && (
                      <p className="text-xs italic text-slate-500 pt-3 border-t border-slate-200">
                        Nguồn Google: {placeDetail.chitiet_diadiem[0].mota_google}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {placeDetail?.chitiet_diadiem?.[0]?.website && (
                <div className="pl-8 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Trang web chính thức</p>
                    <a href={placeDetail.chitiet_diadiem[0].website} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-indigo-600 hover:underline break-all">
                      {placeDetail.chitiet_diadiem[0].website}
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Activities & Ideal Time */}
            {placeDetail?.hoatdong_diadiem && placeDetail.hoatdong_diadiem.length > 0 && (
              <div className="space-y-6">
                <SectionTitle icon={<Coffee className="text-orange-500" />} title="Các hoạt động thú vị" />
                <div className="grid grid-cols-1 gap-4 pl-8">
                  {placeDetail.hoatdong_diadiem.map((activity: any, i: number) => (
                    <div key={i} className="p-5 bg-white border border-slate-100 rounded-[1.5rem] hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5 transition-all group relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-100 transition-opacity">
                        <CheckCircle className="w-8 h-8 text-indigo-100" />
                      </div>
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-base font-extrabold text-slate-800">{activity.ten_hoatdong}</span>
                        {activity.gia_thamkhao && (
                          <span className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(activity.gia_thamkhao)}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 mb-4 font-bold">{activity.noidung_chitiet}</p>
                      
                      {activity.thoidiem_lytuong && (
                        <div className="flex items-center gap-2 text-xs text-indigo-600 font-bold bg-indigo-50 px-3 py-2 rounded-xl border border-indigo-100">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Thời điểm lý tưởng: {activity.thoidiem_lytuong}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Footer */}
        <div className="p-8 bg-slate-50/80 backdrop-blur-md border-t border-slate-200 flex items-center justify-between gap-4">
          <button
            onClick={onClose}
            className="px-8 py-3.5 text-slate-500 font-bold hover:text-slate-900 transition-colors"
          >
            Đóng lại
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading || loadingDetail || isConfirming}
            className="flex-1 max-w-xs flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold rounded-full shadow-xl shadow-indigo-600/20 transition-all border-none active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {isLoading || loadingDetail || isConfirming ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <CheckCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span>Thêm vào lịch trình</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Helper components
 */
function SectionTitle({ icon, title }: { icon: React.ReactNode, title: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-xl bg-white shadow-sm flex items-center justify-center border border-slate-100">
        {icon}
      </div>
      <h3 className="text-sm font-bold text-slate-900 tracking-tight underline decoration-indigo-200 decoration-4 underline-offset-4">{title}</h3>
    </div>
  );
}

// Custom Icons that might be missing from initial import
const Info = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
  </svg>
);

const Star = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

const CheckCircle = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

const Loader = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>
  </svg>
);

const Coffee = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>
  </svg>
);

const PLACEHOLDER_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23f3f4f6" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" font-size="16" fill="%239ca3af" text-anchor="middle" dominant-baseline="middle" font-family="system-ui"%3ENo Image%3C/text%3E%3C/svg%3E';
