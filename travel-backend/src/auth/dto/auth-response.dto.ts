export class AuthResponseDto {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: {
    nguoidung_id: number;
    email: string;
    ten: string;
    avatar: string | null;
    vaitro: string;
  };
}
