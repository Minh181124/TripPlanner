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
          {placeDetail?.chitiet_diadiem && placeDetail.chitiet_diadiem[0]?.mota_tonghop && (
            <div className="bg-gray-50 border-l-4 border-blue-400 p-3 rounded">
              <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Mô tả</p>
              <p className="text-sm text-slate-900">{placeDetail.chitiet_diadiem[0].mota_tonghop}</p>
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
              <p className="text-xs font-semibold text-slate-600 uppercase mb-2 flex items-center gap-1">
                <Tag className="w-4 h-4" />
                Hoạt động gợi ý
              </p>
              <div className="flex flex-wrap gap-2">
                {placeDetail.hoatdong_diadiem.map((activity: any, idx: number) => (
                  <div
                    key={idx}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs"
                  >
                    <span>{activity.ten_hoatdong}</span>
                  </div>
                ))}
              </div>
              {placeDetail.hoatdong_diadiem.some((a: any) => a.noidung_chitiet) && (
                <div className="mt-2 text-xs text-slate-600 space-y-1">
                  {placeDetail.hoatdong_diadiem.map((activity: any, idx: number) =>
                    activity.noidung_chitiet ? (
                      <p key={idx} className="italic">
                        {activity.noidung_chitiet}
                      </p>
                    ) : null,
                  )}
                </div>
              )}
            </div>
          )}



          {loadingDistance && (
            <div className="text-sm text-slate-600 text-center py-2">
              Đang tính toán khoảng cách...
            </div>
          )}

          {/* Notes textarea */}
          <div>
            <label htmlFor="notes" className="block text-xs font-semibold text-slate-600 uppercase mb-2">
              Ghi chú: Bạn sẽ làm gì ở đây?
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value.slice(0, 200))}
              placeholder="Nhập ghi chú của bạn... (tùy chọn)"
              className="w-full h-24 p-3 border border-gray-300 rounded-lg text-slate-900 placeholder-gray-500 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
            />
            <p className="text-xs text-slate-600 mt-1">
              {notes.length}/200 ký tự
            </p>
          </div>
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
