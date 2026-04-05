'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth';
import {
  MessageSquareWarning, Loader, AlertCircle, Clock, CheckCircle,
  XCircle, Eye, X, User, Calendar, ChevronDown, Filter,
} from 'lucide-react';

/**
 * Mock complaint data — sẽ thay bằng API thật sau khi backend có bảng khiếu nại
 */
interface Complaint {
  id: number;
  user_name: string;
  user_email: string;
  subject: string;
  content: string;
  category: 'tour' | 'place' | 'user' | 'system' | 'other';
  status: 'pending' | 'reviewing' | 'resolved' | 'rejected';
  created_at: string;
  updated_at: string;
}

const MOCK_COMPLAINTS: Complaint[] = [
  {
    id: 1,
    user_name: 'Nguyễn Văn An',
    user_email: 'an.nguyen@email.com',
    subject: 'Tour không đúng mô tả',
    content: 'Tour Hà Nội 3 ngày 2 đêm mô tả có đi Hạ Long nhưng thực tế không có. Tôi muốn khiếu nại về vấn đề này vì đã đặt chuyến đi dựa trên mô tả.',
    category: 'tour',
    status: 'pending',
    created_at: '2026-04-03T10:30:00',
    updated_at: '2026-04-03T10:30:00',
  },
  {
    id: 2,
    user_name: 'Trần Thị Bình',
    user_email: 'binh.tran@email.com',
    subject: 'Địa điểm đã đóng cửa',
    content: 'Địa điểm chùa Bái Đính đã tạm đóng cửa để tu sửa nhưng vẫn hiển thị trong app. Mong admin cập nhật trạng thái.',
    category: 'place',
    status: 'reviewing',
    created_at: '2026-04-02T14:15:00',
    updated_at: '2026-04-04T09:00:00',
  },
  {
    id: 3,
    user_name: 'Lê Minh Cường',
    user_email: 'cuong.le@email.com',
    subject: 'Local guide không chuyên nghiệp',
    content: 'Hướng dẫn viên địa phương Phạm Đức đã không đến đúng giờ và thiếu kiến thức về các địa điểm tham quan.',
    category: 'user',
    status: 'resolved',
    created_at: '2026-03-28T08:45:00',
    updated_at: '2026-04-01T16:30:00',
  },
  {
    id: 4,
    user_name: 'Phạm Hải Dương',
    user_email: 'duong.pham@email.com',
    subject: 'Lỗi ứng dụng khi lưu lịch trình',
    content: 'Khi cố lưu lịch trình với hơn 10 địa điểm, ứng dụng bị treo và mất dữ liệu đã nhập.',
    category: 'system',
    status: 'reviewing',
    created_at: '2026-04-01T11:20:00',
    updated_at: '2026-04-04T10:00:00',
  },
  {
    id: 5,
    user_name: 'Hoàng Thị Em',
    user_email: 'em.hoang@email.com',
    subject: 'Yêu cầu xóa tài khoản',
    content: 'Tôi muốn xóa tài khoản và tất cả dữ liệu cá nhân của mình khỏi hệ thống theo quyền privacy.',
    category: 'other',
    status: 'rejected',
    created_at: '2026-03-25T16:00:00',
    updated_at: '2026-03-27T09:15:00',
  },
];

const CATEGORY_MAP: Record<string, { label: string; color: string }> = {
  tour: { label: 'Tour', color: 'bg-blue-100 text-blue-700' },
  place: { label: 'Địa điểm', color: 'bg-green-100 text-green-700' },
  user: { label: 'Người dùng', color: 'bg-purple-100 text-purple-700' },
  system: { label: 'Hệ thống', color: 'bg-orange-100 text-orange-700' },
  other: { label: 'Khác', color: 'bg-gray-100 text-gray-700' },
};

const STATUS_MAP: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: 'Chờ xử lý', color: 'bg-yellow-100 text-yellow-700', icon: <Clock className="w-3.5 h-3.5" /> },
  reviewing: { label: 'Đang xem', color: 'bg-blue-100 text-blue-700', icon: <Eye className="w-3.5 h-3.5" /> },
  resolved: { label: 'Đã giải quyết', color: 'bg-green-100 text-green-700', icon: <CheckCircle className="w-3.5 h-3.5" /> },
  rejected: { label: 'Từ chối', color: 'bg-red-100 text-red-700', icon: <XCircle className="w-3.5 h-3.5" /> },
};

export default function AdminComplaintsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user?.vaitro !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (user?.vaitro !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-slate-700">Bạn không có quyền truy cập trang này</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <MessageSquareWarning className="w-10 h-10 text-amber-600" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900">Quản lý khiếu nại</h1>
        <p className="text-slate-600 mt-4 max-w-lg mx-auto">
          Tính năng đang được phát triển. Hệ thống sẽ sớm cập nhật khả năng tiếp nhận và xử lý khiếu nại từ người dùng.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-12 text-center">
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-sm font-semibold">
            <Clock className="w-4 h-4" />
            Sắp ra mắt
          </div>
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Đang thiết lập cơ sở dữ liệu</h2>
        <p className="text-slate-500 text-sm max-w-md mx-auto leading-relaxed">
          Chúng tôi đang hoàn thiện module Backend và Schema cơ sở dữ liệu để đảm bảo việc lưu trữ khiếu nại được bảo mật và chính xác.
        </p>
        
        <div className="mt-8 pt-8 border-t border-slate-50 grid grid-cols-3 gap-6">
          <div className="p-4 bg-slate-50 rounded-xl">
            <p className="text-lg font-bold text-slate-900">0</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Chờ xử lý</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl">
            <p className="text-lg font-bold text-slate-900">0</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Đang xem</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl">
            <p className="text-lg font-bold text-slate-900">0</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Đã giải quyết</p>
          </div>
        </div>
      </div>
    </div>
  );
}
