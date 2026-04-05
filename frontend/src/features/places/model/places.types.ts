export type PlaceStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface PlaceDetail {
  mota_google?: string;
  mota_tonghop?: string;
  sodienthoai?: string;
  website?: string;
  giomocua?: any;
}

export interface PlaceImage {
  url?: string;
  photo_reference?: string;
}

export interface PlaceActivity {
  ten_hoatdong: string;
  noidung_chitiet?: string;
  loai_hoatdong?: string;
  thoidiem_lytuong?: string;
  gia_thamkhao?: number;
}

export interface Place {
  diadiem_id: number;
  google_place_id: string;
  ten: string;
  diachi: string | null;
  quan_huyen: string | null;
  tu_khoa: string | null;
  lat: number | null;
  lng: number | null;
  loai: string | null;
  danhgia: number | null;
  soluotdanhgia: number | null;
  giatien: number | null;
  nguoidung_id: number | null;
  trang_thai: PlaceStatus;
  chitiet_diadiem?: PlaceDetail[];
  hinhanh_diadiem?: PlaceImage[];
  hoatdong_diadiem?: PlaceActivity[];
}

export interface PlacesResponse {
  items: Place[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreatePlaceDto {
  ten: string;
  google_place_id?: string;
  diachi?: string;
  quan_huyen?: string;
  tu_khoa?: string;
  lat?: number;
  lng?: number;
  loai?: string;
  giatien?: number;
  chitiet?: PlaceDetail;
  images?: PlaceImage[];
  hoatdong?: PlaceActivity[];
}
