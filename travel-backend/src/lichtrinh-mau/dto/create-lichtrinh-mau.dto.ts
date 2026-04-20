import { Type } from 'class-transformer';
import { IsString, IsOptional, IsArray, ValidateNested, IsNumber } from 'class-validator';

/**
 * Cấu hình mỗi ngày (điểm bắt đầu, kết thúc, giờ khởi hành)
 */
export class LichtrinhMauDayConfigDto {
  @IsNumber()
  ngay_thu_may: number;

  @IsOptional()
  @IsString()
  gio_batdau?: string | null;

  @IsOptional()
  @IsString()
  diem_batdau_ten?: string | null;

  @IsOptional()
  @IsNumber()
  diem_batdau_lat?: number | null;

  @IsOptional()
  @IsNumber()
  diem_batdau_lng?: number | null;

  @IsOptional()
  @IsString()
  diem_ketthuc_ten?: string | null;

  @IsOptional()
  @IsNumber()
  diem_ketthuc_lat?: number | null;

  @IsOptional()
  @IsNumber()
  diem_ketthuc_lng?: number | null;
}

/**
 * DTO cho một địa điểm trong lịch trình mẫu
 */
export class LichtrinhMauPlaceItemDto {
  @IsString()
  mapboxPlaceId: string;

  @IsString()
  ten: string;

  @IsOptional()
  @IsString()
  diachi?: string | null;

  @IsNumber()
  lat: number;

  @IsNumber()
  lng: number;

  @IsOptional()
  @IsString()
  ghichu?: string | null;

  @IsOptional()
  @IsNumber()
  thoiluong?: number | null;

  @IsOptional()
  @IsNumber()
  ngay_thu_may?: number;
}

/**
 * DTO cho tuyến đường (chặng) giữa hai điểm
 */
export class TuyenDuongMauDto {
  @IsNumber()
  diadiem_batdau_id: number;

  @IsNumber()
  diadiem_ketthuc_id: number;

  @IsString()
  polyline: string;

  @IsString()
  phuongtien: string;

  @IsNumber()
  tong_khoangcach: number;

  @IsNumber()
  tong_thoigian: number;

  @IsOptional()
  @IsNumber()
  ngay_thu_may?: number;

  @IsOptional()
  @IsNumber()
  thutu?: number;
}

/**
 * DTO cho request tạo lịch trình mẫu mới
 * POST /lichtrinh-mau
 */
export class CreateLichtrinhMauDto {
  @IsString()
  tieude: string;

  @IsOptional()
  @IsString()
  mota?: string | null;

  @IsOptional()
  @IsNumber()
  sothich_id?: number | null;

  @IsOptional()
  @IsString()
  thoigian_dukien?: string | null;

  @IsOptional()
  @IsNumber()
  chi_phi_dukien?: number | null;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LichtrinhMauPlaceItemDto)
  places: LichtrinhMauPlaceItemDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TuyenDuongMauDto)
  tuyenDuongs?: TuyenDuongMauDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LichtrinhMauDayConfigDto)
  dayConfigs?: LichtrinhMauDayConfigDto[];
}

/**
 * DTO cho request cập nhật lịch trình mẫu
 * PUT /lichtrinh-mau/:id
 */
export class UpdateLichtrinhMauDto {
  @IsOptional()
  @IsString()
  tieude?: string;

  @IsOptional()
  @IsString()
  mota?: string | null;

  @IsOptional()
  @IsNumber()
  sothich_id?: number | null;

  @IsOptional()
  @IsString()
  thoigian_dukien?: string | null;

  @IsOptional()
  @IsNumber()
  chi_phi_dukien?: number | null;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LichtrinhMauPlaceItemDto)
  places?: LichtrinhMauPlaceItemDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TuyenDuongMauDto)
  tuyenDuongs?: TuyenDuongMauDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LichtrinhMauDayConfigDto)
  dayConfigs?: LichtrinhMauDayConfigDto[];
}
