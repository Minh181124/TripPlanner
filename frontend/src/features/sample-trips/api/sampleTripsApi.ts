import apiClient from '@/shared/api/apiClient';
import type { SampleTrip, SampleTripsResponse, SampleTripStatus, CreateSampleTripDto } from '../model/sampleTrips.types';

/**
 * API layer cho Lịch trình mẫu (Sample Trips)
 * Tương tự pattern của placesApi
 */
export const sampleTripsApi = {
  // ===== PUBLIC =====

  /** Lấy danh sách lịch trình mẫu công khai (chỉ APPROVED) */
  async getAll(params?: { page?: number; limit?: number }): Promise<SampleTripsResponse> {
    const response = await apiClient.get('/lichtrinh-mau', { params });
    return response as unknown as SampleTripsResponse;
  },

  /** Lấy chi tiết lịch trình mẫu */
  async getById(id: number): Promise<{ data: SampleTrip }> {
    const response = await apiClient.get(`/lichtrinh-mau/${id}`);
    return response as unknown as { data: SampleTrip };
  },

  // ===== LOCAL (My) =====

  /** Lấy danh sách lịch trình mẫu của tôi */
  async getMine(params?: { page?: number; limit?: number }): Promise<SampleTripsResponse> {
    const response = await apiClient.get('/lichtrinh-mau/me', { params });
    return response as unknown as SampleTripsResponse;
  },

  /** Tạo lịch trình mẫu mới */
  async create(dto: CreateSampleTripDto): Promise<{ message: string; data: SampleTrip }> {
    const response = await apiClient.post('/lichtrinh-mau', dto);
    return response as unknown as { message: string; data: SampleTrip };
  },

  /** Cập nhật lịch trình mẫu (local → reset PENDING) */
  async update(id: number, dto: Partial<CreateSampleTripDto>): Promise<{ message: string; data: SampleTrip }> {
    const response = await apiClient.put(`/lichtrinh-mau/${id}`, dto);
    return response as unknown as { message: string; data: SampleTrip };
  },

  /** Xóa lịch trình mẫu (local → PENDING_DELETE) */
  async delete(id: number): Promise<{ message: string }> {
    const response = await apiClient.delete(`/lichtrinh-mau/${id}`);
    return response as unknown as { message: string };
  },

  // ===== ADMIN =====

  /** [Admin] Lấy tất cả lịch trình mẫu (filter theo status) */
  async getAllAdmin(params?: { page?: number; limit?: number; trang_thai?: SampleTripStatus }): Promise<SampleTripsResponse> {
    const response = await apiClient.get('/lichtrinh-mau/admin/all', { params });
    return response as unknown as SampleTripsResponse;
  },

  /** [Admin] Cập nhật lịch trình mẫu toàn quyền */
  async updateAdmin(id: number, dto: Partial<CreateSampleTripDto>): Promise<{ message: string; data: SampleTrip }> {
    const response = await apiClient.put(`/lichtrinh-mau/admin/${id}`, dto);
    return response as unknown as { message: string; data: SampleTrip };
  },

  /** [Admin] Xóa cứng lịch trình mẫu */
  async deleteAdmin(id: number): Promise<{ message: string }> {
    const response = await apiClient.delete(`/lichtrinh-mau/admin/${id}`);
    return response as unknown as { message: string };
  },

  /** [Admin] Cập nhật trạng thái (duyệt / từ chối) */
  async updateStatus(id: number, status: SampleTripStatus): Promise<{ message: string; data?: SampleTrip }> {
    const response = await apiClient.patch(`/lichtrinh-mau/${id}/status`, { status });
    return response as unknown as { message: string; data?: SampleTrip };
  },
};
