'use client';

import React, { useState } from 'react';
import { usePlaces } from '../hooks/usePlaces';
import { placesApi } from '../api/places.api';
import { Edit2, Trash2, MapPin, Search, Plus } from 'lucide-react';
import type { Place } from '../model/places.types';
import { PlaceCrudModal } from './PlaceCrudModal';
import toast from 'react-hot-toast';

export function ManagePlacesTable() {
  const { places, loading, error, page, totalPages, setPage, refresh } = usePlaces({ 
    initialLimit: 10,
    // We fetch ALL statuses so we don't pass statusFilter by default
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlace, setEditingPlace] = useState<Place | null>(null);

  const handleCreateNew = () => {
    setEditingPlace(null);
    setIsModalOpen(true);
  };

  const handleEdit = (place: Place) => {
    setEditingPlace(place);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa địa điểm này vĩnh viễn không?')) {
      try {
        await placesApi.deletePlace(id);
        toast.success('Đã xóa địa điểm thành công');
        refresh();
      } catch (err: any) {
        toast.error(err?.message || 'Lỗi khi xóa địa điểm');
      }
    }
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
      <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Danh Sách Địa Điểm</h2>
          <p className="text-sm text-slate-500">Toàn quyền tạo, cập nhật thông tin chi tiết và xóa địa điểm.</p>
        </div>
        
        <button 
          onClick={handleCreateNew}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Thêm địa điểm mới
        </button>
      </div>

      <div className="overflow-x-auto min-h-[400px]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-600 text-sm border-b border-slate-200 uppercase tracking-wider">
              <th className="px-6 py-4 font-semibold">Tên & ID</th>
              <th className="px-6 py-4 font-semibold">Loại / Trạng Thái</th>
              <th className="px-6 py-4 font-semibold">Địa Chỉ</th>
              <th className="px-6 py-4 font-semibold text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-3" />
                    Đang tải dữ liệu...
                  </div>
                </td>
              </tr>
            ) : places.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                  <div className="bg-slate-50 inline-flex p-4 rounded-full mb-3">
                    <Search className="w-6 h-6 text-slate-400" />
                  </div>
                  <p>Không có địa điểm nào trong hệ thống.</p>
                </td>
              </tr>
            ) : (
              places.map((place: Place) => (
                <tr key={place.diadiem_id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-800">{place.ten}</div>
                    <div className="text-xs text-slate-400 mt-0.5">ID: {place.diadiem_id}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-2 items-start">
                      <span className="inline-block px-2.5 py-1 text-xs font-semibold bg-slate-100 text-slate-600 rounded-lg">
                        {place.loai || 'Chưa phân loại'}
                      </span>
                      <span className={`text-xs font-bold px-2 py-1 rounded-md ${
                        place.trang_thai === 'APPROVED' ? 'bg-green-100 text-green-700' : 
                        place.trang_thai === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                      }`}>
                         {place.trang_thai}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-2 max-w-[250px]">
                       <MapPin className="min-w-4 w-4 h-4 text-slate-400 mt-0.5" />
                       <div className="text-sm truncate" title={place.diachi || 'Không có địa chỉ'}>
                         {place.diachi || 'N/A'}
                       </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleEdit(place)}
                        className="p-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-md transition-colors"
                        title="Chỉnh sửa chi tiết"
                      >
                        <Edit2 size={18} strokeWidth={2.5} />
                      </button>
                      <button 
                        onClick={() => handleDelete(place.diadiem_id)}
                        className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-md transition-colors"
                        title="Xóa vĩnh viễn"
                      >
                        <Trash2 size={18} strokeWidth={2.5} />
                      </button>
                    </div>
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

      {isModalOpen && (
        <PlaceCrudModal
          place={editingPlace}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            refresh();
          }}
        />
      )}
    </div>
  );
}
