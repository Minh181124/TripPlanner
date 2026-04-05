import { AdminPlaceTable } from '@/features/places/ui/AdminPlaceTable';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Quản lý Địa Điểm | Admin Dashboard',
  description: 'Trang kiểm duyệt và quản lý các địa điểm do người dùng đóng góp',
};

export default function PlacesManagementPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Quản lý địa điểm</h1>
        <p className="text-sm text-slate-500 mt-1">
          Duyệt tự động hoặc từ chối thông tin địa điểm do người dùng Local tải lên.
        </p>
      </div>
      
      {/* Component AdminPlaceTable tự quản lý state phân trang và query lọc */}
      <AdminPlaceTable />
    </div>
  );
}
