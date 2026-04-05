'use client';

import { useItinerary, useItineraryStats } from '@/features/itinerary';

import { TimelineEditorWithMap } from './TimelineEditorWithMap';
import { Save, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/shared/api/apiClient';

export function MultiDayPlanner() {
  const router = useRouter();
  const { itinerary, initializeItinerary, validateItineraryTitle, validateAllDaysHavePlaces, setIsLoading } = useItinerary();
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Auto-calculate day stats when places change
  useItineraryStats();


  const handleSave = async () => {
    if (isSaving) return; // Prevent double submission

    // Validate before saving
    const titleError = validateItineraryTitle();
    const daysError = validateAllDaysHavePlaces();

    if (titleError) {
      setSaveError(titleError);
      return;
    }

    if (daysError) {
      setSaveError(daysError);
      return;
    }

    try {
      setIsSaving(true);
      setSaveError(null);
      setIsLoading(true);

      // Prepare data for backend
      const saveData = {
        tieude: itinerary.tieude,
        mota: itinerary.mota || '',
        so_ngay: itinerary.so_ngay,
        sothich_id: itinerary.sothich_id,
        ngaybatdau: itinerary.ngaybatdau ? new Date(itinerary.ngaybatdau).toISOString().split('T')[0] : undefined,
        ngayketthuc: itinerary.ngayketthuc ? new Date(itinerary.ngayketthuc).toISOString().split('T')[0] : undefined,
        days: itinerary.days.map(day => ({
          ngay_thu_may: day.ngay_thu_may,
          places: day.places.map(place => ({
            diadiem_id: place.diadiem_id,
            thutu: place.thutu,
            ghichu: place.ghichu || '',
            thoiluong: place.thoiluong,
          })),
        })),
      };

      // Call backend API
      const response = await apiClient.post('/lichtrinh-nguoidung', saveData);

      if (response.data?.data?.id) {
        alert('Lưu kế hoạch thành công! ✓');
        // Redirect to dashboard
        router.push('/dashboard');
      } else {
        throw new Error('Không nhận được ID kế hoạch từ server');
      }
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error?.message || 'Có lỗi khi lưu kế hoạch';
      console.error('Save error:', error);
      setSaveError(errorMsg);
      alert(`Lỗi: ${errorMsg}`);
    } finally {
      setIsSaving(false);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Kế hoạch du lịch</h1>
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5" />
            {isSaving ? 'Đang lưu...' : 'Lưu'}
          </button>
        </div>

        {/* Error message */}
        {saveError && (
          <div className="max-w-7xl mx-auto px-4 mt-3 flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="text-sm">{saveError}</span>
            <button
              onClick={() => setSaveError(null)}
              className="ml-auto text-red-600 hover:text-red-800 font-semibold"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Timeline with Integrated Map */}
      <TimelineEditorWithMap />
    </div>
  );
}
