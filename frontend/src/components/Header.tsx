'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Bell,
  Globe,
  LogOut,
  User,
  ChevronDown,
  Zap,
  Home,
} from 'lucide-react';
import { useAuth } from '@/features/auth';

/**
 * Header Component - Global header with user profile dropdown and notifications
 */
export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, isLoading } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [language, setLanguage] = useState<'vi' | 'en'>('vi');

  if (isLoading || !user) {
    return (
      <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-10 lg:left-64">
        <div className="px-6 h-full flex items-center justify-between">
          <div className="h-8 bg-slate-200 rounded animate-pulse w-32"></div>
          <div className="flex gap-4">
            <div className="h-8 w-8 bg-slate-200 rounded animate-pulse"></div>
            <div className="h-8 w-8 bg-slate-200 rounded animate-pulse"></div>
          </div>
        </div>
      </header>
    );
  }

  /**
   * Lấy breadcrumb từ pathname
   */
  const getBreadcrumb = () => {
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length === 0) return 'Dashboard';

    const lastSegment = segments[segments.length - 1];
    const breadcrumbMap: Record<string, string> = {
      dashboard: 'Dashboard',
      'my-trips': 'Chuyến đi của tôi',
      'my-tours': 'Các tour của tôi',
      'saved-places': 'Địa điểm yêu thích',
      'create-tour': 'Tạo tour',
      users: 'Quản lý người dùng',
      templates: 'Duyệt mẫu tour',
      statistics: 'Thống kê',
      profile: 'Hồ sơ',
      settings: 'Cài đặt',
      revenue: 'Doanh thu',
      explore: 'Khám phá',
    };

    return breadcrumbMap[lastSegment] || lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1);
  };

  /**
   * Xử lý đăng xuất
   */
  const handleLogout = () => {
    logout();
    router.push('/login');
    setIsProfileOpen(false);
  };

  /**
   * Xử lý thay đổi ngôn ngữ
   */
  const handleLanguageChange = (lang: 'vi' | 'en') => {
    setLanguage(lang);
    // Implement language change logic here
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-20 lg:left-64">
      <div className="px-6 h-full flex items-center justify-between">
        {/* Left: Breadcrumb */}
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-slate-900">
            {getBreadcrumb()}
          </h2>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-4">
          {/* Back to Home Button */}
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 px-3 py-1.5 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors text-xs font-bold border border-indigo-100"
          >
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline">Trang chủ</span>
          </button>

          {/* Notifications */}
          <button className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Language Selector */}
          <div className="relative group">
            <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1">
              <Globe className="w-5 h-5" />
              <span className="text-sm font-medium uppercase">{language}</span>
            </button>

            {/* Language Dropdown */}
            <div className="absolute right-0 top-full mt-0 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 bg-white border border-slate-200 rounded-lg shadow-lg z-50">
              <button
                onClick={() => handleLanguageChange('vi')}
                className={`block w-full text-left px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                  language === 'vi'
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                Tiếng Việt
              </button>
              <button
                onClick={() => handleLanguageChange('en')}
                className={`block w-full text-left px-4 py-2 text-sm font-medium rounded-b-lg transition-colors ${
                  language === 'en'
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                English
              </button>
            </div>
          </div>

          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.ten || 'User'}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">
                    {(user.ten || 'U').charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-slate-900 truncate max-w-[120px]">
                  {user.ten || 'User'}
                </p>
                <p className="text-xs text-slate-500 capitalize">{user.vaitro}</p>
              </div>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  isProfileOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Profile Dropdown Menu */}
            {isProfileOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-slate-200 rounded-lg shadow-lg z-50">
                {/* Profile Info */}
                <div className="px-4 py-3 border-b border-slate-200">
                  <p className="text-sm font-semibold text-slate-900">{user.ten || 'User'}</p>
                  <p className="text-xs text-slate-500 truncate">{user.email}</p>
                  <p className="text-xs text-slate-500 capitalize mt-1">
                    Vai trò: <span className="font-medium">{user.vaitro}</span>
                  </p>
                </div>

                {/* Menu Items */}
                <div className="py-2">
                  <button
                    onClick={() => {
                      router.push('/dashboard/profile');
                      setIsProfileOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    Hồ sơ
                  </button>

                  {user.vaitro === 'admin' && (
                    <button
                      onClick={() => {
                        router.push('/dashboard/statistics');
                        setIsProfileOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <Zap className="w-4 h-4" />
                      Xem thống kê
                    </button>
                  )}

                  {user.vaitro === 'local' && (
                    <button
                      onClick={() => {
                        router.push('/dashboard/revenue');
                        setIsProfileOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <Zap className="w-4 h-4" />
                      Xem doanh thu
                    </button>
                  )}
                </div>

                {/* Logout */}
                <div className="px-4 py-2 border-t border-slate-200">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Đăng xuất
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Close profile dropdown when clicking outside */}
      {isProfileOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsProfileOpen(false)}
        />
      )}
    </header>
  );
}
