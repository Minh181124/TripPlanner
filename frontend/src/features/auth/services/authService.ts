import axios, { AxiosInstance } from 'axios';
import type { User } from '@/shared/types/auth.types';

/**
 * API URL from environment variable
 * - Development: http://localhost:3001/api (backend on port 3001)
 * - Production: https://api.yourdomain.com/api (or your production URL)
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface LoginPayload {
  email: string;
  matkhau: string;
}

interface RegisterPayload {
  email: string;
  matkhau: string;
  ten: string;
  avatar?: string;
}

interface AuthApiResponse {
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

class AuthService {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_URL,
    });
  }

  /**
   * Đăng nhập
   */
  async login(payload: LoginPayload): Promise<AuthApiResponse> {
    try {
      const response = await this.axiosInstance.post<any>('/auth/login', payload);
      
      const authData = response.data.data ? response.data.data : response.data;

      if (authData.access_token) {
        localStorage.setItem('access_token', authData.access_token);
        localStorage.setItem('user', JSON.stringify(authData.user));
      }

      return authData;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Đăng nhập thất bại';
      throw new Error(message);
    }
  }

  /**
   * Đăng ký
   */
  async register(payload: RegisterPayload): Promise<AuthApiResponse> {
    try {
      const response = await this.axiosInstance.post<any>('/auth/register', payload);

      const authData = response.data.data ? response.data.data : response.data;

      if (authData.access_token) {
        localStorage.setItem('access_token', authData.access_token);
        localStorage.setItem('user', JSON.stringify(authData.user));
      }

      return authData;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Đăng ký thất bại';
      throw new Error(message);
    }
  }

  /**
   * Đăng xuất
   */
  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  }

  /**
   * Lấy token từ localStorage
   */
  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('access_token');
    }
    return null;
  }

  /**
   * Lấy thông tin người dùng từ localStorage
   */
  getUser(): User | null {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    }
    return null;
  }

  /**
   * Kiểm tra người dùng đã đăng nhập
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export const authService = new AuthService();
export default authService;
