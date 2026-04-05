import { IsString, IsEmail, IsOptional, IsEnum } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  ten?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsString()
  sdt?: string;

  @IsOptional()
  @IsString()
  diachi?: string;

  // Mật khẩu: Sử dụng endpoint riêng để đổi mật khẩu
  // Email: Không được phép tự đổi email tại đây
  // Vai trò: Không được phép tự đổi vai trò
}
