'use client';

import React, { useState, useEffect } from 'react';
import { X, MapPin, Plus, Trash2 } from 'lucide-react';
import { useSampleTripActions } from '../hooks/useSampleTripActions';
import type { SampleTrip, CreateSampleTripDto } from '../model/sampleTrips.types';

interface SampleTripFormModalProps {
  trip?: SampleTrip | null;
  isAdmin?: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface PlaceInput {
  mapboxPlaceId: string;
  ten: string;
  diachi: string;
  lat: number;
  lng: number;
  ghichu: string;
  thoiluong: number | null;
  ngay_thu_may: number;
}

const emptyPlace = (): PlaceInput => ({
  mapboxPlaceId: `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  ten: '',
  diachi: '',
  lat: 0,
  lng: 0,
  ghichu: '',
  thoiluong: 60,
  ngay_thu_may: 1,
});

export function SampleTripFormModal({ trip, isAdmin = false, onClose, onSuccess }: SampleTripFormModalProps) {
  const { createTrip, updateTrip, isSubmitting } = useSampleTripActions();

  const [tieude, setTieude] = useState('');
  const [mota, setMota] = useState('');
  const [thoigian_dukien, setThoigianDukien] = useState('');
  const [chi_phi_dukien, setChiPhiDukien] = useState('');
  const [places, setPlaces] = useState<PlaceInput[]>([emptyPlace()]);

  // Load data khi edit
  useEffect(() => {
    if (trip) {
      setTieude(trip.tieude || '');
      setMota(trip.mota || '');
      setThoigianDukien(trip.thoigian_dukien || '');
      setChiPhiDukien(trip.chi_phi_dukien ? String(trip.chi_phi_dukien) : '');
      if (trip.lichtrinh_mau_diadiem && trip.lichtrinh_mau_diadiem.length > 0) {
        setPlaces(
          trip.lichtrinh_mau_diadiem.map((p) => ({
            mapboxPlaceId: p.diadiem?.google_place_id || `local-${Date.now()}`,
            ten: p.diadiem?.ten || '',
            diachi: p.diadiem?.diachi || '',
            lat: p.diadiem?.lat || 0,
            lng: p.diadiem?.lng || 0,
            ghichu: p.ghichu || '',
            thoiluong: p.thoiluong,
            ngay_thu_may: p.ngay_thu_may || 1,
          }))
        );
      }
    }
  }, [trip]);

  const handleAddPlace = () => {
    setPlaces([...places, emptyPlace()]);
  };

  const handleRemovePlace = (index: number) => {
    if (places.length <= 1) return;
    setPlaces(places.filter((_, i) => i !== index));
  };

  const handlePlaceChange = (index: number, field: keyof PlaceInput, value: any) => {
    const updated = [...places];
    (updated[index] as any)[field] = value;
    setPlaces(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tieude.trim()) {
      alert('Vui lòng nhập tiêu đề');
      return;
    }

    const validPlaces = places.filter((p) => p.ten.trim());
    if (validPlaces.length === 0) {
      alert('Vui lòng thêm ít nhất 1 địa điểm');
      return;
    }

    const dto: CreateSampleTripDto = {
      tieude: tieude.trim(),
      mota: mota.trim() || null,
      thoigian_dukien: thoigian_dukien.trim() || null,
      chi_phi_dukien: chi_phi_dukien ? parseFloat(chi_phi_dukien) : null,
      places: validPlaces,
    };

    try {
      if (trip) {
        await updateTrip(trip.lichtrinh_mau_id, dto, isAdmin, onSuccess);
      } else {
        await createTrip(dto, onSuccess);
      }
    } catch {
      // Error handled in hook
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-slate-800">
            {trip ? 'Chỉnh sửa lịch trình mẫu' : 'Tạo lịch trình mẫu mới'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Tiêu đề */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Tiêu đề chuyến đi <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={tieude}
              onChange={(e) => setTieude(e.target.value)}
              placeholder="VD: Tour Hà Nội 3 ngày 2 đêm"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              required
            />
          </div>

          {/* Mô tả chuyến đi */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Mô tả chuyến đi
            </label>
            <textarea
              value={mota}
              onChange={(e) => setMota(e.target.value)}
              placeholder="Mô tả chi tiết về chuyến đi, trải nghiệm, lưu ý..."
              rows={4}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none"
            />
          </div>

          {/* Thời gian dự kiến + Chi phí dự kiến */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Thời gian dự kiến
              </label>
              <input
                type="text"
                value={thoigian_dukien}
                onChange={(e) => setThoigianDukien(e.target.value)}
                placeholder="VD: 3 ngày 2 đêm"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Chi phí dự kiến (VNĐ)
              </label>
              <input
                type="number"
                value={chi_phi_dukien}
                onChange={(e) => setChiPhiDukien(e.target.value)}
                placeholder="VD: 5000000"
                min={0}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Danh sách địa điểm */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-slate-700">
                Danh sách địa điểm <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleAddPlace}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors font-medium"
              >
                <Plus className="w-4 h-4" />
                Thêm địa điểm
              </button>
            </div>

            <div className="space-y-4">
              {places.map((place, index) => (
                <div
                  key={index}
                  className="relative bg-slate-50 rounded-lg p-4 border border-slate-200"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </div>
                    <span className="text-sm font-semibold text-slate-700">Địa điểm {index + 1}</span>
                    {places.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemovePlace(index)}
                        className="ml-auto p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <input
                        type="text"
                        value={place.ten}
                        onChange={(e) => handlePlaceChange(index, 'ten', e.target.value)}
                        placeholder="Tên địa điểm *"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        required
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={place.diachi}
                        onChange={(e) => handlePlaceChange(index, 'diachi', e.target.value)}
                        placeholder="Địa chỉ"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      />
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={place.lat || ''}
                        onChange={(e) => handlePlaceChange(index, 'lat', parseFloat(e.target.value) || 0)}
                        placeholder="Latitude"
                        step="any"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      />
                      <input
                        type="number"
                        value={place.lng || ''}
                        onChange={(e) => handlePlaceChange(index, 'lng', parseFloat(e.target.value) || 0)}
                        placeholder="Longitude"
                        step="any"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      />
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={place.thoiluong || ''}
                        onChange={(e) => handlePlaceChange(index, 'thoiluong', parseInt(e.target.value) || null)}
                        placeholder="Thời lượng (phút)"
                        min={0}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      />
                      <input
                        type="number"
                        value={place.ngay_thu_may}
                        onChange={(e) => handlePlaceChange(index, 'ngay_thu_may', parseInt(e.target.value) || 1)}
                        placeholder="Ngày thứ"
                        min={1}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      />
                    </div>
                  </div>
                  <div className="mt-2">
                    <input
                      type="text"
                      value={place.ghichu}
                      onChange={(e) => handlePlaceChange(index, 'ghichu', e.target.value)}
                      placeholder="Ghi chú cho địa điểm này..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Đang xử lý...' : trip ? 'Cập nhật' : 'Tạo mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
