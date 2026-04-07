'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Plus,
  MapPin,
  Calendar,
  Clock,
  Trash2,
  Eye,
  Map,
  Sparkles,
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Plane,
  Route,
} from 'lucide-react';
import { useAuth } from '@/features/auth';
import apiClient from '@/shared/api/apiClient';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ItineraryPlace {
  id: number;
  thutu: number;
  ngay_thu_may: number;
  ghichu: string | null;
  thoiluong: number | null;
  diadiem?: {
    diadiem_id: number;
    ten: string;
    diachi: string | null;
    lat: number | null;
    lng: number | null;
    hinhanh_diadiem?: { url?: string | null }[];
  } | null;
}

interface Itinerary {
  lichtrinh_nguoidung_id: number;
  tieude: string;
  ngaybatdau: string | null;
  ngayketthuc: string | null;
  trangthai: string | null;
  ngaytao: string | null;
  lichtrinh_nguoidung_diadiem?: ItineraryPlace[];
}

type SortField = 'ngaytao' | 'tieude';
type SortDir = 'asc' | 'desc';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—';
  try {
    return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

function statusConfig(status: string | null) {
  switch (status) {
    case 'completed':
      return { label: 'Đã hoàn thành', bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' };
    case 'in_progress':
      return { label: 'Đang đi', bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' };
    case 'planning':
    default:
      return { label: 'Đang lên kế hoạch', bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' };
  }
}

// ---------------------------------------------------------------------------
// Static Map
// ---------------------------------------------------------------------------

const GOONG_MAP_KEY = process.env.NEXT_PUBLIC_GOONG_MAP_KEY ?? '';

function buildStaticMapUrl(itinerary: Itinerary): string {
  const places = (itinerary.lichtrinh_nguoidung_diadiem ?? [])
    .filter((p) => p.diadiem?.lat && p.diadiem?.lng)
    .sort((a, b) => a.thutu - b.thutu);

  if (places.length === 0) return '';

  if (places.length === 1) {
    const p = places[0].diadiem!;
    return `https://rsapi.goong.io/staticmap/pinmarker?markers=${p.lat},${p.lng}&width=400&height=220&api_key=${GOONG_MAP_KEY}`;
  }

  const origin = places[0].diadiem!;
  const dest = places[places.length - 1].diadiem!;
  const waypoints = places.slice(1, -1).map((p) => `${p.diadiem!.lat},${p.diadiem!.lng}`).join('|');
  const waypointParam = waypoints ? `&waypoints=${waypoints}` : '';

  return `https://rsapi.goong.io/staticmap/route?origin=${origin.lat},${origin.lng}&destination=${dest.lat},${dest.lng}${waypointParam}&width=400&height=220&vehicle=car&api_key=${GOONG_MAP_KEY}`;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function MyTripsPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Filters & sort
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('ngaytao');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 9;

  // Fetch
  const fetchItineraries = useCallback(async () => {
    if (!user?.nguoidung_id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get(`/lichtrinh-nguoidung/user/${user.nguoidung_id}`, {
        params: { page, limit },
      });
      const data = res?.data?.data ?? res?.data ?? res;
      setItineraries(data.itineraries ?? []);
      setTotalPages(data.pagination?.pages ?? 1);
    } catch (err: any) {
      console.error('[MyTrips] Fetch error:', err);
      setError(err?.response?.data?.message || 'Không thể tải danh sách lịch trình');
    } finally {
      setLoading(false);
    }
  }, [user?.nguoidung_id, page]);

  useEffect(() => { fetchItineraries(); }, [fetchItineraries]);

  // Delete
  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa lịch trình này?')) return;
    setDeletingId(id);
    try {
      await apiClient.delete(`/lichtrinh-nguoidung/${id}`);
      setItineraries((prev) => prev.filter((it) => it.lichtrinh_nguoidung_id !== id));
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Lỗi khi xóa');
    } finally {
      setDeletingId(null);
    }
  };

  // Client-side filter & sort
  const filtered = itineraries
    .filter((it) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        it.tieude.toLowerCase().includes(q) ||
        it.lichtrinh_nguoidung_diadiem?.some((p) => p.diadiem?.ten.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      if (sortField === 'tieude') return dir * a.tieude.localeCompare(b.tieude);
      const da = new Date(a.ngaytao || 0).getTime();
      const db = new Date(b.ngaytao || 0).getTime();
      return dir * (da - db);
    });

  // Stats
  const totalTrips = itineraries.length;
  const planningCount = itineraries.filter((it) => it.trangthai === 'planning').length;
  const completedCount = itineraries.filter((it) => it.trangthai === 'completed').length;

  return (
    <div className="space-y-6">

      {/* ── Hero Header ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 rounded-2xl p-8 text-white shadow-xl">
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-40 h-40 rounded-full bg-amber-400/10 blur-2xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-amber-300" />
              <span className="text-xs font-semibold tracking-widest text-indigo-200 uppercase">Chuyến đi của tôi</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Quản lý lịch trình</h1>
            <p className="mt-1 text-indigo-200 text-sm">Tạo, xem và quản lý tất cả chuyến đi của bạn.</p>
          </div>

          <Link
            href="/dashboard/planner"
            className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl bg-white text-indigo-700 font-bold text-sm shadow-lg shadow-black/10 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Plus className="w-5 h-5" />
            Tạo lịch trình mới
          </Link>
        </div>

        {/* Quick stats */}
        <div className="relative mt-6 flex flex-wrap gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm">
            <Route className="w-4 h-4 text-amber-300" />
            <span className="text-sm font-semibold">{totalTrips} lịch trình</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm">
            <Clock className="w-4 h-4 text-sky-300" />
            <span className="text-sm font-semibold">{planningCount} đang lên kế hoạch</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm">
            <Plane className="w-4 h-4 text-emerald-300" />
            <span className="text-sm font-semibold">{completedCount} hoàn thành</span>
          </div>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        {/* Search */}
        <div className="relative flex-1 w-full sm:max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm lịch trình..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm border-2 border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all"
          />
        </div>

        {/* Sort */}
        <div className="flex gap-2">
          <button
            onClick={() => setSortField(sortField === 'ngaytao' ? 'tieude' : 'ngaytao')}
            className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-2 border-slate-200 rounded-xl bg-white hover:bg-slate-50 transition-colors"
          >
            <Filter className="w-4 h-4 text-slate-500" />
            {sortField === 'ngaytao' ? 'Ngày tạo' : 'Tên'}
          </button>
          <button
            onClick={() => setSortDir(sortDir === 'desc' ? 'asc' : 'desc')}
            className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-2 border-slate-200 rounded-xl bg-white hover:bg-slate-50 transition-colors"
          >
            <ArrowUpDown className="w-4 h-4 text-slate-500" />
            {sortDir === 'desc' ? 'Mới nhất' : 'Cũ nhất'}
          </button>
        </div>
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden animate-pulse">
              <div className="h-40 bg-slate-200" />
              <div className="p-5 space-y-3">
                <div className="h-5 bg-slate-200 rounded w-3/4" />
                <div className="h-4 bg-slate-200 rounded w-1/2" />
                <div className="h-4 bg-slate-200 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <MapPin className="w-8 h-8 text-red-400" />
          </div>
          <p className="text-lg font-semibold text-slate-700">{error}</p>
          <button onClick={fetchItineraries} className="mt-4 px-5 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors">
            Thử lại
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center mb-5">
            <Map className="w-10 h-10 text-indigo-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">
            {searchQuery ? 'Không tìm thấy lịch trình' : 'Chưa có lịch trình nào'}
          </h2>
          <p className="text-slate-500 mt-2 max-w-sm">
            {searchQuery ? 'Thử từ khóa khác hoặc xóa bộ lọc.' : 'Bắt đầu tạo chuyến đi đầu tiên để khám phá những điều tuyệt vời!'}
          </p>
          {!searchQuery && (
            <Link
              href="/dashboard/planner"
              className="mt-5 inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
            >
              <Plus className="w-4 h-4" />
              Tạo lịch trình đầu tiên
            </Link>
          )}
        </div>
      ) : (
        <>
          {/* Card grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((it) => {
              const places = it.lichtrinh_nguoidung_diadiem ?? [];
              const placeCount = places.length;
              const dayCount = new Set(places.map((p) => p.ngay_thu_may)).size || 1;
              const status = statusConfig(it.trangthai);
              const staticMapUrl = buildStaticMapUrl(it);
              const isDeleting = deletingId === it.lichtrinh_nguoidung_id;

              return (
                <div
                  key={it.lichtrinh_nguoidung_id}
                  className="group bg-white rounded-2xl border-2 border-slate-100 overflow-hidden hover:shadow-xl hover:border-indigo-200 transition-all duration-300"
                >
                  {/* Static Route Map / Placeholder */}
                  <div className="relative h-44 overflow-hidden bg-gradient-to-br from-indigo-100 via-violet-50 to-purple-100">
                    {staticMapUrl ? (
                      <img
                        src={staticMapUrl}
                        alt={`Bản đồ: ${it.tieude}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Map className="w-14 h-14 text-indigo-300" />
                      </div>
                    )}
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

                    {/* Status badge */}
                    <div className={`absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${status.bg} ${status.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                      {status.label}
                    </div>

                    {/* Quick actions overlay */}
                    <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleDelete(it.lichtrinh_nguoidung_id)}
                        disabled={isDeleting}
                        className="w-8 h-8 rounded-full bg-red-500/80 backdrop-blur-sm text-white flex items-center justify-center hover:bg-red-600 transition-colors disabled:opacity-50"
                        title="Xóa"
                      >
                        {isDeleting ? (
                          <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    {/* Day count */}
                    <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-black/40 backdrop-blur-sm text-white text-xs font-bold">
                      {dayCount} ngày
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-5">
                    <h3 className="text-base font-bold text-slate-800 truncate mb-2 group-hover:text-indigo-700 transition-colors">
                      {it.tieude}
                    </h3>

                    {/* Info row */}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(it.ngaytao)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {placeCount} địa điểm
                      </span>
                    </div>

                    {/* Date range */}
                    {it.ngaybatdau && (
                      <div className="text-xs text-slate-500 mb-3 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-indigo-400" />
                        {formatDate(it.ngaybatdau)}
                        {it.ngayketthuc && ` → ${formatDate(it.ngayketthuc)}`}
                      </div>
                    )}

                    {/* Place list preview */}
                    {places.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {places.slice(0, 3).map((p) => (
                          <span key={p.id} className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-medium truncate max-w-[120px]">
                            {p.diadiem?.ten || 'Địa điểm'}
                          </span>
                        ))}
                        {places.length > 3 && (
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[11px] font-medium">
                            +{places.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Edit button */}
                    <button
                      onClick={() => router.push(`/dashboard/planner?id=${it.lichtrinh_nguoidung_id}`)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-50 text-indigo-700 text-sm font-semibold hover:bg-indigo-100 transition-all hover:shadow-sm"
                    >
                      <Eye className="w-4 h-4" />
                      Xem & Chỉnh sửa
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border-2 border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Trước
              </button>
              <span className="text-sm font-semibold text-slate-600">
                Trang {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border-2 border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Sau
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
