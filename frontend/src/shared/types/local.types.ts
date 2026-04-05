/**
 * LOCAL ITINERARY Types — Tạo lịch trình Local (mẫu từ local guide)
 * Dùng trong features/local (LocalItineraryBuilder) và app/local/*
 */

/** Một địa điểm trong lịch trình Local */
export interface LocalPlaceItem {
  mapboxPlaceId: string;
  ten: string;
  diachi: string;
  lat: number;
  lng: number;
  ghichu?: string | null;
  thoiluong?: number | null;
}

/** DTO cho request tạo lịch trình Local mới — POST /lichtrinh-local */
export interface CreateLocalItineraryDto {
  tieude: string;
  mota?: string | null;
  sothich_id?: number | null;
  phuongtien?: string | null;
  places: LocalPlaceItem[];
}

/** DTO cho request cập nhật lịch trình Local — PUT /lichtrinh-local/:id */
export interface UpdateLocalItineraryDto {
  tieude?: string;
  mota?: string | null;
  sothich_id?: number | null;
  phuongtien?: string | null;
  places?: LocalPlaceItem[];
}

/** Sở thích (danh mục) cho dropdown */
export interface SoThichItem {
  sothich_id: number;
  ten: string;
  mota?: string | null;
}

/** Chi tiết địa điểm trong response từ backend */
export interface LocalItineraryPlace {
  lichtrinh_local_diadiem_id: number;
  thutu: number | null;
  ghichu: string | null;
  thoiluong: number | null;
  diadiem: {
    diadiem_id: number;
    google_place_id: string;
    ten: string;
    diachi: string | null;
    lat: number | null;
    lng: number | null;
  };
}

/** Response từ endpoint GET /lichtrinh-local/:id */
export interface LocalItinerary {
  lichtrinh_local_id: number;
  nguoidung_id: number | null;
  tieude: string;
  mota: string | null;
  sothich_id: number | null;
  phuongtien?: string | null;
  thoigian_dukien?: string | null;
  luotthich?: number;
  ngaytao: string | null;
  sothich?: SoThichItem | null;
  lichtrinh_local_diadiem: LocalItineraryPlace[];
}
