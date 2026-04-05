'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import type { User, AuthContextType } from '@/shared/types/auth.types';

/**
 * Auth Context - Quản lý trạng thái xác thực của người dùng
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * Auth Provider - Cung cấp dữ liệu xác thực cho toàn bộ ứng dụng
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Kiểm tra xem người dùng đã đăng nhập chưa (từ localStorage hoặc session)
   */
  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      const savedUser = authService.getUser();

      if (!savedUser) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      setUser(savedUser);
      setError(null);
    } catch (err: any) {
      console.error('Lỗi kiểm tra xác thực:', err);
      setUser(null);
      authService.logout();
      setError(err.message || 'Lỗi xác thực');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Đăng nhập
   */
  const login = useCallback(async (email: string, matkhau: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authService.login({
        email,
        matkhau,
      });

      setUser({
        ...response.user,
        vaitro: response.user.vaitro as any,
      });
    } catch (err: any) {
      const errorMsg = err.message || 'Lỗi đăng nhập';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Đăng xuất
   */
  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setError(null);
  }, []);

  /**
   * Làm mới thông tin người dùng
   */
  const refreshUser = useCallback(async () => {
    await checkAuth();
  }, [checkAuth]);

  /**
   * Kiểm tra xác thực khi component mount
   */
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const value: AuthContextType = {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook để sử dụng Auth Context
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth phải được sử dụng trong AuthProvider');
  }
  return context;
}
