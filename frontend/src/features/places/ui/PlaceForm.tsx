'use client';

import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { usePlaceActions } from '../hooks/usePlaceActions';
import type { CreatePlaceDto } from '../model/places.types';
import { MapPin, Save, List } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function PlaceForm() {
  const { submitPlace, isSubmitting } = usePlaceActions();
  const router = useRouter();
  
  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<CreatePlaceDto>({
    defaultValues: {
      ten: '',
      diachi: '',
      loai: 'poi',
      lat: undefined,
      lng: undefined,
    }
  });

  const onSubmit = async (data: CreatePlaceDto) => {
    // Process string to numbers
    const payload = {
      ...data,
      lat: data.lat ? Number(data.lat) : undefined,
      lng: data.lng ? Number(data.lng) : undefined,
    };
    
    await submitPlace(payload, () => {
      reset();
      router.push('/dashboard/places');
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-sm border border-slate-200">
      <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
          <MapPin size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Đóng Góp Địa Điểm Mới</h2>
          <p className="text-sm text-slate-500">Giúp hệ thống phong phú hơn bằng cách cung cấp thông tin chính xác.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Tên địa điểm <span className="text-red-500">*</span></label>
            <input 
              {...register('ten', { required: 'Tên địa điểm không được để trống' })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              placeholder="VD: Chợ Bến Thành"
            />
            {errors.ten && <p className="text-red-500 text-xs mt-1">{errors.ten.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Địa chỉ</label>
            <input 
              {...register('diachi')}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              placeholder="Nhập địa chỉ đầy đủ"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Loại hình</label>
              <select 
                {...register('loai')}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white transition-all"
              >
                <option value="poi">Điểm tham quan</option>
                <option value="restaurant">Nhà hàng</option>
                <option value="hotel">Khách sạn</option>
                <option value="cafe">Quán Cafe</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Khu vực (Quận/Huyện)</label>
              <input 
                {...register('quan_huyen')}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="VD: Quận 1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Vĩ độ (Lat)</label>
              <input 
                type="number" step="any"
                {...register('lat')}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="VD: 10.823"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Kinh độ (Lng)</label>
              <input 
                type="number" step="any"
                {...register('lng')}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="VD: 106.629"
              />
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex gap-3 justify-end">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
            ) : <Save size={18} />}
            <span>{isSubmitting ? 'Đang gửi...' : 'Gửi yêu cầu'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
