import { IsOptional, IsString, IsNumber } from 'class-validator';

export class SearchDto {
  @IsString()
  keyword: string;

  @IsOptional()
  @IsNumber()
  lat?: number;

  @IsOptional()
  @IsNumber()
  lng?: number;

  @IsOptional()
  @IsString()
  loai?: string;

  @IsOptional()
  @IsString()
  quan_huyen?: string;

  @IsOptional()
  @IsNumber()
  gia_min?: number;

  @IsOptional()
  @IsNumber()
  gia_max?: number;

  @IsOptional()
  @IsString()
  thoidiem?: string;
}
