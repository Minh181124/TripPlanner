'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, User, AlertCircle, Loader } from 'lucide-react';
import { useAuth } from '@/features/auth';
import { authService } from '@/features/auth';

/**
 * Register Page - User registration form
 */
export default function RegisterPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();

  const [email, setEmail] = useState('');
  const [matkhau, setMatkhau] = useState('');
  const [ten, setTen] = useState('');
  const [confirmMatkhau, setConfirmMatkhau] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Redirect to dashboard if already authenticated
   */
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      if (user?.vaitro === 'user') {
        router.push('/');
      } else {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, authLoading, router, user]);

  /**
   * Xử lý đăng ký
   */
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !matkhau || !ten || !confirmMatkhau) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (matkhau !== confirmMatkhau) {
      setError('Mật khẩu không khớp');
      return;
    }

    if (matkhau.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    try {
      setIsLoading(true);
      const response = await authService.register({
        email,
        matkhau,
        ten,
      });
      
      // Redirect to correct page based on role
      if (response.user.vaitro === 'user') {
        router.push('/');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi đăng ký. Vui lòng thử lại');
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-blue-500 to-cyan-400 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
          <div className="flex flex-col items-center">
            <Loader className="w-8 h-8 text-indigo-600 animate-spin" />
            <p className="mt-4 text-slate-600">Đang tải...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-blue-500 to-cyan-400 -z-10" />

      <div className="min-h-screen flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {/* Logo & Title */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Travel</h1>
            <p className="text-indigo-100 text-sm">
              Ứng dụng lập kế hoạch chuyến đi thông minh
            </p>
          </div>

          {/* Register Card */}
          <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
            {/* Card Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-8 py-6">
              <h2 className="text-2xl font-bold text-white">Đăng ký</h2>
              <p className="text-indigo-100 text-sm mt-1">
                Tạo tài khoản mới để bắt đầu
              </p>
            </div>

            {/* Card Content */}
            <div className="px-8 py-6">
              {/* Error Alert */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-800">Lỗi đăng ký</p>
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              )}

              {/* Register Form */}
              <form onSubmit={handleRegister} className="space-y-5">
                {/* Name Input */}
                <div>
                  <label htmlFor="ten" className="block text-sm font-medium text-slate-700 mb-2">
                    Tên của bạn
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      id="ten"
                      type="text"
                      value={ten}
                      onChange={(e) => setTen(e.target.value)}
                      placeholder="nhập tên đầy đủ"
                      className="w-full pl-10 pr-4 py-2.5 bg-white text-slate-900 placeholder-slate-400 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Email Input */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nhập email của bạn"
                      className="w-full pl-10 pr-4 py-2.5 bg-white text-slate-900 placeholder-slate-400 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <label htmlFor="matkhau" className="block text-sm font-medium text-slate-700 mb-2">
                    Mật khẩu
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      id="matkhau"
                      type="password"
                      value={matkhau}
                      onChange={(e) => setMatkhau(e.target.value)}
                      placeholder="nhập mật khẩu (tối thiểu 6 ký tự)"
                      className="w-full pl-10 pr-4 py-2.5 bg-white text-slate-900 placeholder-slate-400 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Confirm Password Input */}
                <div>
                  <label htmlFor="confirmMatkhau" className="block text-sm font-medium text-slate-700 mb-2">
                    Xác nhận mật khẩu
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      id="confirmMatkhau"
                      type="password"
                      value={confirmMatkhau}
                      onChange={(e) => setConfirmMatkhau(e.target.value)}
                      placeholder="nhập lại mật khẩu"
                      className="w-full pl-10 pr-4 py-2.5 bg-white text-slate-900 placeholder-slate-400 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Register Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold py-2.5 rounded-lg hover:from-indigo-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Đang đăng ký...
                    </>
                  ) : (
                    'Đăng ký'
                  )}
                </button>
              </form>
            </div>

            {/* Card Footer */}
            <div className="px-8 py-4 bg-slate-50 border-t border-slate-200">
              <p className="text-center text-slate-600 text-sm">
                Đã có tài khoản?{' '}
                <Link
                  href="/login"
                  className="text-indigo-600 hover:text-indigo-700 font-semibold"
                >
                  Đăng nhập
                </Link>
              </p>
            </div>
          </div>

          {/* Security note */}
          <div className="text-center mt-6 text-indigo-100 text-xs">
            <p>🔒 Thông tin của bạn được bảo vệ bằng mã hóa end-to-end</p>
          </div>
        </div>
      </div>
    </>
  );
}
