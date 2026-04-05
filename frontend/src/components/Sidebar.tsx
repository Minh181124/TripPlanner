'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Menu,
  X,
  LayoutDashboard,
  Users,
  MapPin,
  BarChart3,
  UserCircle,
  Map,
  Package,
  TrendingUp,
  LogOut,
  ChevronDown,
  Compass,
  Heart,
  Settings,
} from 'lucide-react';
import { useAuth } from '@/features/auth';

/**
 * Menu item interface
 */
interface MenuItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
}

/**
 * Sidebar Component - Dynamic navigation based on user role
 */
export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, isLoading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="w-64 bg-slate-900 text-white p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-700 rounded w-3/4"></div>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 bg-slate-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  /**
   * Lấy menu items dựa trên vai trò người dùng
   */
  const getMenuItems = (): MenuItem[] => {
    const commonItems: MenuItem[] = [
      {
        label: 'Hồ sơ',
        href: '/dashboard/profile',
        icon: <UserCircle className="w-5 h-5" />,
      },
    ];

    const roleItems: MenuItem[] = [];

    switch (user.vaitro) {
      case 'admin':
        roleItems.push(
          {
            label: 'Dashboard',
            href: '/dashboard',
            icon: <LayoutDashboard className="w-5 h-5" />,
          },
          {
            label: 'Quản lý người dùng',
            href: '/dashboard/users',
            icon: <Users className="w-5 h-5" />,
          },
          {
            label: 'Duyệt mẫu tour',
            href: '/dashboard/templates',
            icon: <MapPin className="w-5 h-5" />,
          },
          {
            label: 'Kiểm duyệt địa điểm local',
            href: '/dashboard/places',
            icon: <MapPin className="w-5 h-5" />,
          },
          {
            label: 'Quản lý địa điểm',
            href: '/dashboard/manage-places',
            icon: <MapPin className="w-5 h-5" />,
          },
          {
            label: 'Thống kê',
            href: '/dashboard/statistics',
            icon: <BarChart3 className="w-5 h-5" />,
          }
        );
        break;

      case 'local':
        roleItems.push(
          {
            label: 'Tạo tour',
            href: '/dashboard/create-tour',
            icon: <Map className="w-5 h-5" />,
          },
          {
            label: 'Các tour của tôi',
            href: '/dashboard/my-tours',
            icon: <Package className="w-5 h-5" />,
          },
          {
            label: 'Đóng góp địa điểm',
            href: '/dashboard/places/new',
            icon: <MapPin className="w-5 h-5" />,
          },
          {
            label: 'Doanh thu',
            href: '/dashboard/revenue',
            icon: <TrendingUp className="w-5 h-5" />,
            badge: 'New',
          }
        );
        break;

      case 'user':
      default:
        roleItems.push(
          {
            label: 'Khám phá',
            href: '/explore',
            icon: <Compass className="w-5 h-5" />,
          },
          {
            label: 'Chuyến đi của tôi',
            href: '/dashboard/my-trips',
            icon: <Map className="w-5 h-5" />,
          },
          {
            label: 'Địa điểm yêu thích',
            href: '/dashboard/saved-places',
            icon: <Heart className="w-5 h-5" />,
          },
          {
            label: 'Cài đặt',
            href: '/dashboard/settings',
            icon: <Settings className="w-5 h-5" />,
          }
        );
        break;
    }

    return [...commonItems, ...roleItems];
  };

  const menuItems = getMenuItems();

  /**
   * Kiểm tra nếu link hiện tại active
   */
  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/');
  };

  /**
   * Xử lý đăng xuất
   */
  const handleLogout = () => {
    logout();
    router.push('/login');
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-40 p-2 text-white bg-slate-900 rounded-lg lg:hidden hover:bg-slate-800"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-slate-900 text-white z-30 transform transition-transform duration-300 ease-in-out overflow-y-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo / Brand */}
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-2xl font-bold text-indigo-400">Travel</h1>
          <p className="text-sm text-slate-400 mt-1">Ứng dụng lập kế hoạch chuyến đi</p>
        </div>

        {/* User Profile Section */}
        <div className="p-4 border-b border-slate-700">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <div className="flex items-center gap-3 flex-1">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.ten || 'User'}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center">
                  <span className="text-sm font-bold">
                    {(user.ten || 'U').charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="text-left">
                <p className="text-sm font-medium truncate">{user.ten || 'User'}</p>
                <p className="text-xs text-slate-400 capitalize">{user.vaitro}</p>
              </div>
            </div>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                isProfileOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Profile Dropdown */}
          {isProfileOpen && (
            <div className="mt-2 pt-2 border-t border-slate-700 space-y-1">
              <Link
                href="/dashboard/profile"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <UserCircle className="w-4 h-4" />
                Hồ sơ
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Đăng xuất
              </button>
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={`flex items-center justify-between px-4 py-3 rounded-lg transition-colors
                ${
                  isActive(item.href)
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800'
                }
              `}
            >
              <div className="flex items-center gap-3">
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </div>
              {item.badge && (
                <span className="px-2 py-1 text-xs font-semibold bg-indigo-600 rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}
