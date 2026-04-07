'use client';

import React from 'react';
import { useAuth } from '@/features/auth';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';

/**
 * Dashboard Home Page - Main dashboard view
 */
export default function Dashboard() {
  const { user } = useAuth();

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Chào buổi sáng';
    if (hour < 17) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  };

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg p-8 shadow-lg">
        <h1 className="text-4xl font-bold mb-2">
          {getWelcomeMessage()}, {user?.ten || 'User'}! 👋
        </h1>
        <p className="text-indigo-100">
          {user?.vaitro === 'admin' && 'Bạn là quản trị viên'}
          {user?.vaitro === 'local' && 'Bạn là hướng dẫn địa phương'}
          {user?.vaitro === 'user' && 'Chúc bạn có một ngày tuyệt vời'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title={user?.vaitro === 'admin' ? 'Người dùng' : 'Chuyến đi'}
          value="24"
          icon={<AlertCircle className="w-6 h-6 text-indigo-600" />}
          color="indigo"
        />
        <StatCard
          title="Hoàn thành"
          value="12"
          icon={<CheckCircle className="w-6 h-6 text-green-600" />}
          color="green"
        />
        <StatCard
          title="Đang xử lý"
          value="8"
          icon={<Clock className="w-6 h-6 text-amber-600" />}
          color="amber"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(user?.vaitro === 'admin' || user?.vaitro === 'local') && (
          <QuickActionCard
            title="Tạo chuyến đi mới"
            description="Bắt đầu lập kế hoạch cho một chuyến đi tuyệt vời"
            buttonText="Tạo ngay"
            icon="✈️"
            href="/planner"
          />
        )}
        {(user?.vaitro === 'admin' || user?.vaitro === 'local') && (
          <QuickActionCard
            title="Xem thống kê"
            description="Xem chi tiết hoạt động và hiệu suất của bạn"
            buttonText="Xem thêm"
            icon="📊"
            href="/dashboard/statistics"
          />
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Hoạt động gần đây</h2>
        <div className="space-y-4">
          <ActivityItem
            icon="🗓️"
            title="Tour Hà Nội"
            description="Bạn đã tạo một tour mới"
            time="2 giờ trước"
          />
          <ActivityItem
            icon="👤"
            title="Cập nhật hồ sơ"
            description="Bạn đã cập nhật thông tin cá nhân"
            time="1 ngày trước"
          />
          <ActivityItem
            icon="❤️"
            title="Yêu thích địa điểm"
            description="Bạn đã yêu thích Chùa Tam Chúc"
            time="3 ngày trước"
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Stat Card Component
 */
function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}) {
  const colorMap = {
    indigo: 'bg-indigo-50 text-indigo-700',
    green: 'bg-green-50 text-green-700',
    amber: 'bg-amber-50 text-amber-700',
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-lg transition-shadow">
      <div className={`w-12 h-12 ${colorMap[color as keyof typeof colorMap]} rounded-lg flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <p className="text-sm text-slate-600 mb-2">{title}</p>
      <p className="text-3xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

/**
 * Quick Action Card Component
 */
function QuickActionCard({
  title,
  description,
  buttonText,
  icon,
  href,
}: {
  title: string;
  description: string;
  buttonText: string;
  icon: string;
  href?: string;
}) {
  const router = useRouter();
  
  const handleClick = () => {
    if (href) {
      router.push(href);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-2xl mb-2">{icon}</p>
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          <p className="text-sm text-slate-600 mt-2">{description}</p>
        </div>
      </div>
      <button 
        onClick={handleClick}
        className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors text-sm"
      >
        {buttonText}
      </button>
    </div>
  );
}

/**
 * Activity Item Component
 */
function ActivityItem({
  icon,
  title,
  description,
  time,
}: {
  icon: string;
  title: string;
  description: string;
  time: string;
}) {
  return (
    <div className="flex gap-4 pb-4 border-b border-slate-100 last:border-0 last:pb-0">
      <div className="text-2xl">{icon}</div>
      <div className="flex-1">
        <p className="font-medium text-slate-900">{title}</p>
        <p className="text-sm text-slate-600">{description}</p>
        <p className="text-xs text-slate-400 mt-1">{time}</p>
      </div>
    </div>
  );
}
