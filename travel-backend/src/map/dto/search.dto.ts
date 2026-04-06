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
}
