/**
 * @fileoverview Common TypeScript interfaces mapped from Prisma schema.
 * Shared across all features. Do NOT put feature-specific types here.
 *
 * NAMING RULES:
 *   - Names follow snake_case matching the database column names.
 *   - NEVER use generic `id` — always use `diadiem_id`, `tuyen_duong_id`, etc.
 *   - Prisma `Decimal` columns → `number` in TypeScript.
 *   - Fields with `?` in Prisma → `T | null` in TypeScript.
 */

// ---------------------------------------------------------------------------
// diadiem — Bảng địa điểm chính
// ---------------------------------------------------------------------------
export interface DiaDiem {
  diadiem_id: number;
  google_place_id: string;
  ten: string;
  diachi: string | null;
  lat: number | null;
  lng: number | null;
  loai: string | null;
  /** Decimal(3,2) trong Prisma → number ở frontend */
  danhgia: number | null;
  soluotdanhgia: number | null;
  giatien: number | null;
  ngaycapnhat: string | null;
}

// ---------------------------------------------------------------------------
// chitiet_diadiem — Chi tiết mở rộng của địa điểm
// ---------------------------------------------------------------------------
export interface ChiTietDiaDiem {
  chitiet_diadiem_id: number;
  diadiem_id: number | null;
  mota_google: string | null;
  mota_tonghop: string | null;
  sodienthoai: string | null;
  website: string | null;
  /** Dữ liệu JSON giờ mở cửa từ Google */
  giomocua: Record<string, unknown> | null;
  ngaycapnhat: string | null;
}

// ---------------------------------------------------------------------------
// hinhanh_diadiem — Hình ảnh của địa điểm
// ---------------------------------------------------------------------------
export interface HinhAnhDiaDiem {
  hinhanh_diadiem_id: number;
  diadiem_id: number | null;
  photo_reference: string | null;
  url: string | null;
}

// ---------------------------------------------------------------------------
// danhgia_diadiem — Đánh giá của người dùng
// ---------------------------------------------------------------------------
export interface DanhGiaDiaDiem {
  danhgia_diadiem_id: number;
  nguoidung_id: number | null;
  diadiem_id: number | null;
  sosao: number | null;
  noidung: string | null;
  ngaytao: string | null;
}

// ---------------------------------------------------------------------------
// lichtrinh_local — Lịch trình mẫu (template)
// ---------------------------------------------------------------------------
export interface LichTrinhLocal {
  lichtrinh_local_id: number;
  nguoidung_id: number | null;
  tieude: string;
  mota: string | null;
  sothich_id: number | null;
  thoigian_dukien: string | null;
  luotthich: number | null;
  ngaytao: string | null;
  lichtrinh_local_diadiem?: LichTrinhLocalDiaDiem[];
}

// ---------------------------------------------------------------------------
// lichtrinh_local_diadiem — Bảng trung gian: lịch trình mẫu ↔ địa điểm
// ---------------------------------------------------------------------------
export interface LichTrinhLocalDiaDiem {
  lichtrinh_local_diadiem_id: number;
  lichtrinh_local_id: number | null;
  diadiem_id: number | null;
  /** Thứ tự hiển thị — sắp xếp tăng dần trước khi render */
  thutu: number | null;
  thoigian_den: string | null;
  thoiluong: number | null;
  ghichu: string | null;
  diadiem?: DiaDiem;
}

// ---------------------------------------------------------------------------
// lichtrinh_nguoidung — Lịch trình cá nhân của người dùng
// ---------------------------------------------------------------------------
export interface LichTrinhNguoiDung {
  lichtrinh_nguoidung_id: number;
  nguoidung_id: number | null;
  tieude: string;
  thoigian_batdau: string | null;
  thoigian_ketthuc: string | null;
  trangthai: string | null;
  ngaytao: string | null;
  lichtrinh_nguoidung_diadiem?: LichTrinhNguoiDungDiaDiem[];
  tuyen_duong?: TuyenDuong[];
}

// ---------------------------------------------------------------------------
// lichtrinh_nguoidung_diadiem — Bảng trung gian: lịch trình cá nhân ↔ địa điểm
// ---------------------------------------------------------------------------
export interface LichTrinhNguoiDungDiaDiem {
  lichtrinh_nguoidung_diadiem_id: number;
  lichtrinh_nguoidung_id: number | null;
  diadiem_id: number | null;
  thutu: number | null;
  thoigian_den: string | null;
  thoiluong: number | null;
  ghichu: string | null;
  diadiem?: DiaDiem;
}

// ---------------------------------------------------------------------------
// RouteData — Dữ liệu tuyến đường từ API /places/route (preview)
// ---------------------------------------------------------------------------
export interface RouteData {
  /** Chuỗi polyline đã mã hóa — dùng @mapbox/polyline để giải mã */
  polyline?: string;
  /** Khoảng cách tổng cộng tính bằng mét */
  tong_khoangcach?: number;
  /** Tổng thời gian di chuyển tính bằng giây */
  tong_thoigian?: number;
}

// ---------------------------------------------------------------------------
// tuyen_duong — Dữ liệu tuyến đường / chỉ đường
// ---------------------------------------------------------------------------
export interface TuyenDuong {
  tuyen_duong_id: number;
  lichtrinh_nguoidung_id: number | null;
  polyline: string | null;
  /** Decimal trong Prisma → number ở frontend (tổng khoảng cách, đơn vị mét) */
  tong_khoangcach: number | null;
  tong_thoigian: number | null;
  ngay_thu_may: number | null;
  ngaytao: string | null;
}

// ---------------------------------------------------------------------------
// nguoidung — Người dùng
// ---------------------------------------------------------------------------
export interface NguoiDung {
  nguoidung_id: number;
  email: string;
  matkhau: string;
  ten: string | null;
  avatar: string | null;
  trangthai: string | null;
  ngaytao: string | null;
  ngaycapnhat: string | null;
}

// ---------------------------------------------------------------------------
// sothich — Danh mục sở thích
// ---------------------------------------------------------------------------
export interface SoThich {
  sothich_id: number;
  ten: string;
  mota: string | null;
}

// ---------------------------------------------------------------------------
// nguoidung_sothich — Bảng trung gian: người dùng ↔ sở thích
// ---------------------------------------------------------------------------
export interface NguoiDungSoThich {
  nguoidung_sothich_id: number;
  nguoidung_id: number | null;
  sothich_id: number | null;
}

// ---------------------------------------------------------------------------
// luu_diadiem — Địa điểm đã lưu / đánh dấu
// ---------------------------------------------------------------------------
export interface LuuDiaDiem {
  luu_diadiem_id: number;
  nguoidung_id: number | null;
  diadiem_id: number | null;
  ngaytao: string | null;
}

// ---------------------------------------------------------------------------
// meovat_diadiem — Mẹo vặt / tips cho địa điểm
// ---------------------------------------------------------------------------
export interface MeoVatDiaDiem {
  meovat_diadiem_id: number;
  diadiem_id: number | null;
  nguoidung_id: number | null;
  noidung: string;
  thoidiem_dep: string | null;
  ngaytao: string | null;
}

// ---------------------------------------------------------------------------
// DTO cho API Request / Response
// ---------------------------------------------------------------------------

export interface RoutePreviewResponse {
  polyline: string;
  tong_khoangcach: number;
  tong_thoigian: number;
}

export interface ItineraryPlaceInput {
  google_place_id: string;
  thutu: number;
  thoigian_den?: string | null;
  thoiluong?: number | null;
  ghichu?: string | null;
}

export interface CreateItineraryPayload {
  tieude: string;
  mota?: string | null;
  sothich_id?: number | null;
  thoigian_dukien?: string | null;
  places: ItineraryPlaceInput[];
}

export interface CreateItineraryResponse extends LichTrinhLocal {
  lichtrinh_local_diadiem: (LichTrinhLocalDiaDiem & {
    diadiem: DiaDiem;
  })[];
}
