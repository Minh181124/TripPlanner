import { LocalSampleTripsTable } from '@/features/sample-trips/ui/LocalSampleTripsTable';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Lịch Trình Mẫu Của Tôi | Local Dashboard',
  description: 'Trang quản lý các lịch trình mẫu bạn đã tạo',
};

export default function LocalsTripsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Lịch Trình Mẫu Của Tôi</h1>
        <p className="text-sm text-slate-500 mt-1">
          Tạo và quản lý lịch trình mẫu. Mọi thao tác tạo mới, chỉnh sửa hoặc xóa đều cần Admin duyệt.
        </p>
      </div>
      
      <LocalSampleTripsTable />
    </div>
  );
}
