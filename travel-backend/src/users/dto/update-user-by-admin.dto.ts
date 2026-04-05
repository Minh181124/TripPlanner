import { IsString, IsEnum, IsOptional } from 'class-validator';

export enum UserRole {
  USER = 'user',
  LOCAL = 'local',
  ADMIN = 'admin',
}

export class UpdateUserByAdminDto {
  @IsOptional()
  @IsString()
  @IsEnum(UserRole)
  vaitro?: string;

  @IsOptional()
  @IsString()
  trangthai?: string; // 'active', 'inactive', 'banned'
}
