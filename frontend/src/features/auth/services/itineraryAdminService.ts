import apiClient from '@/shared/api/apiClient';

/**
 * Admin Itinerary Service
 * API calls cho admin xem lịch trình của bất kỳ user nào
 */

export interface ItineraryPlace {
  id: number;
  diadiem_id: number;
  thutu: number;
  ngay_thu_may: number;
  thoiluong: number | null;
  ghichu: string | null;
  diadiem: {
    diadiem_id: number;
    ten: string;
    diachi: string | null;
    lat: number | null;
    lng: number | null;
  };
}

export interface ItineraryRoute {
  tuyen_duong_id: number;
  diadiem_batdau_id: number | null;
  diadiem_ketthuc_id: number | null;
  polyline: string | null;
  phuongtien: string;
  tong_khoangcach: number | null;
  tong_thoigian: number | null;
  ngay_thu_may: number;
  thutu: number | null;
}

export interface Itinerary {
  lichtrinh_nguoidung_id: number;
  nguoidung_id: number;
  tieude: string;
  ngaybatdau: string | null;
  ngayketthuc: string | null;
  trangthai: string | null;
  ngaytao: string | null;
  lichtrinh_nguoidung_diadiem: ItineraryPlace[];
  tuyen_duong?: ItineraryRoute[];
  nguoidung?: {
    nguoidung_id: number;
    ten: string;
    email: string;
  };
}

export interface ItineraryListResponse {
  itineraries: Itinerary[];
  total: number;
}

export interface ItineraryMau {
  lichtrinh_mau_id: number;
  nguoidung_id: number;
  tieude: string;
  mota: string | null;
  thoigian_dukien: string | null;
  tong_khoangcach: number | null;
  tong_thoigian: number | null;
  luotthich: number | null;
  ngaytao: string | null;
  lichtrinh_mau_diadiem: {
    id: number;
    diadiem_id: number;
    thutu: number;
    ngay_thu_may: number;
    thoiluong: number | null;
    ghichu: string | null;
    diadiem: {
      diadiem_id: number;
      ten: string;
      diachi: string | null;
      lat: number | null;
      lng: number | null;
    };
  }[];
  tuyen_duong?: ItineraryRoute[];
  nguoidung?: {
    nguoidung_id: number;
    ten: string;
    email: string;
  };
}

class ItineraryAdminService {
  /** [Admin] Lấy lịch trình cá nhân của bất kỳ user */
  async getItinerariesByUser(userId: number): Promise<ItineraryListResponse> {
    const response = await apiClient.get(`/lichtrinh-nguoidung/admin/user/${userId}`);
    return response as unknown as ItineraryListResponse;
  }

  /** [Admin] Lấy chi tiết lịch trình */
  async getItineraryDetail(id: number): Promise<Itinerary> {
    const response = await apiClient.get(`/lichtrinh-nguoidung/admin/${id}`);
    return response as unknown as Itinerary;
  }

  /** Lấy danh sách lịch trình mẫu (tour templates) */
  async getTemplateTours(): Promise<{ data: ItineraryMau[]; pagination: any }> {
    const response = await apiClient.get('/lichtrinh-mau?limit=100');
    return response as unknown as { data: ItineraryMau[]; pagination: any };
  }
}

export const itineraryAdminService = new ItineraryAdminService();
export default itineraryAdminService;
