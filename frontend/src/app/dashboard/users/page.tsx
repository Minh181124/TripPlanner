'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth';
import { userService } from '@/features/auth';
import type { PaginatedUsers, UserProfile } from '@/features/auth';
import { Users, Edit2, Trash2, AlertCircle, CheckCircle, Loader, ChevronLeft, ChevronRight } from 'lucide-react';

interface EditingUser {
  id: number;
  vaitro: string;
  trangthai: string;
}

/**
 * Admin Users Management Page - Only for admin users
 */
export default function AdminUsersPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [users, setUsers] = useState<PaginatedUsers | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [editingUser, setEditingUser] = useState<EditingUser | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  /**
   * Kiểm tra quyền admin
   */
  useEffect(() => {
    if (!authLoading && user?.vaitro !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  /**
   * Load users khi component mount hoặc page thay đổi
   */
  useEffect(() => {
    if (user?.vaitro === 'admin') {
      loadUsers();
    }
  }, [currentPage, user]);

  /**
   * Load danh sách users từ server
   */
  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const data = await userService.getAllUsers(currentPage, pageSize);
      setUsers(data);
    } catch (error: any) {
      setErrorMessage('Lỗi tải danh sách người dùng');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Mở modal edit
   */
  const openEditModal = (userData: UserProfile) => {
    setEditingUser({
      id: userData.nguoidung_id,
      vaitro: userData.vaitro,
      trangthai: userData.trangthai || 'active',
    });
    setShowEditModal(true);
  };

  /**
   * Lưu thay đổi vai trò/trạng thái người dùng
   */
  const handleSaveEdit = async () => {
    if (!editingUser) return;

    try {
      setIsLoading(true);
      await userService.updateUserByAdmin(editingUser.id, {
        vaitro: editingUser.vaitro,
        trangthai: editingUser.trangthai,
      });
      setShowEditModal(false);
      setEditingUser(null);
      setSuccessMessage('Cập nhật thông tin người dùng thành công');
      setTimeout(() => setSuccessMessage(''), 3000);
      await loadUsers();
    } catch (error: any) {
      setErrorMessage(error.message || 'Lỗi cập nhật thông tin');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Mở modal xác nhận xóa
   */
  const openDeleteModal = (userId: number) => {
    setDeletingUserId(userId);
    setShowDeleteModal(true);
  };

  /**
   * Xóa người dùng
   */
  const handleDeleteUser = async () => {
    if (deletingUserId === null) return;

    try {
      setIsLoading(true);
      await userService.deleteUserByAdmin(deletingUserId);
      setShowDeleteModal(false);
      setDeletingUserId(null);
      setSuccessMessage('Xóa người dùng thành công');
      setTimeout(() => setSuccessMessage(''), 3000);
      await loadUsers();
    } catch (error: any) {
      setErrorMessage(error.message || 'Lỗi xóa người dùng');
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (user?.vaitro !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-slate-700">Bạn không có quyền truy cập trang này</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <Users className="w-8 h-8 text-indigo-600" />
          Quản lý người dùng
        </h1>
        <p className="text-slate-600 mt-2">Quản lý vai trò, trạng thái và xóa tài khoản người dùng</p>
      </div>

      {/* Alerts */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
          <p className="text-sm text-green-700">{successMessage}</p>
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{errorMessage}</p>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Tên</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Vai trò</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Trạng thái</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Ngày tạo</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center">
                    <Loader className="w-6 h-6 text-indigo-600 animate-spin mx-auto" />
                  </td>
                </tr>
              ) : users?.data && users.data.length > 0 ? (
                users.data.map((userData) => (
                  <tr key={userData.nguoidung_id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-900">{userData.nguoidung_id}</td>
                    <td className="px-6 py-4 text-sm text-slate-900">{userData.ten || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{userData.email}</td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          userData.vaitro === 'admin'
                            ? 'bg-red-100 text-red-800'
                            : userData.vaitro === 'local'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {userData.vaitro}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          userData.trangthai === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {userData.trangthai === 'active' ? 'Hoạt động' : 'Bất hoạt'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {userData.ngaytao ? new Date(userData.ngaytao).toLocaleDateString('vi-VN') : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(userData)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(userData.nguoidung_id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-600">
                    Không có người dùng nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {users && users.pages > 1 && (
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <p className="text-sm text-slate-600">
              Trang {currentPage} / {users.pages} ({users.total} người dùng)
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 text-slate-600 hover:bg-white border border-slate-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(users.pages, currentPage + 1))}
                disabled={currentPage === users.pages}
                className="p-2 text-slate-600 hover:bg-white border border-slate-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Chỉnh sửa người dùng</h2>

            <div className="space-y-4 mb-6">
              {/* Vai trò */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Vai trò</label>
                <select
                  value={editingUser.vaitro}
                  onChange={(e) => setEditingUser({ ...editingUser, vaitro: e.target.value })}
                  className="w-full px-4 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="user">Người dùng</option>
                  <option value="local">Local (Chủ địa điểm)</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {/* Trạng thái */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Trạng thái</label>
                <select
                  value={editingUser.trangthai}
                  onChange={(e) => setEditingUser({ ...editingUser, trangthai: e.target.value })}
                  className="w-full px-4 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="active">Hoạt động</option>
                  <option value="inactive">Đình chỉ</option>
                  <option value="banned">Cấm</option>
                </select>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingUser(null);
                }}
                className="flex-1 px-4 py-2 text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  'Lưu thay đổi'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && deletingUserId !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Xác nhận xóa người dùng</h2>
            <p className="text-slate-600 mb-6">
              Bạn có chắc chắn muốn xóa người dùng này? Hành động này không thể hoàn tác.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletingUserId(null);
                }}
                className="flex-1 px-4 py-2 text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Đang xóa...
                  </>
                ) : (
                  'Xóa'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
