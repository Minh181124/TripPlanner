/**
 * Types cho feature Sample Trips (Lịch trình mẫu)
 */

export type SampleTripStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'PENDING_DELETE';

export interface SampleTripPlace {
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
    google_place_id: string;
  };
}

export interface SampleTripRoute {
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

export interface SampleTrip {
  lichtrinh_mau_id: number;
  nguoidung_id: number | null;
  tieude: string;
  mota: string | null;
  sothich_id: number | null;
  thoigian_dukien: string | null;
  chi_phi_dukien: number | null;
  trang_thai: SampleTripStatus | null;
  tong_khoangcach: number | null;
  tong_thoigian: number | null;
  luotthich: number | null;
  ngaytao: string | null;
  lichtrinh_mau_diadiem: SampleTripPlace[];
  tuyen_duong?: SampleTripRoute[];
  sothich?: { sothich_id: number; ten: string; mota: string | null } | null;
  nguoidung?: {
    nguoidung_id: number;
    ten: string;
    email: string;
  } | null;
}

export interface SampleTripsResponse {
  data: SampleTrip[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface CreateSampleTripDto {
  tieude: string;
  mota?: string | null;
  sothich_id?: number | null;
  thoigian_dukien?: string | null;
  chi_phi_dukien?: number | null;
  places: {
    mapboxPlaceId: string;
    ten: string;
    diachi?: string | null;
    lat: number;
    lng: number;
    ghichu?: string | null;
    thoiluong?: number | null;
    ngay_thu_may?: number;
  }[];
  tuyenDuongs?: {
    diadiem_batdau_id: number;
    diadiem_ketthuc_id: number;
    polyline: string;
    phuongtien: string;
    tong_khoangcach: number;
    tong_thoigian: number;
    ngay_thu_may?: number;
    thutu?: number;
  }[];
}
