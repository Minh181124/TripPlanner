'use client';

import apiClient from '@/shared/api/apiClient';

/**
 * Itinerary Service — HTTP calls cho Lịch Trình Người Dùng
 * API endpoint: /lichtrinh-nguoidung
 *
 * Tách biệt toàn bộ network calls ra khỏi hooks và components.
 * Hooks chỉ gọi service functions, không gọi apiClient trực tiếp.
 */
export const itineraryService = {
  /**
   * Tạo lịch trình mới
   * POST /lichtrinh-nguoidung
   */
  async createItinerary(dto: Record<string, any>) {
    try {
      const response = await apiClient.post('/lichtrinh-nguoidung', dto);
      return response as any;
    } catch (error: any) {
      console.error('[itineraryService] Lỗi tạo lịch trình:', error);
      throw error;
    }
  },

  /**
   * Lấy danh sách lịch trình của user (có phân trang)
   * GET /lichtrinh-nguoidung/user/:userId
   */
  async getItinerariesByUser(userId: number, page?: number, limit?: number) {
    try {
      const params = new URLSearchParams();
      if (page !== undefined) params.append('page', page.toString());
      if (limit !== undefined) params.append('limit', limit.toString());

      const url = `/lichtrinh-nguoidung/user/${userId}${params.toString() ? '?' + params.toString() : ''}`;
      const response = await apiClient.get(url);
      return (response as any).data;
    } catch (error: any) {
      console.error('[itineraryService] Lỗi lấy danh sách lịch trình:', error);
      throw error;
    }
  },

  /**
   * Lấy tất cả lịch trình
   * GET /lichtrinh-nguoidung
   */
  async getAllItineraries(page?: number, limit?: number) {
    try {
      const params = new URLSearchParams();
      if (page !== undefined) params.append('page', page.toString());
      if (limit !== undefined) params.append('limit', limit.toString());

      const url = `/lichtrinh-nguoidung${params.toString() ? '?' + params.toString() : ''}`;
      const response = await apiClient.get(url);
      return (response as any).data;
    } catch (error: any) {
      console.error('[itineraryService] Lỗi lấy danh sách lịch trình:', error);
      throw error;
    }
  },

  /**
   * Lấy chi tiết lịch trình
   * GET /lichtrinh-nguoidung/:id
   */
  async getItinerary(id: number) {
    try {
      const response = await apiClient.get(`/lichtrinh-nguoidung/${id}`);
      return response as any;
    } catch (error: any) {
      console.error('[itineraryService] Lỗi lấy lịch trình:', error);
      throw error;
    }
  },

  /**
   * Cập nhật lịch trình
   * PUT /lichtrinh-nguoidung/:id
   */
  async updateItinerary(id: number, dto: Record<string, any>) {
    try {
      const response = await apiClient.put(`/lichtrinh-nguoidung/${id}`, dto);
      return response as any;
    } catch (error: any) {
      console.error('[itineraryService] Lỗi cập nhật lịch trình:', error);
      throw error;
    }
  },

  /**
   * Xóa lịch trình
   * DELETE /lichtrinh-nguoidung/:id
   */
  async deleteItinerary(id: number) {
    try {
      const response = await apiClient.delete(`/lichtrinh-nguoidung/${id}`);
      return response as any;
    } catch (error: any) {
      console.error('[itineraryService] Lỗi xóa lịch trình:', error);
      throw error;
    }
  },
};
