'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth';
import Link from 'next/link';
import {
  Compass,
  MapPin,
  Users,
  Zap,
  ArrowRight,
} from 'lucide-react';

/**
 * Home Page - Landing page or redirect to dashboard
 */
export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-blue-500 to-cyan-400 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg font-medium">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-indigo-600">
            Travel
          </Link>
          <div className="flex gap-4">
            <Link
              href="/login"
              className="px-6 py-2 text-slate-700 hover:text-slate-900 font-medium transition-colors"
            >
              Đăng nhập
            </Link>
            <Link
              href="/register"
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors"
            >
              Đăng ký
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-indigo-50 via-white to-blue-50 py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
            Khám phá thế giới với{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
              Travel
            </span>
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            Ứng dụng lập kế hoạch chuyến đi thông minh giúp bạn tạo những hành trình kỳ diệu
            với các địa điểm địa phương yêu thích
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/login"
              className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold transition-colors flex items-center gap-2"
            >
              Bắt đầu ngay <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="#features"
              className="px-8 py-3 border-2 border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 font-semibold transition-colors"
            >
              Tìm hiểu thêm
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-slate-900 text-center mb-16">
            Tính năng nổi bật
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 bg-white rounded-lg border border-slate-200 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <Compass className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Khám phá</h3>
              <p className="text-slate-600">
                Duyệt qua hàng nghìn tour du lịch được tạo bởi những người địa phương
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 bg-white rounded-lg border border-slate-200 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Tạo kế hoạch</h3>
              <p className="text-slate-600">
                Lập kế hoạch chuyến đi của bạn với nhà cây tương tác và quản lý thời gian
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 bg-white rounded-lg border border-slate-200 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-cyan-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Kết nối</h3>
              <p className="text-slate-600">
                Kết nối với hướng dẫn địa phương và nhận tư vấn chuyên nghiệp
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-8 bg-white rounded-lg border border-slate-200 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Nhanh chóng</h3>
              <p className="text-slate-600">
                Tạo và chia sẻ kế hoạch chuyến đi chỉ trong vài phút
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-8 bg-white rounded-lg border border-slate-200 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
                <Compass className="w-6 h-6 text-pink-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Dễ sử dụng</h3>
              <p className="text-slate-600">
                Giao diện trực quan và dễ sử dụng cho tất cả mọi người
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-8 bg-white rounded-lg border border-slate-200 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Cộng đồng</h3>
              <p className="text-slate-600">
                Tham gia cộng đồng du khách và chia sẻ trải nghiệm của bạn
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-indigo-600 to-blue-600 py-16 px-6">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl font-bold mb-4">Sẵn sàng bắt đầu hành trình?</h2>
          <p className="text-lg mb-8 opacity-90">
            Tham gia hàng triệu du khách khác trong việc khám phá thế giới
          </p>
          <Link
            href="/login"
            className="px-8 py-3 bg-white text-indigo-600 rounded-lg hover:bg-slate-100 font-semibold transition-colors inline-flex items-center gap-2"
          >
            Bắt đầu ngay <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-white font-bold mb-4">Travel</h3>
            <p className="text-sm">Ứng dụng lập kế hoạch chuyến đi thông minh</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Sản phẩm</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Tính năng
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Giá cả
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Bảo mật
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Công ty</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Về chúng tôi
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Việc làm
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Liên hệ
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Pháp lý</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Điều khoản
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Riêng tư
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Cookie
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-700 pt-8 text-center text-sm">
          <p>&copy; 2025 Travel. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}