import { IsString, IsOptional, IsNumber, IsArray, ValidateNested, IsObject, IsDecimal } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PlaceImageDto {
  @ApiPropertyOptional({ description: 'URL trực tiếp của hình ảnh' })
  @IsOptional()
  @IsString()
  url?: string;

  @ApiPropertyOptional({ description: 'Google Place Photo Reference' })
  @IsOptional()
  @IsString()
  photo_reference?: string;
}

export class PlaceActivityDto {
  @ApiProperty({ description: 'Tên hoạt động' })
  @IsString()
  ten_hoatdong: string;

  @ApiPropertyOptional({ description: 'Nội dung chi tiết' })
  @IsOptional()
  @IsString()
  noidung_chitiet?: string;

  @ApiPropertyOptional({ description: 'Loại hoạt động' })
  @IsOptional()
  @IsString()
  loai_hoatdong?: string;

  @ApiPropertyOptional({ description: 'Thời điểm lý tưởng' })
  @IsOptional()
  @IsString()
  thoidiem_lytuong?: string;

  @ApiPropertyOptional({ description: 'Giá tham khảo (VNĐ)' })
  @IsOptional()
  @IsNumber()
  gia_thamkhao?: number;
}

export class PlaceDetailDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mota_google?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mota_tonghop?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sodienthoai?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  website?: string;

  @ApiPropertyOptional({ description: 'JSON giờ mở cửa các ngày' })
  @IsOptional()
  giomocua?: any;
}

export class CreatePlaceDto {
  @ApiProperty({ description: 'Tên địa điểm' })
  @IsString()
  ten: string;

  @ApiPropertyOptional({ description: 'Google Place ID', default: '' })
  @IsOptional()
  @IsString()
  google_place_id?: string;

  @ApiPropertyOptional({ description: 'Địa chỉ đầy đủ' })
  @IsOptional()
  @IsString()
  diachi?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  quan_huyen?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  tu_khoa?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  lat?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  lng?: number;

  @ApiPropertyOptional({ description: 'Loại địa điểm (restaurant, hotel, poi...)' })
  @IsOptional()
  @IsString()
  loai?: string;

  @ApiPropertyOptional({ description: 'Giá tiền (VNĐ)' })
  @IsOptional()
  @IsNumber()
  giatien?: number;

  @ApiPropertyOptional({ type: PlaceDetailDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => PlaceDetailDto)
  chitiet?: PlaceDetailDto;

  @ApiPropertyOptional({ type: [PlaceImageDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PlaceImageDto)
  images?: PlaceImageDto[];

  @ApiPropertyOptional({ type: [PlaceActivityDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PlaceActivityDto)
  hoatdong?: PlaceActivityDto[];
}
