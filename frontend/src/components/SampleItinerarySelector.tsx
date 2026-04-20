'use client';

import React, { useState, useEffect } from 'react';
import {
  Loader,
  MapPin,
  Clock,
  DollarSign,
  Heart,
  AlertCircle,
  ArrowLeft,
  Eye,
  Calendar,
} from 'lucide-react';
import apiClient from '@/shared/api/apiClient';
import { useAuth } from '@/features/auth';
import { mapServerToItinerary } from '@/shared/utils/itineraryMapper';
import type { MultiDayItinerary } from '@/features/itinerary';

interface SampleTrip {
  lichtrinh_mau_id: number;
  tieude: string;
  mota?: string;
  tong_khoangcach?: number;
  tong_thoigian?: number;
  chi_phi_dukien?: number;
  luotthich?: number;
  lichtrinh_mau_diadiem?: Array<{
    thutu: number;
    ngay_thu_may: number;
    diadiem: {
      ten: string;
      diachi?: string;
    };
    ghichu?: string;
  }>;
}

interface SampleItinerarySelectorProps {
  onSampleSelected: (itineraryData: MultiDayItinerary) => void;
  onBack: () => void;
}

export function SampleItinerarySelector({
  onSampleSelected,
  onBack,
}: SampleItinerarySelectorProps) {
  const [samples, setSamples] = useState<SampleTrip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [previewTrip, setPreviewTrip] = useState<SampleTrip | null>(null);
  const { user } = useAuth();

  // Fetch approved sample itineraries
  useEffect(() => {
    const fetchSamples = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.get('/lichtrinh-mau?page=1&limit=20');
        // Vì apiClient đã có interceptor tự động bóc lớp data (.data.data)
        // nên response ở đây chính là mảng itineraries
        const samples = Array.isArray(response) ? response : [];
        setSamples(samples);
        setError(null);
      } catch (err) {
        console.error('Error fetching samples:', err);
        setError('Không thể tải danh sách mẫu. Vui lòng thử lại.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSamples();
  }, []);

  const handleSelectSample = async (sampleId: number) => {
    if (!user?.nguoidung_id) {
      setError('Vui lòng đăng nhập để sử dụng tính năng này');
      return;
    }

    try {
      setSelectedId(sampleId);
      setIsCreating(true);
      setError(null);

      // Gửi yêu cầu tạo lịch trình từ mẫu
      const postResponse = await apiClient.post(
        `/lichtrinh-nguoidung/from-sample/${sampleId}`,
        {}
      );

      // Vì apiClient đã unwrap nên postResponse chính là object chứa lichtrinh_nguoidung_id
      const newId = (postResponse as any)?.lichtrinh_nguoidung_id;

      if (newId) {
        // Lấy dữ liệu chi tiết của lịch trình vừa tạo
        const completeData = await apiClient.get(
          `/lichtrinh-nguoidung/${newId}`
        );
        
        // Map dữ liệu từ server sang định dạng frontend và gửi về planner
        const mappedItinerary = mapServerToItinerary(completeData as any);
        onSampleSelected(mappedItinerary);
      } else {
        throw new Error('Invalid response from server: Missing ID');
      }
    } catch (err) {
      console.error('Error creating itinerary from sample:', err);
      setError('Không thể tạo lịch trình từ mẫu này. Vui lòng thử lại.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="w-full">
      {/* Header with back button */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={previewTrip ? () => setPreviewTrip(null) : onBack}
          className="rounded p-1 hover:bg-gray-100 transition-colors flex-shrink-0"
          aria-label="Quay lại"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h3 className="font-bold text-lg text-gray-900">
            {previewTrip ? 'Chi tiết lịch trình' : 'Chọn lịch trình mẫu'}
          </h3>
          <p className="text-sm text-gray-600">
            {previewTrip 
              ? 'Xem các địa điểm trong chuyến đi này trước khi bắt đầu' 
              : 'Chọn một trong các mẫu được duyệt để bắt đầu lên kế hoạch'}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Error Message */}
        {error && (
          <div className="flex gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader className="h-6 w-6 animate-spin text-purple-600" />
          </div>
        ) : previewTrip ? (
          /* Preview Detail View */
          <div className="space-y-6">
            <div className="rounded-xl border border-purple-100 bg-purple-50/50 p-4">
              <h4 className="text-lg font-bold text-purple-900 mb-1">{previewTrip.tieude}</h4>
              <p className="text-sm text-purple-700">{previewTrip.mota}</p>
            </div>

            <div className="space-y-4">
              {Array.from(new Set(previewTrip.lichtrinh_mau_diadiem?.map(d => d.ngay_thu_may) || [1]))
                .sort((a, b) => a - b)
                .map(dayNum => (
                  <div key={dayNum} className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
                      <Calendar className="h-4 w-4 text-purple-600" />
                      <span>Ngày {dayNum}</span>
                    </div>
                    <div className="space-y-3 pl-6 border-l-2 border-purple-100 ml-2">
                      {previewTrip.lichtrinh_mau_diadiem
                        ?.filter(d => d.ngay_thu_may === dayNum)
                        .sort((a, b) => a.thutu - b.thutu)
                        .map((item, idx) => (
                          <div key={idx} className="relative">
                            <div className="absolute -left-[1.85rem] top-2 h-3 w-3 rounded-full border-2 border-purple-300 bg-white" />
                            <div className="text-sm">
                              <span className="font-medium text-gray-900">{item.diadiem.ten}</span>
                              {item.ghichu && (
                                <p className="text-xs text-gray-500 mt-0.5">{item.ghichu}</p>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
            </div>

            <button
               onClick={() => {
                 const id = previewTrip.lichtrinh_mau_id;
                 setPreviewTrip(null);
                 handleSelectSample(id);
               }}
               disabled={isCreating}
               className="w-full flex items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-3 font-bold text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {isCreating ? (
                <>
                  <Loader className="h-5 w-5 animate-spin" />
                  <span>Đang tải...</span>
                </>
              ) : (
                <span>Sử dụng lịch trình này</span>
              )}
            </button>
          </div>
        ) : samples.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
            <p className="text-gray-600">Hiện chưa có lịch trình mẫu nào được duyệt</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
          {samples.map((sample) => (
            <div
              key={sample.lichtrinh_mau_id}
              className={`group relative flex flex-col rounded-lg border-2 p-4 transition-all ${
                selectedId === sample.lichtrinh_mau_id
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div 
                  className="flex-1 cursor-pointer"
                  onClick={() => handleSelectSample(sample.lichtrinh_mau_id)}
                >
                  <h4 className="font-bold text-gray-900 group-hover:text-purple-700 transition-colors">
                    {sample.tieude}
                  </h4>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewTrip(sample);
                    }}
                    className="p-1.5 rounded-md text-gray-400 hover:text-purple-600 hover:bg-purple-100 transition-all"
                    title="Xem chi tiết"
                  >
                    <Eye className="h-5 w-5" />
                  </button>
                  {sample.luotthich && sample.luotthich > 0 && (
                    <div className="flex items-center gap-1 text-sm text-red-500">
                      <Heart className="h-4 w-4 fill-current" />
                      {sample.luotthich}
                    </div>
                  )}
                </div>
              </div>

              <div 
                className="cursor-pointer"
                onClick={() => handleSelectSample(sample.lichtrinh_mau_id)}
              >
                {sample.mota && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{sample.mota}</p>
                )}

                <div className="flex flex-wrap gap-3 text-xs text-gray-600">
                  {sample.tong_khoangcach && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{Math.round(Number(sample.tong_khoangcach))} km</span>
                    </div>
                  )}
                  {sample.tong_thoigian && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{sample.tong_thoigian} giờ</span>
                    </div>
                  )}
                  {sample.chi_phi_dukien && Number(sample.chi_phi_dukien) > 0 && (
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3.5 w-3.5" />
                      <span>{Number(sample.chi_phi_dukien).toLocaleString('vi-VN')} ₫</span>
                    </div>
                  )}
                </div>
              </div>

              {selectedId === sample.lichtrinh_mau_id && isCreating && (
                <div className="mt-3 flex items-center gap-2 text-sm text-purple-600">
                  <Loader className="h-4 w-4 animate-spin" />
                  <span>Đang tạo lịch trình...</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}
