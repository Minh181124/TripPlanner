import { Type } from 'class-transformer';
import { IsString, IsOptional, IsArray, ValidateNested, IsNumber, IsDateString } from 'class-validator';

/**
 * Cấu hình mỗi ngày (điểm bắt đầu, kết thúc, giờ khởi hành)
 */
export class DayConfigDto {
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
 * DTO cho một địa điểm trong lịch trình người dùng
 */
export class LichtrinhNguoidungPlaceItemDto {
  @IsOptional()
  @IsNumber()
  id?: number;

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

  /** Giờ đến địa điểm dạng "HH:mm" → lưu vào thoigian_den */
  @IsOptional()
  @IsString()
  thoigian_den?: string | null;
}

/**
 * DTO cho request tạo lịch trình người dùng mới
 * POST /lichtrinh-nguoidung
 */
export class CreateLichtrinhNguoidungDto {
  @IsString()
  tieude: string;

  @IsOptional()
  @IsDateString()
  ngaybatdau?: string | null;

  @IsOptional()
  @IsDateString()
  ngayketthuc?: string | null;

  @IsOptional()
  @IsString()
  trangthai?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LichtrinhNguoidungPlaceItemDto)
  places: LichtrinhNguoidungPlaceItemDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DayConfigDto)
  dayConfigs?: DayConfigDto[];
}

/**
 * DTO cho request cập nhật lịch trình người dùng
 * PUT /lichtrinh-nguoidung/:id
 */
export class UpdateLichtrinhNguoidungDto {
  @IsOptional()
  @IsString()
  tieude?: string;

  @IsOptional()
  @IsDateString()
  ngaybatdau?: string | null;

  @IsOptional()
  @IsDateString()
  ngayketthuc?: string | null;

  @IsOptional()
  @IsString()
  trangthai?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LichtrinhNguoidungPlaceItemDto)
  places?: LichtrinhNguoidungPlaceItemDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DayConfigDto)
  dayConfigs?: DayConfigDto[];
}
