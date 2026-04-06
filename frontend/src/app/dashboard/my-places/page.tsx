import { MyPlacesTable } from '@/features/places/ui/MyPlacesTable';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Địa Điểm Của Tôi | Local Dashboard',
  description: 'Trang quản lý các địa điểm bạn đã đóng góp cho hệ thống',
};

export default function MyPlacesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Địa Điểm Của Tôi</h1>
        <p className="text-sm text-slate-500 mt-1">
          Quá trình đóng góp của bạn. Bạn có thể thêm, sửa đổi (chờ duyệt lại) hoặc gửi yêu cầu xóa các địa điểm này.
        </p>
      </div>
      
      <MyPlacesTable />
    </div>
  );
}
