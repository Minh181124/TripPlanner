import { IsString, IsOptional, IsBoolean, IsDateString, IsNumber } from 'class-validator';

export class CreateVeDto {
  @IsString()
  tieu_de: string;

  @IsOptional()
  @IsString()
  loai_ve?: string; // bus | train | event | other

  @IsOptional()
  @IsDateString()
  ngay_su_dung?: string;

  @IsOptional()
  @IsString()
  ghi_chu?: string;

  @IsOptional()
  chi_tiet?: any;
}

export class UpdateVeDto {
  @IsOptional()
  @IsString()
  tieu_de?: string;

  @IsOptional()
  @IsString()
  loai_ve?: string;

  @IsOptional()
  @IsDateString()
  ngay_su_dung?: string;

  @IsOptional()
  @IsString()
  ghi_chu?: string;

  @IsOptional()
  chi_tiet?: any;

  @IsOptional()
  @IsBoolean()
  trang_thai?: boolean;
}

export class AttachVeDto {
  @IsNumber()
  ve_id: number;

  @IsNumber()
  lichtrinh_nguoidung_diadiem_id: number;
}
