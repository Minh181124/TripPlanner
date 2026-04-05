'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, userService, itineraryAdminService } from '@/features/auth';
import type { UserProfile, Itinerary, ItineraryMau } from '@/features/auth';
import {
  Users, Loader, AlertCircle, MapPin, Calendar,
  ChevronRight, X, Eye, Clock, Route, Star,
  UserCheck, ArrowLeft,
} from 'lucide-react';
import { RouteMap } from '@/components/RouteMap';

/**
 * Admin Locals Management Page
 * Hiển thị danh sách Local Guides, click vào xem tour + đánh giá
 */
export default function AdminLocalsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [locals, setLocals] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Selected local panel
  const [selectedLocal, setSelectedLocal] = useState<UserProfile | null>(null);
  const [localTours, setLocalTours] = useState<ItineraryMau[]>([]);
  const [localItineraries, setLocalItineraries] = useState<Itinerary[]>([]);
  const [loadingTours, setLoadingTours] = useState(false);

  // Detail modal
  const [detailItem, setDetailItem] = useState<Itinerary | ItineraryMau | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    if (!authLoading && user?.vaitro !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user?.vaitro === 'admin') {
      loadLocals();
    }
  }, [user]);

  const loadLocals = async () => {
    try {
      setIsLoading(true);
      const data = await userService.getLocalUsers();
      setLocals(data);
    } catch (err: any) {
      setError('Lỗi tải danh sách Local Guides');
    } finally {
      setIsLoading(false);
    }
  };

  const selectLocal = async (local: UserProfile) => {
    setSelectedLocal(local);
    setLoadingTours(true);
    try {
      // Load both template tours and personal itineraries
      const [toursRes, itinRes] = await Promise.all([
        itineraryAdminService.getTemplateTours(),
        itineraryAdminService.getItinerariesByUser(local.nguoidung_id),
      ]);
      // Filter template tours by this local's ID
      const filtered = (toursRes?.data || toursRes || []) as ItineraryMau[];
      setLocalTours(Array.isArray(filtered) ? filtered.filter(t => t.nguoidung_id === local.nguoidung_id) : []);
      setLocalItineraries(itinRes?.itineraries || []);
    } catch (err: any) {
      console.error('Error loading tours:', err);
      setLocalTours([]);
      setLocalItineraries([]);
    } finally {
      setLoadingTours(false);
    }
  };

  const viewItineraryDetail = async (id: number) => {
    setLoadingDetail(true);
    setShowDetailModal(true);
    try {
      const detail = await itineraryAdminService.getItineraryDetail(id);
      setDetailItem(detail);
    } catch (err: any) {
      console.error('Error loading detail:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const viewTourDetail = (tour: ItineraryMau) => {
    setDetailItem(tour);
    setShowDetailModal(true);
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (user?.vaitro !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-slate-700">Bạn không có quyền truy cập trang này</p>
        </div>
      </div>
    );
  }

  // Pre-calculate data for RouteMap
  const mapData = (() => {
    if (!detailItem) return { places: [], routes: [] };

    const rawPlaces = 'lichtrinh_nguoidung_diadiem' in detailItem
      ? detailItem.lichtrinh_nguoidung_diadiem
      : 'lichtrinh_mau_diadiem' in detailItem
        ? (detailItem as ItineraryMau).lichtrinh_mau_diadiem
        : [];

    const formattedPlaces = rawPlaces
      .filter(p => p.diadiem?.lat && p.diadiem?.lng)
      .map((p, idx) => ({
        id: p.id || idx,
        ten: p.diadiem.ten,
        lat: p.diadiem.lat!,
        lng: p.diadiem.lng!,
        order: p.thutu || (idx + 1),
      }));

    const formattedRoutes = (detailItem.tuyen_duong || []).map(r => ({
      polyline: r.polyline || '',
      phuongtien: r.phuongtien,
    }));

    return { places: formattedPlaces, routes: formattedRoutes };
  })();

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <UserCheck className="w-8 h-8 text-indigo-600" />
          Quản lý Local Guides
        </h1>
        <p className="text-slate-600 mt-2">
          Xem danh sách hướng dẫn địa phương, tour và lịch trình của họ
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="flex gap-6">
        {/* Local List */}
        <div className={`${selectedLocal ? 'w-1/3' : 'w-full'} transition-all duration-300`}>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
              <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                Danh sách Local ({locals.length})
              </h2>
            </div>

            {isLoading ? (
              <div className="p-8 text-center">
                <Loader className="w-6 h-6 text-indigo-600 animate-spin mx-auto" />
              </div>
            ) : locals.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                Chưa có Local Guide nào
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {locals.map((local) => (
                  <button
                    key={local.nguoidung_id}
                    onClick={() => selectLocal(local)}
                    className={`w-full flex items-center gap-4 p-4 text-left hover:bg-indigo-50 transition-colors ${
                      selectedLocal?.nguoidung_id === local.nguoidung_id
                        ? 'bg-indigo-50 border-l-4 border-indigo-600'
                        : ''
                    }`}
                  >
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
                      {(local.ten || 'L').charAt(0).toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 truncate">
                        {local.ten || 'Chưa đặt tên'}
                      </p>
                      <p className="text-sm text-slate-500 truncate">{local.email}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                          local.trangthai === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {local.trangthai === 'active' ? 'Hoạt động' : 'Tạm ngưng'}
                        </span>
                        {local.ngaytao && (
                          <span className="text-xs text-slate-400">
                            Tham gia {new Date(local.ngaytao).toLocaleDateString('vi-VN')}
                          </span>
                        )}
                      </div>
                    </div>

                    <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Selected Local Panel */}
        {selectedLocal && (
          <div className="w-2/3 space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl">
                    {(selectedLocal.ten || 'L').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      {selectedLocal.ten || 'Chưa đặt tên'}
                    </h2>
                    <p className="text-slate-500">{selectedLocal.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                        Local Guide
                      </span>
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                        selectedLocal.trangthai === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {selectedLocal.trangthai === 'active' ? 'Hoạt động' : 'Tạm ngưng'}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedLocal(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="bg-indigo-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-indigo-700">{localTours.length}</p>
                  <p className="text-xs text-indigo-600">Tour mẫu</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-green-700">{localItineraries.length}</p>
                  <p className="text-xs text-green-600">Lịch trình</p>
                </div>
                <div className="bg-amber-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-amber-700">
                    {selectedLocal.ngaytao ? new Date(selectedLocal.ngaytao).toLocaleDateString('vi-VN') : 'N/A'}
                  </p>
                  <p className="text-xs text-amber-600">Ngày tham gia</p>
                </div>
              </div>
            </div>

            {loadingTours ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <Loader className="w-6 h-6 text-indigo-600 animate-spin mx-auto" />
                <p className="text-sm text-slate-500 mt-2">Đang tải...</p>
              </div>
            ) : (
              <>
                {/* Template Tours */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                    <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                      <Route className="w-5 h-5 text-indigo-600" />
                      Tour mẫu ({localTours.length})
                    </h3>
                  </div>
                  {localTours.length === 0 ? (
                    <div className="p-6 text-center text-slate-500 text-sm">
                      Local này chưa tạo tour mẫu nào
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {localTours.map((tour) => (
                        <div
                          key={tour.lichtrinh_mau_id}
                          className="p-4 hover:bg-slate-50 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-slate-900">{tour.tieude}</h4>
                              {tour.mota && (
                                <p className="text-sm text-slate-500 mt-1 line-clamp-2">{tour.mota}</p>
                              )}
                              <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3.5 h-3.5" />
                                  {tour.lichtrinh_mau_diadiem?.length || 0} địa điểm
                                </span>
                                {tour.thoigian_dukien && (
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5" />
                                    {tour.thoigian_dukien}
                                  </span>
                                )}
                                {tour.luotthich != null && (
                                  <span className="flex items-center gap-1">
                                    <Star className="w-3.5 h-3.5" />
                                    {tour.luotthich} lượt thích
                                  </span>
                                )}
                                {tour.ngaytao && (
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3.5 h-3.5" />
                                    {new Date(tour.ngaytao).toLocaleDateString('vi-VN')}
                                  </span>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={() => viewTourDetail(tour)}
                              className="ml-4 flex items-center gap-1.5 px-3 py-1.5 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                              Chi tiết
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Personal Itineraries */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                    <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-green-600" />
                      Lịch trình cá nhân ({localItineraries.length})
                    </h3>
                  </div>
                  {localItineraries.length === 0 ? (
                    <div className="p-6 text-center text-slate-500 text-sm">
                      Local này chưa có lịch trình cá nhân nào
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {localItineraries.map((itin) => (
                        <div
                          key={itin.lichtrinh_nguoidung_id}
                          className="p-4 hover:bg-slate-50 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-slate-900">{itin.tieude}</h4>
                              <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3.5 h-3.5" />
                                  {itin.lichtrinh_nguoidung_diadiem?.length || 0} địa điểm
                                </span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                  itin.trangthai === 'completed' ? 'bg-green-100 text-green-700' :
                                  itin.trangthai === 'active' ? 'bg-blue-100 text-blue-700' :
                                  'bg-gray-100 text-gray-700'
                                }`}>
                                  {itin.trangthai || 'planning'}
                                </span>
                                {itin.ngaybatdau && (
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3.5 h-3.5" />
                                    {new Date(itin.ngaybatdau).toLocaleDateString('vi-VN')}
                                  </span>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={() => viewItineraryDetail(itin.lichtrinh_nguoidung_id)}
                              className="ml-4 flex items-center gap-1.5 px-3 py-1.5 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                              Chi tiết
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Route className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold truncate">
                  {detailItem && 'tieude' in detailItem ? detailItem.tieude : 'Chi tiết lịch trình'}
                </h2>
              </div>
              <button
                onClick={() => { setShowDetailModal(false); setDetailItem(null); }}
                className="p-2 hover:bg-white/20 rounded-xl transition-all hover:rotate-90"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body - Split Screen */}
            <div className="flex flex-1 min-h-0">
              {loadingDetail ? (
                <div className="flex-1 py-20 text-center">
                  <Loader className="w-10 h-10 text-indigo-600 animate-spin mx-auto" />
                  <p className="text-slate-500 mt-4 font-medium italic">Đang tải dữ liệu chi tiết...</p>
                </div>
              ) : detailItem ? (
                <div className="flex w-full overflow-hidden">
                  {/* Left: Map */}
                  <div className="w-3/5 border-r border-slate-100 bg-slate-50 relative">
                    <RouteMap 
                      places={mapData.places} 
                      routes={mapData.routes}
                      height="100%" 
                    />
                  </div>

                  {/* Right: Info Scrollable */}
                  <div className="w-2/5 overflow-y-auto p-6 bg-white">
                    <div className="space-y-8">
                      {/* Detailed Info Grid */}
                      <section>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Thông tin chung</h3>
                        <div className="grid grid-cols-2 gap-4">
                          {'ngaybatdau' in detailItem && detailItem.ngaybatdau && (
                            <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-3">
                              <p className="text-[10px] font-bold text-indigo-400 uppercase mb-1">Bắt đầu</p>
                              <p className="text-sm font-bold text-slate-800">
                                {new Date(detailItem.ngaybatdau).toLocaleDateString('vi-VN')}
                              </p>
                            </div>
                          )}
                          {'ngayketthuc' in detailItem && detailItem.ngayketthuc && (
                            <div className="bg-purple-50/50 border border-purple-100 rounded-xl p-3">
                              <p className="text-[10px] font-bold text-purple-400 uppercase mb-1">Kết thúc</p>
                              <p className="text-sm font-bold text-slate-800">
                                {new Date(detailItem.ngayketthuc).toLocaleDateString('vi-VN')}
                              </p>
                            </div>
                          )}
                          {'trangthai' in detailItem && (
                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Trạng thái</p>
                              <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                (detailItem as any).trangthai === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'
                              }`}>
                                {(detailItem as any).trangthai || 'planning'}
                              </span>
                            </div>
                          )}
                          {detailItem.ngaytao && (
                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Ngày tạo</p>
                              <p className="text-sm font-bold text-slate-800">
                                {new Date(detailItem.ngaytao).toLocaleDateString('vi-VN')}
                              </p>
                            </div>
                          )}
                        </div>
                        {'mota' in detailItem && detailItem.mota && (
                          <div className="mt-4 p-4 bg-slate-50 border border-slate-100 rounded-xl">
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Mô tả</p>
                            <p className="text-sm text-slate-600 leading-relaxed italic">"{detailItem.mota}"</p>
                          </div>
                        )}
                      </section>

                      {/* Places List */}
                      <section>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Danh sách địa điểm</h3>
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-full">
                            {mapData.places.length} điểm
                          </span>
                        </div>
                        
                        <div className="space-y-4">
                          {mapData.places.length === 0 ? (
                            <p className="text-sm text-slate-400 italic py-4 text-center">Không có địa điểm nào</p>
                          ) : (
                            (() => {
                              const places = 'lichtrinh_nguoidung_diadiem' in detailItem
                                ? detailItem.lichtrinh_nguoidung_diadiem
                                : 'lichtrinh_mau_diadiem' in detailItem
                                  ? (detailItem as ItineraryMau).lichtrinh_mau_diadiem
                                  : [];

                              return places.map((place: any, idx: number) => (
                                <div key={place.id || idx} className="group relative pl-10">
                                  {/* Order connector line */}
                                  {idx !== places.length - 1 && (
                                    <div className="absolute left-[15px] top-8 bottom-[-16px] w-[2px] bg-indigo-50 group-hover:bg-indigo-100 transition-colors"></div>
                                  )}
                                  
                                  {/* Number Circle */}
                                  <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center text-sm font-bold group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all shadow-sm">
                                    {place.thutu || idx + 1}
                                  </div>

                                  <div className="p-3 rounded-xl border border-transparent hover:border-slate-100 hover:bg-slate-50 transition-all">
                                    <p className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                                      {place.diadiem?.ten || 'Địa điểm không xác định'}
                                    </p>
                                    <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                                      <MapPin className="w-3 h-3" />
                                      {place.diadiem?.diachi || 'Không có địa chỉ'}
                                    </p>
                                    <div className="flex items-center gap-2 mt-2">
                                      {place.ngay_thu_may && (
                                        <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded">
                                          Ngày {place.ngay_thu_may}
                                        </span>
                                      )}
                                      {place.thoiluong && (
                                        <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                                          <Clock className="w-3 h-3" />
                                          {place.thoiluong} phút
                                        </span>
                                      )}
                                    </div>
                                    {place.ghichu && (
                                      <p className="mt-2 text-xs text-slate-500 italic bg-amber-50/50 p-2 rounded-lg border border-amber-100/50">
                                        {place.ghichu}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              ));
                            })()
                          )}
                        </div>
                      </section>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 py-20 text-center">
                  <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">Không tìm thấy dữ liệu chi tiết</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 shrink-0">
              <button
                onClick={() => { setShowDetailModal(false); setDetailItem(null); }}
                className="px-6 py-2 bg-white border border-slate-200 text-slate-700 font-bold text-sm rounded-xl hover:bg-slate-50 hover:shadow-sm transition-all"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
