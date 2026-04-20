'use client';

import { useState } from 'react';
import { sampleTripsApi } from '../api/sampleTripsApi';
import type { CreateSampleTripDto } from '../model/sampleTrips.types';
import toast from 'react-hot-toast';

/**
 * Hook cho các actions: tạo, sửa, xóa, duyệt, từ chối lịch trình mẫu
 * Pattern tương tự usePlaceActions
 */
export function useSampleTripActions() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  /** Tạo lịch trình mẫu mới */
  const createTrip = async (dto: CreateSampleTripDto, onSuccess?: () => void) => {
    setIsSubmitting(true);
    try {
      const result = await sampleTripsApi.create(dto);
      toast.success(result.message || 'Tạo lịch trình mẫu thành công!');
      onSuccess?.();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Lỗi khi tạo lịch trình mẫu');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  /** Cập nhật lịch trình mẫu */
  const updateTrip = async (id: number, dto: Partial<CreateSampleTripDto>, isAdmin: boolean = false, onSuccess?: () => void) => {
    setIsSubmitting(true);
    try {
      const result = isAdmin
        ? await sampleTripsApi.updateAdmin(id, dto)
        : await sampleTripsApi.update(id, dto);
      toast.success(result.message || 'Cập nhật thành công!');
      onSuccess?.();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Lỗi khi cập nhật');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  /** Xóa lịch trình mẫu */
  const deleteTrip = async (id: number, isAdmin: boolean = false, onSuccess?: () => void) => {
    try {
      const result = isAdmin
        ? await sampleTripsApi.deleteAdmin(id)
        : await sampleTripsApi.delete(id);
      toast.success(result.message || 'Xóa thành công!');
      onSuccess?.();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Lỗi khi xóa');
    }
  };

  /** [Admin] Duyệt lịch trình mẫu */
  const approveTrip = async (id: number, onSuccess?: () => void) => {
    try {
      const result = await sampleTripsApi.updateStatus(id, 'APPROVED');
      toast.success(result.message || 'Đã duyệt lịch trình mẫu!');
      onSuccess?.();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Lỗi khi duyệt');
    }
  };

  /** [Admin] Từ chối lịch trình mẫu */
  const rejectTrip = async (id: number, onSuccess?: () => void) => {
    try {
      const result = await sampleTripsApi.updateStatus(id, 'REJECTED');
      toast.success(result.message || 'Đã từ chối lịch trình mẫu!');
      onSuccess?.();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Lỗi khi từ chối');
    }
  };

  return {
    isSubmitting,
    createTrip,
    updateTrip,
    deleteTrip,
    approveTrip,
    rejectTrip,
  };
}
