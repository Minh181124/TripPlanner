import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  matkhau: string;

  @IsString()
  ten: string;

  @IsOptional()
  @IsString()
  avatar?: string;
}
