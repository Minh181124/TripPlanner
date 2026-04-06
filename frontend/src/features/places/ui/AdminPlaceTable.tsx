'use client';

import React from 'react';
import { usePlaces } from '../hooks/usePlaces';
import { usePlaceActions } from '../hooks/usePlaceActions';
import { Check, X, MapPin, Search } from 'lucide-react';
import type { Place } from '../model/places.types';

export function AdminPlaceTable() {
  const { places, loading, error, page, totalPages, setPage, setStatus, status, refresh } = usePlaces({ 
    initialLimit: 10,
    statusFilter: 'PENDING'
  });
  
  const { approvePlace, rejectPlace } = usePlaceActions();

  const handleApprove = async (id: number) => {
    if (confirm('Xác nhận duyệt địa điểm này?')) {
      await approvePlace(id, () => refresh());
    }
  };

  const handleReject = async (id: number) => {
    if (confirm('Xác nhận từ chối địa điểm này?')) {
      await rejectPlace(id, () => refresh());
    }
  };

  // Pagination UI generator
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
      <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Kiểm Duyệt Địa Điểm</h2>
          <p className="text-sm text-slate-500">Quản lý và phê duyệt các địa điểm do người dùng đóng góp.</p>
        </div>
        
        <div className="flex bg-slate-100 p-1 font-medium rounded-lg">
          <button 
            onClick={() => setStatus('PENDING')}
            className={`px-4 py-1.5 rounded-md text-sm transition-colors ${status === 'PENDING' ? 'bg-white shadow text-indigo-600' : 'text-slate-600'}`}
          >
            Chờ duyệt
          </button>
          <button 
            onClick={() => setStatus('APPROVED')}
            className={`px-4 py-1.5 rounded-md text-sm transition-colors ${status === 'APPROVED' ? 'bg-white shadow text-green-600' : 'text-slate-600'}`}
          >
            Đã duyệt
          </button>
          <button 
            onClick={() => setStatus('REJECTED')}
            className={`px-4 py-1.5 rounded-md text-sm transition-colors ${status === 'REJECTED' ? 'bg-white shadow text-red-600' : 'text-slate-600'}`}
          >
            Từ chối
          </button>
          <button 
            onClick={() => setStatus('PENDING_DELETE')}
            className={`px-4 py-1.5 rounded-md text-sm transition-colors ${status === 'PENDING_DELETE' ? 'bg-white shadow text-slate-700' : 'text-slate-600'}`}
          >
            Yêu cầu xóa
          </button>
        </div>
      </div>

      <div className="overflow-x-auto min-h-[400px]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-600 text-sm border-b border-slate-200 uppercase tracking-wider">
              <th className="px-6 py-4 font-semibold">Tên Địa Điểm</th>
              <th className="px-6 py-4 font-semibold">Loại</th>
              <th className="px-6 py-4 font-semibold">Địa Chỉ / Tọa Độ</th>
              <th className="px-6 py-4 font-semibold">Người Đóng Góp</th>
              <th className="px-6 py-4 font-semibold text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-3" />
                    Đang tải dữ liệu...
                  </div>
                </td>
              </tr>
            ) : places.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                  <div className="bg-slate-50 inline-flex p-4 rounded-full mb-3">
                    <Search className="w-6 h-6 text-slate-400" />
                  </div>
                  <p>Không có địa điểm nào trong danh sách.</p>
                </td>
              </tr>
            ) : (
              places.map((place: Place) => (
                <tr key={place.diadiem_id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-medium text-slate-800">{place.ten}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-block px-2.5 py-1 text-xs font-semibold bg-slate-100 text-slate-600 rounded-lg">
                      {place.loai}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-2">
                       <MapPin className="min-w-4 w-4 h-4 text-slate-400 mt-0.5" />
                       <div className="text-sm">
                         <div className="truncate max-w-[200px]" title={place.diachi || 'Không có chỉ'}>{place.diachi || 'N/A'}</div>
                         <div className="text-xs text-slate-400 mt-0.5">
                           {place.lat && place.lng ? `${place.lat.toFixed(4)}, ${place.lng.toFixed(4)}` : 'Chưa có tọa độ'}
                         </div>
                       </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                    {place.nguoidung_id ? `User #${place.nguoidung_id}` : 'Hệ thống'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {place.trang_thai === 'PENDING' ? (
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleApprove(place.diadiem_id)}
                          className="p-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-md transition-colors"
                          title="Duyệt"
                        >
                          <Check size={18} strokeWidth={2.5} />
                        </button>
                        <button 
                          onClick={() => handleReject(place.diadiem_id)}
                          className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-md transition-colors"
                          title="Từ chối"
                        >
                          <X size={18} strokeWidth={2.5} />
                        </button>
                      </div>
                    ) : (
                      <span className={`text-xs font-bold px-2.5 py-1.5 rounded-md ${
                        place.trang_thai === 'APPROVED' ? 'bg-green-100 text-green-700' : 
                        place.trang_thai === 'PENDING_DELETE' ? 'bg-slate-100 text-slate-700' : 'bg-red-100 text-red-700'
                      }`}>
                         {place.trang_thai === 'APPROVED' ? 'Đã Duyệt' : 
                          place.trang_thai === 'PENDING_DELETE' ? 'Yêu Cầu Xóa' : 'Từ Chối'}
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!loading && places.length > 0 && totalPages > 1 && (
        <div className="p-4 border-t border-slate-200 flex items-center justify-between">
            <span className="text-sm text-slate-500">
               Trang <span className="font-semibold">{page}</span> / {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-md disabled:opacity-50 hover:bg-slate-50"
              >
                Trước
              </button>
              
              {getPageNumbers().map(num => (
                 <button
                   key={num}
                   onClick={() => setPage(num)}
                   className={`w-8 h-8 flex items-center justify-center text-sm rounded-md transition-colors ${page === num ? 'bg-indigo-600 text-white font-medium shadow-sm' : 'hover:bg-slate-100 text-slate-700'}`}
                 >
                    {num}
                 </button>
              ))}

              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
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
