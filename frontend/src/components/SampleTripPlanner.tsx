'use client';

import { useItinerary, useItineraryStats, PlanDetailEditor } from '@/features/itinerary';
import { useAuth } from '@/features/auth';
import { TimelineEditorWithMap } from './TimelineEditorWithMap';
import { Save, AlertCircle, ArrowRight, ArrowLeft, CheckCircle2, Pencil, Loader } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/shared/api/apiClient';
import type { PlaceItem, MultiDayItinerary, DayItinerary } from '@/features/itinerary';

// ----------------------------------------------------------------------------
// Map server response → MultiDayItinerary (cho lịch trình mẫu)
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

/** Convert DB Time value (Date object or "HH:mm:ss") → "HH:mm" string */
function parseDbTime(val: string | Date | null): string | undefined {
  if (!val) return undefined;
  if (val instanceof Date) {
    const h = String(val.getUTCHours()).padStart(2, '0');
    const m = String(val.getUTCMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  }
  return String(val).substring(0, 5);
}

function mapServerToItinerary(server: any): MultiDayItinerary {
  const serverPlaces: ServerPlace[] = server.lichtrinh_mau_diadiem ?? [];
  const serverDayConfigs: any[] = server.lichtrinh_mau_ngay ?? [];

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
      id: sp.id,
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
  const dayConfigMap = new Map<number, any>();
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
    id: server.lichtrinh_mau_id,
    tieude: server.tieude ?? '',
    mota: server.mota ?? '',
    so_ngay: maxDay,
    days,
    currentDay: 1,
    isDraft: false,
  };
}

// ----------------------------------------------------------------------------
// Component
// ----------------------------------------------------------------------------

interface SampleTripPlannerProps {
  editId?: number;
  /** true = Admin (không cần duyệt), false = Local (cần duyệt) */
  isAdmin?: boolean;
}

export function SampleTripPlanner({ editId, isAdmin = false }: SampleTripPlannerProps) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { itinerary, validateItineraryTitle, validateAllDaysHavePlaces, setIsLoading, loadItinerary, resetItinerary, updateItineraryTitle } = useItinerary();
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [step, setStep] = useState<'timeline' | 'details'>('timeline');
  const [loadingEdit, setLoadingEdit] = useState(!!editId);

  // Thêm fields đặc biệt cho lịch trình mẫu
  const [moTa, setMoTa] = useState('');
  const [chiPhiDuKien, setChiPhiDuKien] = useState('');

  // Handle component mount (Create vs Edit vs Returning from Place Selector)
  useEffect(() => {
    // Check if we just returned from the place selector
    const fromSelector = sessionStorage.getItem('fromPlaceSelector') === 'true';
    if (fromSelector) {
      // Delay removal to survive React StrictMode's double mount
      setTimeout(() => sessionStorage.removeItem('fromPlaceSelector'), 500);
      setLoadingEdit(false); // Make sure loading spinner hides
      return;
    }

    // Normal mount behavior
    if (!editId) {
      resetItinerary();
    } else {
      setLoadingEdit(true);
      apiClient.get(`/lichtrinh-mau/${editId}`)
        .then((res: any) => {
          // apiClient interceptor already unwraps TransformInterceptor — res IS the data
          const raw = res?.data?.data ?? res?.data ?? res;
          if (!raw || typeof raw !== 'object') {
            console.error('[SampleTripPlanner] Unexpected API response shape:', res);
            setSaveError('Không thể tải lịch trình mẫu.');
            return;
          }
          loadItinerary(mapServerToItinerary(raw));
          setMoTa(raw.mota || '');
          
          let parsedCost = '';
          if (raw.chi_phi_dukien !== null && raw.chi_phi_dukien !== undefined) {
             if (typeof raw.chi_phi_dukien === 'object' && raw.chi_phi_dukien.d && Array.isArray(raw.chi_phi_dukien.d)) {
               // Handle Prisma Decimal
               parsedCost = String(raw.chi_phi_dukien.d.join(''));
             } else {
               parsedCost = String(raw.chi_phi_dukien);
             }
          }
          setChiPhiDuKien(parsedCost);
        })
        .catch((err: any) => {
          console.error('[SampleTripPlanner] Load edit error:', err);
          setSaveError('Không thể tải lịch trình mẫu. Vui lòng thử lại.');
        })
        .finally(() => setLoadingEdit(false));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editId]);

  // Protect route - Only admin and local can access
  useEffect(() => {
    if (!isAuthLoading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (user?.vaitro !== 'admin' && user?.vaitro !== 'local') {
        alert('Bạn không có quyền truy cập vào trang này.');
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, isAuthLoading, user, router]);

  // Auto-calculate day stats when places change
  useItineraryStats();

  const handleGoToDetails = () => {
    const titleError = validateItineraryTitle();
    const daysError = validateAllDaysHavePlaces();
    if (titleError) { setSaveError(titleError); return; }
    if (daysError) { setSaveError(daysError); return; }
    setSaveError(null);
    setStep('details');
  };

  const handleBackToTimeline = () => setStep('timeline');

  // Xác định URL quay lại
  const backUrl = isAdmin ? '/dashboard/manage-sampletrips' : '/dashboard/locals-trips';

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

      // Không có ngaybatdau, ngayketthuc — thêm mota và chi_phi_dukien
      const saveData = {
        tieude: itinerary.tieude,
        mota: moTa || null,
        chi_phi_dukien: chiPhiDuKien ? parseFloat(chiPhiDuKien) : null,
        thoigian_dukien: `${itinerary.so_ngay} ngày`,
        places: flatPlaces,
        dayConfigs,
      };

      if (editId) {
        const endpoint = isAdmin ? `/lichtrinh-mau/admin/${editId}` : `/lichtrinh-mau/${editId}`;
        await apiClient.put(endpoint, saveData);
      } else {
        await apiClient.post('/lichtrinh-mau', saveData);
      }

      const successMsg = editId
        ? (isAdmin ? 'Cập nhật lịch trình mẫu thành công! ✓' : 'Đã gửi cập nhật, chờ Admin duyệt! ✓')
        : (isAdmin ? 'Tạo lịch trình mẫu thành công! ✓' : 'Đã gửi lịch trình mẫu, chờ Admin duyệt! ✓');

      alert(successMsg);
      router.push(backUrl);
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error?.message || 'Có lỗi khi lưu';
      console.error('Save error:', error);
      setSaveError(errorMsg);
      alert(`Lỗi: ${errorMsg}`);
    } finally {
      setIsSaving(false);
      setIsLoading(false);
    }
  };

  if (isAuthLoading || loadingEdit) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader className="w-10 h-10 text-indigo-600 animate-spin mx-auto" />
          <p className="text-slate-600 font-medium">
            {isAuthLoading ? 'Đang xác thực...' : 'Đang tải lịch trình mẫu...'}
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || (user?.vaitro !== 'admin' && user?.vaitro !== 'local')) {
    return null;
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
                {editId ? 'Chỉnh sửa lịch trình mẫu' : 'Tạo lịch trình mẫu'}
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
        <TimelineEditorWithMap hideDateField />
      ) : (
        <>
          {/* Panel Mô tả + Chi phí — hiển thị ở bước Ghi chú */}
          <div className="bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-100">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Save className="w-5 h-5 text-indigo-500" />
                  Thông tin lịch trình mẫu
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Mô tả chuyến đi */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Mô tả chuyến đi
                    </label>
                    <textarea
                      value={moTa}
                      onChange={(e) => setMoTa(e.target.value)}
                      placeholder="Chia sẻ trải nghiệm, lưu ý cho người tham gia..."
                      rows={3}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 outline-none transition-all resize-none"
                    />
                  </div>
                  {/* Chi phí dự kiến */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Chi phí dự kiến (VNĐ)
                    </label>
                    <input
                      type="number"
                      value={chiPhiDuKien}
                      onChange={(e) => setChiPhiDuKien(e.target.value)}
                      placeholder="VD: 5000000"
                      min={0}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <PlanDetailEditor
            onBack={handleBackToTimeline}
            onFinish={handleSave}
            isSaving={isSaving}
          />
        </>
      )}
    </div>
  );
}
