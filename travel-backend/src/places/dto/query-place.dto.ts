import { IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryPlaceDto {
  @ApiPropertyOptional({ description: 'Từ khóa tìm kiếm (theo tên hoặc mô tả)' })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({ description: 'Loại địa điểm (VD: restaurant, hotel)' })
  @IsOptional()
  @IsString()
  loai?: string;

  @ApiPropertyOptional({ description: 'Quận huyện (VD: Quận 1)' })
  @IsOptional()
  @IsString()
  quan_huyen?: string;

  @ApiPropertyOptional({ description: 'Trạng thái (PENDING, APPROVED, REJECTED)' })
  @IsOptional()
  @IsString()
  trang_thai?: string;

  @IsOptional()
  mine?: boolean | string;

  @IsOptional()
  @IsNumber()
  nguoidung_id?: number;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;
}
