'use client';

import apiClient from '@/shared/api/apiClient';

/**
 * Ticket types
 */
export interface Ticket {
  ve_id: number;
  nguoidung_id: number;
  tieu_de: string;
  loai_ve: string | null;
  ngay_su_dung: string | null;
  ghi_chu: string | null;
  file_url: string | null;
  kieu_file: string | null;
  cloudinary_id: string | null;
  chi_tiet?: any;
  trang_thai: boolean;
  ngaytao: string;
  attachedTrips?: {
    lichtrinh_id: number;
    tieude: string;
    diadiem_ten: string;
  }[];
}

export interface AttachedTicket {
  attachId: number;
  ve_id: number;
  tieu_de: string;
  loai_ve: string | null;
  file_url: string | null;
  kieu_file: string | null;
  ngay_su_dung: string | null;
}

/** Map: lichtrinhDiaDiemId → danh sách vé đã attach */
export type TicketMap = Record<number, AttachedTicket[]>;

/**
 * ticketService — HTTP calls cho Kho Vé
 * API endpoints: /ve
 */
export const ticketService = {
  /**
   * Lấy danh sách kho vé của user hiện tại
   * GET /ve?trang_thai=true/false
   */
  async getMyTickets(trangThai?: boolean): Promise<Ticket[]> {
    try {
      const url = trangThai !== undefined ? `/ve?trang_thai=${trangThai}` : '/ve';
      const response = await apiClient.get(url);
      return (response as any)?.data ?? response ?? [];
    } catch (error: any) {
      console.error('[ticketService] Lỗi lấy kho vé:', error);
      throw error;
    }
  },

  /**
   * Tạo vé mới (có thể kèm file)
   * POST /ve  (multipart/form-data)
   */
  async createTicket(formData: FormData): Promise<Ticket> {
    try {
      const response = await apiClient.post('/ve', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      } as any);
      return (response as any)?.data ?? response;
    } catch (error: any) {
      console.error('[ticketService] Lỗi tạo vé:', error);
      throw error;
    }
  },

  /**
   * Cập nhật metadata vé (bao gồm archive: trang_thai=false)
   * PATCH /ve/:id
   */
  async updateTicket(
    id: number,
    data: { tieu_de?: string; loai_ve?: string; ghi_chu?: string; trang_thai?: boolean; ngay_su_dung?: string },
  ): Promise<Ticket> {
    try {
      const response = await apiClient.patch(`/ve/${id}`, data);
      return (response as any)?.data ?? response;
    } catch (error: any) {
      console.error('[ticketService] Lỗi cập nhật vé:', error);
      throw error;
    }
  },

  /**
   * Xóa vé (đồng thời xóa file trên Cloudinary)
   * DELETE /ve/:id
   */
  async deleteTicket(id: number): Promise<void> {
    try {
      await apiClient.delete(`/ve/${id}`);
    } catch (error: any) {
      console.error('[ticketService] Lỗi xóa vé:', error);
      throw error;
    }
  },

  /**
   * Lấy TẤT CẢ vé đã attach trong 1 lịch trình — 1 call duy nhất
   * GET /ve/for-itinerary/:lichtrinhId
   * Trả về TicketMap: { [lichtrinh_nguoidung_diadiem_id]: AttachedTicket[] }
   */
  async getTicketsForItinerary(lichtrinhId: number): Promise<TicketMap> {
    try {
      const response = await apiClient.get(`/ve/for-itinerary/${lichtrinhId}`);
      return (response as any)?.data ?? response ?? {};
    } catch (error: any) {
      console.error('[ticketService] Lỗi lấy vé lịch trình:', error);
      return {};
    }
  },

  /**
   * Attach vé vào địa điểm trong lịch trình
   * POST /ve/attach
   */
  async attachTicket(veId: number, lichtrinhNguoidungDiaDiemId: number): Promise<void> {
    try {
      await apiClient.post('/ve/attach', {
        ve_id: veId,
        lichtrinh_nguoidung_diadiem_id: lichtrinhNguoidungDiaDiemId,
      });
    } catch (error: any) {
      console.error('[ticketService] Lỗi attach vé:', error);
      throw error;
    }
  },

  /**
   * Gỡ vé khỏi địa điểm
   * DELETE /ve/attach/:attachId
   */
  async detachTicket(attachId: number): Promise<void> {
    try {
      await apiClient.delete(`/ve/attach/${attachId}`);
    } catch (error: any) {
      console.error('[ticketService] Lỗi gỡ vé:', error);
      throw error;
    }
  },

  /**
   * Trích xuất thông tin vé bằng AI (Gemini)
   * Có thể truyền File ảnh/PDF hoặc Text
   */
  async extractTicketAI(data: { text?: string; file?: File }): Promise<any> {
    try {
      const formData = new FormData();
      if (data.file) formData.append('file', data.file);
      if (data.text) formData.append('text', data.text);

      const response = await apiClient.post('/ve/extract-ai', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      } as any);
      return (response as any)?.data?.data ?? (response as any)?.data ?? response;
    } catch (error: any) {
      console.error('[ticketService] Lỗi AI trích xuất:', error);
      throw error;
    }
  },
};
