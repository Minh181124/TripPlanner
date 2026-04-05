/**
 * DTO cho một địa điểm trong lịch trình mẫu
 */
export class LichtrinhMauPlaceItemDto {
  mapboxPlaceId: string;
  ten: string;
  diachi?: string | null;
  lat: number;
  lng: number;
  ghichu?: string | null;
  thoiluong?: number | null;
  ngay_thu_may?: number;
}

/**
 * DTO cho tuyến đường (chặng) giữa hai điểm
 */
export class TuyenDuongMauDto {
  diadiem_batdau_id: number;
  diadiem_ketthuc_id: number;
  polyline: string; // Chuỗi mã hóa polyline
  phuongtien: string; // car, walk, bike, bus, etc.
  tong_khoangcach: number; // Quãng đường (meter hoặc km)
  tong_thoigian: number; // Thời gian (giây)
  ngay_thu_may?: number; // Ngày thứ mấy
  thutu?: number; // Thứ tự chặng trong ngày
}

/**
 * DTO cho request tạo lịch trình mẫu mới
 * POST /lichtrinh-mau
 */
export class CreateLichtrinhMauDto {
  tieude: string;
  mota?: string | null;
  sothich_id?: number | null;
  thoigian_dukien?: string | null;
  places: LichtrinhMauPlaceItemDto[];
  tuyenDuongs?: TuyenDuongMauDto[]; // Danh sách các tuyến đường/chặng
}

/**
 * DTO cho request cập nhật lịch trình mẫu
 * PUT /lichtrinh-mau/:id
 */
export class UpdateLichtrinhMauDto {
  tieude?: string;
  mota?: string | null;
  sothich_id?: number | null;
  thoigian_dukien?: string | null;
  places?: LichtrinhMauPlaceItemDto[];
  tuyenDuongs?: TuyenDuongMauDto[]; // Danh sách các tuyến đường/chặng
}
