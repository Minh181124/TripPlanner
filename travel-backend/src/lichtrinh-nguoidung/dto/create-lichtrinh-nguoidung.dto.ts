import { Type } from 'class-transformer';
import { IsString, IsOptional, IsArray, ValidateNested, IsNumber, IsDateString } from 'class-validator';

/**
 * DTO cho một địa điểm trong lịch trình người dùng
 */
export class LichtrinhNguoidungPlaceItemDto {
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
}
