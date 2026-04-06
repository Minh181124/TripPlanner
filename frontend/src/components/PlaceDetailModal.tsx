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
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-2xl z-50 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex items-start justify-between p-4 border-b border-gray-200 bg-white">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-slate-900 pr-4">
              {displayPlace.ten}
            </h2>
            {displayPlace.quan_huyen && (
              <p className="text-sm text-slate-600 italic mt-1">{displayPlace.quan_huyen}</p>
            )}
            <div className="flex gap-2 mt-2">
              {displayPlace.danhgia && (
                <span className="text-xs font-medium text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                  ⭐ {displayPlace.danhgia}
                </span>
              )}
              {displayPlace.giatien != null && !isNaN(Number(displayPlace.giatien)) ? (
                <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(displayPlace.giatien))}
                </span>
              ) : null}
            </div>
          </div>
          <button
            onClick={onClose}
            className="mt-1 p-1 hover:bg-gray-100 rounded-full transition-colors shrink-0"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-slate-900" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Images Grid */}
          {displayPlace.hinhanh_diadiem && displayPlace.hinhanh_diadiem.length > 0 && (
            <div className="flex gap-2 h-48 rounded-lg overflow-hidden mb-2">
              <div className="flex-1 h-full">
                <img 
                  src={displayPlace.hinhanh_diadiem[0].url} 
                  alt={displayPlace.ten} 
                  className="w-full h-full object-cover" 
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              </div>
              {displayPlace.hinhanh_diadiem.length > 1 && (
                <div className="flex flex-col gap-2 w-1/3">
                  <div className="flex-1 h-1/2">
                    <img 
                      src={displayPlace.hinhanh_diadiem[1].url} 
                      alt="Detail" 
                      className="w-full h-full object-cover rounded-tr-lg" 
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  </div>
                  {displayPlace.hinhanh_diadiem.length > 2 && (
                    <div className="flex-1 h-1/2 relative group">
                      <img 
                        src={displayPlace.hinhanh_diadiem[2].url} 
                        alt="Detail" 
                        className="w-full h-full object-cover rounded-br-lg" 
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                      {displayPlace.hinhanh_diadiem.length > 3 && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white font-bold text-sm">
                          +{displayPlace.hinhanh_diadiem.length - 3}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          {/* Address */}
          {displayPlace.diachi && (
            <div className="flex gap-3">
              <MapPin className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase">Địa chỉ</p>
                <p className="text-sm text-slate-900">{displayPlace.diachi}</p>
              </div>
            </div>
          )}

          {/* Description */}
          {placeDetail?.chitiet_diadiem && (placeDetail.chitiet_diadiem[0]?.mota_tonghop || placeDetail.chitiet_diadiem[0]?.mota_google) && (
            <div className="bg-gray-50 border-l-4 border-blue-400 p-3 rounded space-y-2">
              <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Mô tả chi tiết</p>
              {placeDetail.chitiet_diadiem[0]?.mota_tonghop && (
                <p className="text-sm text-slate-900">{placeDetail.chitiet_diadiem[0].mota_tonghop}</p>
              )}
              {placeDetail.chitiet_diadiem[0]?.mota_google && (
                <div className="mt-2 text-xs italic text-slate-600 border-t border-gray-200 pt-2">
                  <span className="font-semibold">Từ Google Places: </span>
                  {placeDetail.chitiet_diadiem[0].mota_google}
                </div>
              )}
            </div>
          )}

          {/* Phone */}
          {placeDetail?.chitiet_diadiem && placeDetail.chitiet_diadiem[0]?.sodienthoai ? (
            <div className="flex gap-3">
              <Phone className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase">Điện thoại</p>
                <p className="text-sm text-slate-900">{placeDetail.chitiet_diadiem[0].sodienthoai}</p>
              </div>
            </div>
          ) : (
            <div className="flex gap-3">
              <Phone className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase">Điện thoại</p>
                <p className="text-sm text-slate-400">Đang cập nhật</p>
              </div>
            </div>
          )}

          {/* Website */}
          {placeDetail?.chitiet_diadiem && placeDetail.chitiet_diadiem[0]?.website ? (
            <div className="flex gap-3">
              <Globe className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase">Website</p>
                <a
                  href={placeDetail.chitiet_diadiem[0].website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline break-all"
                >
                  {placeDetail.chitiet_diadiem[0].website}
                </a>
              </div>
            </div>
          ) : (
            <div className="flex gap-3">
              <Globe className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase">Website</p>
                <p className="text-sm text-slate-400">Đang cập nhật</p>
              </div>
            </div>
          )}

          {/* Opening Hours */}
          {placeDetail?.chitiet_diadiem && placeDetail.chitiet_diadiem[0]?.giomocua ? (
            <div className="flex gap-3">
              <Clock className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase">Giờ mở cửa</p>
                <p className="text-sm text-slate-900">{placeDetail.chitiet_diadiem[0].giomocua}</p>
              </div>
            </div>
          ) : (
            <div className="flex gap-3">
              <Clock className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase">Giờ mở cửa</p>
                <p className="text-sm text-slate-400">Đang cập nhật</p>
              </div>
            </div>
          )}

          {/* Activities / Suggestions */}
          {placeDetail?.hoatdong_diadiem && placeDetail.hoatdong_diadiem.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-600 uppercase mb-3 flex items-center gap-1">
                <Tag className="w-4 h-4" />
                Hoạt động gợi ý
              </p>
              <div className="space-y-3">
                {placeDetail.hoatdong_diadiem.map((activity: any, idx: number) => (
                  <div key={idx} className="bg-indigo-50/50 border border-indigo-100 rounded-lg p-3">
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="text-sm font-bold text-indigo-900">{activity.ten_hoatdong}</h4>
                      {activity.gia_thamkhao !== undefined && activity.gia_thamkhao !== null ? (
                        <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(activity.gia_thamkhao) || 0)}
                        </span>
                      ) : null}
                    </div>
                    {activity.loai_hoatdong && (
                      <span className="inline-block px-2 py-0.5 bg-white border border-indigo-200 text-indigo-600 rounded text-[10px] uppercase font-bold mb-2">
                        {activity.loai_hoatdong}
                      </span>
                    )}
                    {activity.noidung_chitiet && (
                      <p className="text-sm text-slate-700 mb-2">{activity.noidung_chitiet}</p>
                    )}
                    {activity.thoidiem_lytuong && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-white px-2 py-1.5 rounded border border-slate-100">
                        <Clock className="w-3.5 h-3.5 text-orange-400" />
                        <span>Thời điểm lý tưởng: <span className="font-medium text-slate-700">{activity.thoidiem_lytuong}</span></span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}



          {loadingDistance && (
            <div className="text-sm text-slate-600 text-center py-2">
              Đang tính toán khoảng cách...
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex gap-2 p-4 border-t border-gray-200 bg-white">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-slate-900 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Hủy
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading || loadingDetail || isConfirming}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-medium"
          >
            {isLoading || loadingDetail || isConfirming ? 'Đang xử lý...' : 'Xác nhận'}
          </button>
        </div>
      </div>
    </>
  );
}
