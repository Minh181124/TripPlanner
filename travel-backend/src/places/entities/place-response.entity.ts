import { Exclude, Expose, Transform } from 'class-transformer';

export class PlaceResponseEntity {
  diadiem_id: number;
  google_place_id: string;
  ten: string;
  diachi: string | null;
  quan_huyen: string | null;
  tu_khoa: string | null;
  lat: number | null;
  lng: number | null;
  
  @Exclude()
  geom: any;

  loai: string | null;
  
  // Transform Decimal Prisma to number
  @Transform(({ value }) => (value ? Number(value) : null))
  danhgia: number | null;

  soluotdanhgia: number | null;
  giatien: number | null;
  nguoidung_id: number | null;
  trang_thai: string | null;

  @Exclude()
  ngaycapnhat: Date | null;

  chitiet_diadiem?: any[];
  hinhanh_diadiem?: any[];
  hoatdong_diadiem?: any[];

  constructor(partial: Partial<PlaceResponseEntity>) {
    Object.assign(this, partial);
  }
}
