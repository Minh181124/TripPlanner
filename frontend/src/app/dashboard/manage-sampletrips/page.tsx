import { AdminSampleTripsTable } from '@/features/sample-trips/ui/AdminSampleTripsTable';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Quản lý Lịch Trình Mẫu | Admin Dashboard',
  description: 'Trang quản lý toàn diện lịch trình mẫu: duyệt, thêm, sửa, xóa',
};

export default function ManageSampleTripsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Quản lý Lịch Trình Mẫu</h1>
        <p className="text-sm text-slate-500 mt-1">
          Duyệt các lịch trình mẫu từ hướng dẫn viên địa phương, thêm mới, chỉnh sửa và xóa.
        </p>
      </div>
      
      <AdminSampleTripsTable />
    </div>
  );
}
