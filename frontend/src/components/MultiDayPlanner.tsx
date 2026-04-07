'use client';

import { useItinerary, useItineraryStats, PlanDetailEditor } from '@/features/itinerary';
import { TimelineEditorWithMap } from './TimelineEditorWithMap';
import { Save, AlertCircle, ArrowRight, ArrowLeft, CheckCircle2, Pencil } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/shared/api/apiClient';
import type { PlaceItem, MultiDayItinerary, DayItinerary } from '@/features/itinerary';

// ----------------------------------------------------------------------------
// Map server response → MultiDayItinerary
// ----------------------------------------------------------------------------

interface ServerPlace {
  id: number;
  thutu: number;
  ngay_thu_may: number;
  ghichu: string | null;
  thoiluong: number | null;
  thoigian_den: string | Date | null;
  diadiem?: {
    diadiem_id: number;
    google_place_id: string;
    ten: string;
    diachi: string | null;
    lat: number | null;
    lng: number | null;
    loai: string | null;
  } | null;
}

interface ServerDayConfig {
  ngay_thu_may: number;
  gio_batdau: string | null;
  diem_batdau_ten: string | null;
  diem_batdau_lat: number | null;
  diem_batdau_lng: number | null;
  diem_ketthuc_ten: string | null;
  diem_ketthuc_lat: number | null;
  diem_ketthuc_lng: number | null;
}

/** Convert DB Time value (Date object or "HH:mm:ss") → "HH:mm" string */
function parseDbTime(val: string | Date | null): string | undefined {
  if (!val) return undefined;
  if (val instanceof Date) {
    const h = String(val.getUTCHours()).padStart(2, '0');
    const m = String(val.getUTCMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  }
  // "HH:mm:ss" string
  return String(val).substring(0, 5);
}

function mapServerToItinerary(server: any): MultiDayItinerary {
  const serverPlaces: ServerPlace[] = server.lichtrinh_nguoidung_diadiem ?? [];
  const serverDayConfigs: ServerDayConfig[] = server.lichtrinh_nguoidung_ngay ?? [];

  // Group places by ngay_thu_may
  const dayMap = new Map<number, PlaceItem[]>();
  for (const sp of serverPlaces) {
    const day = sp.ngay_thu_may ?? 1;
    if (!dayMap.has(day)) dayMap.set(day, []);

    const dd = sp.diadiem;
    if (!dd) continue;

    const arrivalTime = parseDbTime(sp.thoigian_den);
    const stay = sp.thoiluong ?? 60;

    dayMap.get(day)!.push({
      instanceId: `server-${sp.id}-${crypto.randomUUID()}`,
      diadiem_id: dd.diadiem_id,
      place_id: dd.google_place_id,
      ten: dd.ten,
      diachi: dd.diachi ?? '',
      lat: dd.lat ?? 0,
      lng: dd.lng ?? 0,
      loai: dd.loai ?? '',
      ghichu: sp.ghichu ?? '',
      thoiluong: sp.thoiluong ?? undefined,
      stayDuration: stay,
      thutu: sp.thutu,
      arrivalTime,
      departureTime: arrivalTime ? (() => {
        const [h, m] = arrivalTime.split(':').map(Number);
        const total = Math.min(h * 60 + m + stay, 23 * 60 + 59);
        return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
      })() : undefined,
    });
  }

  const maxDay = dayMap.size > 0 ? Math.max(...dayMap.keys()) : 1;

  // Build day config lookup
  const dayConfigMap = new Map<number, ServerDayConfig>();
  for (const dc of serverDayConfigs) dayConfigMap.set(dc.ngay_thu_may, dc);

  const days: DayItinerary[] = Array.from({ length: maxDay }, (_, i) => {
    const dayNum = i + 1;
    const dc = dayConfigMap.get(dayNum);
    return {
      ngay_thu_may: dayNum,
      places: (dayMap.get(dayNum) ?? []).sort((a, b) => (a.thutu ?? 0) - (b.thutu ?? 0)),
      startTime: dc?.gio_batdau ?? '08:00',
      startLocation: dc?.diem_batdau_lat && dc?.diem_batdau_lng ? {
        name: dc.diem_batdau_ten ?? '',
        lat: dc.diem_batdau_lat,
        lng: dc.diem_batdau_lng,
      } : undefined,
      endLocation: dc?.diem_ketthuc_lat && dc?.diem_ketthuc_lng ? {
        name: dc.diem_ketthuc_ten ?? '',
        lat: dc.diem_ketthuc_lat,
        lng: dc.diem_ketthuc_lng,
      } : undefined,
    };
  });

  return {
    id: server.lichtrinh_nguoidung_id,
    tieude: server.tieude ?? '',
    so_ngay: maxDay,
    ngaybatdau: server.ngaybatdau ?? undefined,
    ngayketthuc: server.ngayketthuc ?? undefined,
    days,
    currentDay: 1,
    isDraft: false,
  };
}

// ----------------------------------------------------------------------------
// Component
// ----------------------------------------------------------------------------

interface MultiDayPlannerProps {
  editId?: number;
}

export function MultiDayPlanner({ editId }: MultiDayPlannerProps) {
  const router = useRouter();
  const { itinerary, validateItineraryTitle, validateAllDaysHavePlaces, setIsLoading, loadItinerary } = useItinerary();
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [step, setStep] = useState<'timeline' | 'details'>('timeline');
  const [loadingEdit, setLoadingEdit] = useState(!!editId);

  // Auto-calculate day stats when places change
  useItineraryStats();

  // --- Load existing itinerary (edit mode) ---
  useEffect(() => {
    if (!editId) return;
    setLoadingEdit(true);
    apiClient
      .get(`/lichtrinh-nguoidung/${editId}`)
      .then((res: any) => {
        const data = res?.data?.data ?? res?.data ?? res;
        loadItinerary(mapServerToItinerary(data));
      })
      .catch((err: any) => {
        console.error('[MultiDayPlanner] Load edit error:', err);
        setSaveError('Không thể tải lịch trình. Vui lòng thử lại.');
      })
      .finally(() => setLoadingEdit(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editId]);

  const handleGoToDetails = () => {
    const titleError = validateItineraryTitle();
    const daysError = validateAllDaysHavePlaces();
    if (titleError) { setSaveError(titleError); return; }
    if (daysError) { setSaveError(daysError); return; }
    setSaveError(null);
    setStep('details');
  };

  const handleBackToTimeline = () => setStep('timeline');

  const handleSave = async () => {
    if (isSaving) return;

    const titleError = validateItineraryTitle();
    const daysError = validateAllDaysHavePlaces();
    if (titleError) { setSaveError(titleError); return; }
    if (daysError) { setSaveError(daysError); return; }

    try {
      setIsSaving(true);
      setSaveError(null);
      setIsLoading(true);

      const flatPlaces = itinerary.days.flatMap((day) =>
        day.places.map((place) => ({
          mapboxPlaceId: place.place_id,
          ten: place.ten,
          diachi: place.diachi || null,
          lat: place.lat,
          lng: place.lng,
          ghichu: place.ghichu || '',
          thoiluong: place.stayDuration ?? place.thoiluong ?? null,
          ngay_thu_may: day.ngay_thu_may,
          thoigian_den: place.arrivalTime || null,
        })),
      );

      const dayConfigs = itinerary.days.map((day) => ({
        ngay_thu_may: day.ngay_thu_may,
        gio_batdau: day.startTime || '08:00',
        diem_batdau_ten: day.startLocation?.name || null,
        diem_batdau_lat: day.startLocation?.lat || null,
        diem_batdau_lng: day.startLocation?.lng || null,
        diem_ketthuc_ten: day.endLocation?.name || null,
        diem_ketthuc_lat: day.endLocation?.lat || null,
        diem_ketthuc_lng: day.endLocation?.lng || null,
      }));

      const saveData = {
        tieude: itinerary.tieude,
        ngaybatdau: itinerary.ngaybatdau ? new Date(itinerary.ngaybatdau).toISOString().split('T')[0] : undefined,
        ngayketthuc: itinerary.ngayketthuc ? new Date(itinerary.ngayketthuc).toISOString().split('T')[0] : undefined,
        trangthai: 'planning',
        places: flatPlaces,
        dayConfigs,
      };

      let savedId: number | undefined;

      if (editId) {
        // Update existing
        const response = await apiClient.put(`/lichtrinh-nguoidung/${editId}`, saveData);
        const responseData = response?.data?.data ?? response?.data ?? response;
        savedId = responseData?.lichtrinh_nguoidung_id ?? responseData?.id ?? editId;
      } else {
        // Create new
        const response = await apiClient.post('/lichtrinh-nguoidung', saveData);
        const responseData = response?.data?.data ?? response?.data ?? response;
        savedId = responseData?.lichtrinh_nguoidung_id ?? responseData?.id;
      }

      if (savedId) {
        alert(editId ? 'Cập nhật lịch trình thành công! ✓' : 'Lưu kế hoạch thành công! ✓');
        router.push('/dashboard/my-trips');
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

  // Loading skeleton while fetching edit data
  if (loadingEdit) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <svg className="animate-spin w-10 h-10 text-indigo-600 mx-auto" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-slate-600 font-medium">Đang tải lịch trình…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {editId && <Pencil className="w-5 h-5 text-indigo-500" />}
              <h1 className="text-2xl font-bold text-slate-900">
                {editId ? 'Chỉnh sửa lịch trình' : 'Kế hoạch du lịch'}
              </h1>
            </div>

            {/* Step indicator */}
            <div className="hidden sm:flex items-center gap-2 ml-4">
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                step === 'timeline'
                  ? 'bg-indigo-100 text-indigo-700 ring-2 ring-indigo-300'
                  : 'bg-slate-100 text-slate-500'
              }`}>
                <span className="w-5 h-5 rounded-full bg-current text-white flex items-center justify-center text-[10px]">
                  <span className="text-white">1</span>
                </span>
                Lộ trình
              </div>
              <ArrowRight className="w-3 h-3 text-slate-300" />
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                step === 'details'
                  ? 'bg-indigo-100 text-indigo-700 ring-2 ring-indigo-300'
                  : 'bg-slate-100 text-slate-500'
              }`}>
                <span className="w-5 h-5 rounded-full bg-current text-white flex items-center justify-center text-[10px]">
                  <span className="text-white">2</span>
                </span>
                Ghi chú
              </div>
            </div>
          </div>

          {step === 'timeline' ? (
            <button
              onClick={handleGoToDetails}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl hover:shadow-lg hover:shadow-indigo-400/30 transition-all text-sm font-semibold"
            >
              Tiếp tục
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={handleBackToTimeline}
                className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-all text-sm font-semibold"
              >
                <ArrowLeft className="w-4 h-4" />
                Quay lại
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl hover:shadow-lg hover:shadow-indigo-400/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold"
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Đang lưu…
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    {editId ? 'Cập nhật' : 'Hoàn tất & Lưu'}
                  </>
                )}
              </button>
            </div>
          )}
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

      {/* Content */}
      {step === 'timeline' ? (
        <TimelineEditorWithMap />
      ) : (
        <PlanDetailEditor
          onBack={handleBackToTimeline}
          onFinish={handleSave}
          isSaving={isSaving}
        />
      )}
    </div>
  );
}
