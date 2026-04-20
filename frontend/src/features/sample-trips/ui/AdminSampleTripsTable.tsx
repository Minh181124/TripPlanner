'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSampleTrips } from '../hooks/useSampleTrips';
import { useSampleTripActions } from '../hooks/useSampleTripActions';
import { Check, X, Search, MapPin, Edit2, Trash2, Plus, Eye } from 'lucide-react';
import type { SampleTrip, SampleTripStatus } from '../model/sampleTrips.types';

/**
 * Admin Sample Trips Table — Quản lý toàn diện lịch trình mẫu
 * Tạo/Sửa chuyển hướng sang trang planner đầy đủ (giống lịch trình người dùng)
 */
export function AdminSampleTripsTable() {
  const router = useRouter();
  const { trips, loading, error, page, totalPages, total, setPage, status, setStatus, refresh } = useSampleTrips({
    initialLimit: 10,
    statusFilter: 'PENDING',
  });

  const { approveTrip, rejectTrip, deleteTrip } = useSampleTripActions();
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const handleApprove = async (id: number) => {
    if (confirm('Xác nhận duyệt lịch trình mẫu này?')) {
      await approveTrip(id, () => refresh());
    }
  };

  const handleReject = async (id: number) => {
    if (confirm('Xác nhận từ chối lịch trình mẫu này?')) {
      await rejectTrip(id, () => refresh());
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Xác nhận xóa vĩnh viễn lịch trình mẫu này?')) {
      await deleteTrip(id, true, () => refresh());
    }
  };

  const handleEdit = (trip: SampleTrip) => {
    router.push(`/dashboard/manage-sampletrips/edit/${trip.lichtrinh_mau_id}`);
  };

  const handleCreateNew = () => {
    router.push('/dashboard/manage-sampletrips/create');
  };

  const formatCurrency = (value: number | null) => {
    if (!value) return '—';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const statusLabel: Record<string, { text: string; class: string }> = {
    PENDING: { text: 'Chờ duyệt', class: 'bg-yellow-100 text-yellow-700' },
    APPROVED: { text: 'Đã duyệt', class: 'bg-green-100 text-green-700' },
    REJECTED: { text: 'Từ chối', class: 'bg-red-100 text-red-700' },
    PENDING_DELETE: { text: 'Yêu cầu xóa', class: 'bg-slate-100 text-slate-700' },
  };

  const getPageNumbers = () => {
    const pages = [];
    for (let i = Math.max(1, page - 2); i <= Math.min(totalPages, page + 2); i++) {
      pages.push(i);
    }
    return pages;
  };

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-200">
        <p className="font-medium text-center">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Quản lý Lịch Trình Mẫu</h2>
          <p className="text-sm text-slate-500">
            Duyệt, chỉnh sửa và quản lý tất cả lịch trình mẫu trong hệ thống.
            {total > 0 && <span className="font-semibold ml-1">({total} bản ghi)</span>}
          </p>
        </div>

        <button
          onClick={handleCreateNew}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Tạo mới
        </button>
      </div>

      {/* Status Tabs */}
      <div className="px-6 pt-4">
        <div className="flex bg-slate-100 p-1 font-medium rounded-lg w-fit">
          {(['PENDING', 'APPROVED', 'REJECTED', 'PENDING_DELETE'] as SampleTripStatus[]).map((s) => (
            <button
              key={s}
              onClick={() => { setStatus(s); setPage(1); }}
              className={`px-4 py-1.5 rounded-md text-sm transition-colors ${
                status === s
                  ? `bg-white shadow ${statusLabel[s].class}`
                  : 'text-slate-600'
              }`}
            >
              {statusLabel[s].text}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto min-h-[400px]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-600 text-sm border-b border-slate-200 uppercase tracking-wider">
              <th className="px-6 py-4 font-semibold">Tiêu Đề</th>
              <th className="px-6 py-4 font-semibold">Mô Tả</th>
              <th className="px-6 py-4 font-semibold">Chi Phí</th>
              <th className="px-6 py-4 font-semibold">Thời Gian</th>
              <th className="px-6 py-4 font-semibold">Người Tạo</th>
              <th className="px-6 py-4 font-semibold text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-3" />
                    Đang tải dữ liệu...
                  </div>
                </td>
              </tr>
            ) : trips.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                  <div className="bg-slate-50 inline-flex p-4 rounded-full mb-3">
                    <Search className="w-6 h-6 text-slate-400" />
                  </div>
                  <p>Không có lịch trình mẫu nào trong danh sách.</p>
                </td>
              </tr>
            ) : (
              trips.map((trip) => (
                <React.Fragment key={trip.lichtrinh_mau_id}>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-800">{trip.tieude}</div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {trip.lichtrinh_mau_diadiem?.length || 0} địa điểm
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-600 max-w-[200px] truncate" title={trip.mota || ''}>
                        {trip.mota || '—'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-700">
                      {formatCurrency(trip.chi_phi_dukien)}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {trip.thoigian_dukien || '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {trip.nguoidung?.ten || `User #${trip.nguoidung_id}`}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setExpandedId(expandedId === trip.lichtrinh_mau_id ? null : trip.lichtrinh_mau_id)}
                          className="p-1.5 bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye size={16} />
                        </button>

                        {(trip.trang_thai === 'PENDING' || trip.trang_thai === 'PENDING_DELETE') && (
                          <>
                            <button
                              onClick={() => handleApprove(trip.lichtrinh_mau_id)}
                              className="p-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-md transition-colors"
                              title="Duyệt"
                            >
                              <Check size={16} strokeWidth={2.5} />
                            </button>
                            <button
                              onClick={() => handleReject(trip.lichtrinh_mau_id)}
                              className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-md transition-colors"
                              title="Từ chối"
                            >
                              <X size={16} strokeWidth={2.5} />
                            </button>
                          </>
                        )}

                        <button
                          onClick={() => handleEdit(trip)}
                          className="p-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-md transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit2 size={16} />
                        </button>

                        <button
                          onClick={() => handleDelete(trip.lichtrinh_mau_id)}
                          className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-md transition-colors"
                          title="Xóa vĩnh viễn"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {expandedId === trip.lichtrinh_mau_id && (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 bg-slate-50">
                        <div className="text-sm font-semibold text-slate-700 mb-2">Danh sách địa điểm:</div>
                        {trip.lichtrinh_mau_diadiem && trip.lichtrinh_mau_diadiem.length > 0 ? (
                          <div className="space-y-1.5">
                            {trip.lichtrinh_mau_diadiem.map((p, i) => (
                              <div key={p.id} className="flex items-center gap-2 text-sm">
                                <span className="w-5 h-5 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-bold">
                                  {i + 1}
                                </span>
                                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                <span className="font-medium">{p.diadiem?.ten}</span>
                                <span className="text-slate-400">— Ngày {p.ngay_thu_may}</span>
                                {p.thoiluong && <span className="text-slate-400">({p.thoiluong} phút)</span>}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-slate-400 text-sm">Không có địa điểm</p>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && trips.length > 0 && totalPages > 1 && (
        <div className="p-4 border-t border-slate-200 flex items-center justify-between">
          <span className="text-sm text-slate-500">
            Trang <span className="font-semibold">{page}</span> / {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-md disabled:opacity-50 hover:bg-slate-50"
            >
              Trước
            </button>
            {getPageNumbers().map((num) => (
              <button
                key={num}
                onClick={() => setPage(num)}
                className={`w-8 h-8 flex items-center justify-center text-sm rounded-md transition-colors ${
                  page === num ? 'bg-indigo-600 text-white font-medium shadow-sm' : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                {num}
              </button>
            ))}
            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-md disabled:opacity-50 hover:bg-slate-50"
            >
              Sau
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
