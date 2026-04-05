import apiClient from '@/shared/api/apiClient';

export interface UserProfile {
  nguoidung_id: number;
  email: string;
  ten: string | null;
  avatar: string | null;
  vaitro: string;
  trangthai: string | null;
  sdt: string | null;
  diachi: string | null;
  ngaytao: Date | null;
  ngaycapnhat: Date | null;
}

export interface PaginatedUsers {
  data: UserProfile[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface UpdateProfilePayload {
  ten?: string;
  avatar?: string;
  sdt?: string;
  diachi?: string;
}

export interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
}

export interface UpdateUserByAdminPayload {
  vaitro?: string;
  trangthai?: string;
}

class UserService {
  /** Lấy thông tin profile của chính người dùng */
  async getProfile(): Promise<UserProfile> {
    const response = await apiClient.get<UserProfile>('/users/profile');
    return response.data;
  }

  /** Cập nhật thông tin cá nhân */
  async updateProfile(payload: UpdateProfilePayload): Promise<UserProfile> {
    const response = await apiClient.patch<UserProfile>('/users/profile', payload);
    return response.data;
  }

  /** Đổi mật khẩu */
  async changePassword(payload: ChangePasswordPayload): Promise<{ message: string }> {
    const response = await apiClient.patch<{ message: string }>(
      '/users/profile/change-password',
      payload
    );
    return response.data;
  }

  /** Lấy danh sách người dùng (Admin only) */
  async getAllUsers(page: number = 1, limit: number = 10): Promise<PaginatedUsers> {
    const response = await apiClient.get<PaginatedUsers>('/users/admin/all', {
      params: { page, limit },
    });
    return response.data;
  }

  /** Cập nhật thông tin người dùng (Admin only) */
  async updateUserByAdmin(userId: number, payload: UpdateUserByAdminPayload): Promise<UserProfile> {
    const response = await apiClient.patch<UserProfile>(`/users/admin/${userId}`, payload);
    return response.data;
  }

  /** Xóa người dùng (Admin only) */
  async deleteUserByAdmin(userId: number): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`/users/admin/${userId}`);
    return response.data;
  }
}

export const userService = new UserService();
export default userService;
