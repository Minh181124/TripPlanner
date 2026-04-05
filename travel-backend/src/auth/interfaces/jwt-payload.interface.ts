export interface JwtPayload {
  sub: number; // nguoidung_id
  email: string;
  vaitro: string;
  iat?: number;
  exp?: number;
}
