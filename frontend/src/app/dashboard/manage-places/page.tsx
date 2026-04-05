import { ManagePlacesTable } from '@/features/places/ui/ManagePlacesTable';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Quản lý toàn diện Địa Điểm | Admin Dashboard',
  description: 'Trang quản lý toàn diện (Thêm, Sửa, Xóa) các địa điểm trong hệ thống',
};

export default function PlacesFullManagementPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Quản lý địa điểm</h1>
        <p className="text-sm text-slate-500 mt-1">
          Toàn quyền quản trị danh sách địa điểm: Xem chi tiết, thêm mới, sửa đổi thông tin và xóa.
        </p>
      </div>
      
      <ManagePlacesTable />
    </div>
  );
}
