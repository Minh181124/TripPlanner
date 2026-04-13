'use client';

import { useEffect } from 'react';
import { useItinerary } from './useItinerary';
import apiClient from '@/shared/api/apiClient';
import type { PlaceItem } from '../types/itinerary.types';

/**
 * useItineraryStats
 *
 * Hook tập trung tất cả logic tính toán thống kê và validation cho lịch trình.
 *
 * Responsibilities:
 *  - Tự động tính khoảng cách + thời gian cho từng ngày khi places thay đổi
 *    (logic từ useCalculateDayStats cũ)
 *  - Cung cấp hàm validate trước khi lưu
 *  - Cung cấp getTotalStats tổng hợp toàn bộ chuyến đi
 *
 * @example
 * // Kích hoạt auto-calculation (dùng trong MultiDayPlanner)
 * useItineraryStats();
 */
export function useItineraryStats() {
  const { itinerary, updateDayStats } = useItinerary();

  // Fingerprint để nhận diện thay đổi thực sự trong danh sách địa điểm (vị trí, thứ tự, thời gian ở lại)
  // giúp tránh vòng lặp vô tận khi updateDayStats làm itinerary.days thay đổi reference.
  const placesFingerprint = JSON.stringify(
    itinerary.days.map((day) =>
      day.places.map((p) => ({
        id: p.instanceId,
        lat: p.lat,
        lng: p.lng,
        stay: p.stayDuration ?? p.thoiluong ?? 60,
      }))
    )
  );

  // Auto-calculate stats cho tất cả ngày khi places thực sự thay đổi
  useEffect(() => {
    itinerary.days.forEach((day, dayIndex) => {
      if (day.places.length > 0) {
        calculateAndUpdateDayStats(dayIndex + 1, day.places);
      } else {
        updateDayStats(dayIndex + 1, {
          tong_khoangcach: 0,
          tong_thoigian: 0,
        });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placesFingerprint, updateDayStats]);

  /**
   * Tính khoảng cách và thời gian cho một ngày cụ thể
   * bằng cách gọi API distance-matrix theo từng segment.
   */
  const calculateAndUpdateDayStats = async (day: number, places: PlaceItem[]) => {
    if (places.length === 0) {
      updateDayStats(day, { tong_khoangcach: 0, tong_thoigian: 0 });
      return;
    }

    if (places.length === 1) {
      updateDayStats(day, {
        tong_khoangcach: 0,
        tong_thoigian: places[0].thoiluong || 0,
      });
      return;
    }

    try {
      let totalDistance = 0;
      let totalTime = 0;

      // Tính distance cho từng segment: place[i] → place[i+1]
      for (let i = 0; i < places.length - 1; i++) {
        const currentPlace = places[i];
        const nextPlace = places[i + 1];

        // Delay trước mỗi segment (trừ segment đầu tiên) để tránh 429 Too Many Requests
        if (i > 0) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }

        try {
          const response: any = await apiClient.get('/map/distance-matrix', {
            params: {
              origins: `${currentPlace.lat},${currentPlace.lng}`,
              destinations: `${nextPlace.lat},${nextPlace.lng}`,
              vehicle: 'car',
            },
          });

          if (response && response.length > 0) {
            const data = response[0];
            totalDistance += Number(data.distance) || 0;
            totalTime += Number(data.duration) || 0;
          }
        } catch (error: any) {
          // Warning thay vì error — không crash UI
          const statusCode = error?.response?.status;
          if (statusCode === 429) {
            console.warn(`[useItineraryStats] ⚠️ Too many requests — bỏ qua segment ${i}→${i + 1}`);
          } else {
            console.warn(`[useItineraryStats] ⚠️ Lỗi tính khoảng cách segment ${i}→${i + 1}:`, error?.message || error);
          }
        }
      }

      // Cộng thêm thời gian ở mỗi địa điểm
      const placeTimings = places.reduce((sum, place) => sum + (place.thoiluong || 0), 0);
      totalTime += placeTimings;

      console.log(`[useItineraryStats] 📊 Day ${day}:`, {
        totalDistance: `${(totalDistance / 1000).toFixed(1)} km`,
        totalTime: `${Math.floor(totalTime / 60)}h ${totalTime % 60}m`,
      });

      updateDayStats(day, {
        tong_khoangcach: totalDistance,
        tong_thoigian: totalTime,
      });
    } catch (error) {
      console.error(`[useItineraryStats] Error updating stats for day ${day}:`, error);
    }
  };
}
