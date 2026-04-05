import { useState } from 'react';
import { placesApi } from '../api/places.api';
import type { CreatePlaceDto } from '../model/places.types';
import toast from 'react-hot-toast';

export function usePlaceActions() {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const submitPlace = async (data: CreatePlaceDto, onSuccess?: () => void) => {
    setIsSubmitting(true);
    try {
      await placesApi.createPlace(data);
      toast.success('Đã gửi thông tin địa điểm! Vui lòng chờ Admin duyệt.');
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi tạo địa điểm');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const approvePlace = async (id: number, onSuccess?: () => void) => {
    try {
      await placesApi.updatePlaceStatus(id, 'APPROVED');
      toast.success('Đã duyệt địa điểm thành công!');
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không thể duyệt địa điểm này');
    }
  };

  const rejectPlace = async (id: number, onSuccess?: () => void) => {
    try {
      await placesApi.updatePlaceStatus(id, 'REJECTED');
      toast.success('Đã từ chối địa điểm này!');
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không thể thao tác');
    }
  };

  return {
    isSubmitting,
    submitPlace,
    approvePlace,
    rejectPlace,
  };
}
