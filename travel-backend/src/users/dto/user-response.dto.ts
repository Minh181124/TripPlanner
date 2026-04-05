import { Exclude } from 'class-transformer';

export class UserResponseDto {
  nguoidung_id: number;
  email: string;

  @Exclude()
  matkhau?: string;

  ten: string | null;
  avatar: string | null;
  vaitro: string;
  trangthai: string | null;
  sdt: string | null;
  diachi: string | null;
  ngaytao: Date | null;
  ngaycapnhat: Date | null;

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}

export class PaginatedUsersDto {
  data: UserResponseDto[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}
