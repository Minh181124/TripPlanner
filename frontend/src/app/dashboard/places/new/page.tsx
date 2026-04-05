import { PlaceForm } from '@/features/places/ui/PlaceForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Thêm Địa Điểm | Local Dashboard',
  description: 'Trang đóng góp thêm địa điểm mới cho người dùng Local',
};

export default function NewPlacePage() {
  return (
    <div className="space-y-6">
      {/* Component PlaceForm tự quản lý state form, validation và điều hướng */}
      <PlaceForm />
    </div>
  );
}
