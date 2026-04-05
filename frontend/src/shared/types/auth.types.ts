/**
 * AUTH & USER TYPES
 * Shared across all features that need authentication context.
 */

export type UserRole = 'admin' | 'local' | 'user';

/**
 * Người dùng - từ model nguoidung
 */
export interface User {
  nguoidung_id: number;
  email: string;
  ten: string | null;
  avatar: string | null;
  vaitro: UserRole;
  sdt?: string | null;
  diachi?: string | null;
  trangthai?: string | null;
  ngaytao?: Date | null;
  ngaycapnhat?: Date | null;
}

/**
 * Auth Context data
 */
export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

/**
 * Login request DTO
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Auth API response
 */
export interface AuthResponse {
  message: string;
  data: {
    user: User;
    token: string;
  };
}
