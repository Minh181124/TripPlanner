'use client';

import { useCallback } from 'react';
import { useItinerary } from './useItinerary';
import apiClient from '@/shared/api/apiClient';
import { addMinutes, format, parse } from 'date-fns';
import type { StartLocation } from '../types/itinerary.types';

export interface TravelRoute {
  startIndex: number;
  endIndex: number;
  routes: {
    distance: number;   // Mét
    duration: number;   // Giây
    distanceText: string;
    durationText: string;
    overviewPolyline?: string;
  }[];
  selectedRouteIndex: number;
}

/**
 * useCalculateTimeline
 *
 * Hook tính toán timeline chi tiết (giờ đến, giờ đi, tuyến đường)
 * cho từng địa điểm trong một ngày của lịch trình.
 *
 * Khác với useItineraryStats (tính tổng khoảng cách đơn giản),
 * hook này gọi Goong Direction API để lấy multiple route alternatives
 * và cho phép người dùng chọn tuyến đường.
 */
export function useCalculateTimeline() {
  const { itinerary } = useItinerary();

  /**
   * Cộng phút vào time string (HH:mm)
   */
  const addMinutesToTimeString = (timeStr: string, minutes: number): string => {
    try {
      const baseDate = parse('2000-01-01', 'yyyy-MM-dd', new Date());
      const time = parse(timeStr, 'HH:mm', baseDate);
      const resultDate = addMinutes(time, minutes);
      
      // Giới hạn thời gian kết thúc không vượt quá 23:59
      if (resultDate.getDate() !== time.getDate() || resultDate.getTime() < time.getTime()) {
        return '23:59';
      }
      
      return format(resultDate, 'HH:mm');
    } catch {
      console.error('Error adding minutes:', { timeStr, minutes });
      return timeStr;
    }
  };

  /**
   * Tính độ chênh lệch phút giữa 2 thời điểm
   */
  const getMinuteDifference = (time1: string, time2: string): number => {
    try {
      const baseDate = parse('2000-01-01', 'yyyy-MM-dd', new Date());
      const date1 = parse(time1, 'HH:mm', baseDate);
      const date2 = parse(time2, 'HH:mm', baseDate);
      return Math.floor((date2.getTime() - date1.getTime()) / (1000 * 60));
    } catch {
      return 0;
    }
  };

  /**
   * Gọi Goong Direction API để lấy tuyến đường giữa 2 điểm
   */
  const getDirectionRoutes = useCallback(
    async (
      originLat: number,
      originLng: number,
      destLat: number,
      destLng: number,
      alternatives: boolean = true,
      vehicle: string = 'car'
    ): Promise<TravelRoute['routes']> => {
      if (!originLat || !originLng || !destLat || !destLng) {
        console.warn('[useCalculateTimeline] Invalid coordinates:', { originLat, originLng, destLat, destLng });
        return [];
      }

      try {
        const response: any = await apiClient.get('/map/direction', {
          params: {
            origin: `${originLat},${originLng}`,
            destination: `${destLat},${destLng}`,
            alternatives,
            vehicle,
          },
        });

        if (!response?.routes || response.routes.length === 0) {
          return [];
        }

        return response.routes.map((route: any) => ({
          distance: route.distance || 0,
          duration: route.duration || 0,
          distanceText: route.distanceText || '',
          durationText: route.durationText || '',
          overviewPolyline: route.overviewPolyline?.points || route.overviewPolyline,
        }));
      } catch (error) {
        console.error('[useCalculateTimeline] Direction API error:', error);
        return [];
      }
    },
    []
  );

  /**
   * Tính toán timeline cho một ngày:
   * - Gọi Direction API cho từng cặp điểm liên tiếp
   * - Tính arrivalTime và departureTime cho mỗi địa điểm
   * - Trả về mảng TravelRoute để vẽ lên bản đồ
   *
   * @param dayNumber - Số thứ tự ngày (1-based)
   */
  const calculateTimeline = useCallback(
    async (dayNumber: number, transportModes: Record<number, string> = {}): Promise<TravelRoute[]> => {
      console.log(`[useCalculateTimeline] 🕐 Calculating timeline for day ${dayNumber}`);

      const dayData = itinerary.days[dayNumber - 1];
      if (!dayData) return [];
      
      const hasPlaces = dayData.places && dayData.places.length > 0;
      if (!hasPlaces && !dayData.endLocation) {
        return [];
      }

      const startTime = dayData.startTime || '08:00';
      const startLocation: StartLocation = dayData.startLocation || (hasPlaces ? {
        name: 'Starting Point',
        lat: dayData.places[0].lat,
        lng: dayData.places[0].lng,
      } : { name: 'Unknown', lat: 21.0285, lng: 105.8542 });

      const travelRoutes: TravelRoute[] = [];
      let currentTime = startTime;
      let prevLocation = startLocation;

      for (let i = 0; i < dayData.places.length; i++) {
        const place = dayData.places[i];
        const vehicle = transportModes[i] || 'car';

        try {
          const routes = await getDirectionRoutes(
            prevLocation.lat,
            prevLocation.lng,
            place.lat,
            place.lng,
            true,
            vehicle
          );

          if (routes.length > 0) {
            const selectedRoute = routes[0];
            const travelDurationMinutes = Math.ceil(selectedRoute.duration / 60);

            const arrivalTime = addMinutesToTimeString(currentTime, travelDurationMinutes);
            place.arrivalTime = arrivalTime;

            const stayDuration = place.stayDuration || 60;
            place.stayDuration = stayDuration;

            const departureTime = addMinutesToTimeString(arrivalTime, stayDuration);
            place.departureTime = departureTime;

            travelRoutes.push({
              startIndex: i,
              endIndex: i + 1,
              routes,
              selectedRouteIndex: 0,
            });

            currentTime = departureTime;
            prevLocation = { name: place.ten, lat: place.lat, lng: place.lng };
          } else {
            // Fallback: không có route
            place.arrivalTime = currentTime;
            place.stayDuration = place.stayDuration || 60;
            place.departureTime = addMinutesToTimeString(currentTime, place.stayDuration);
            currentTime = place.departureTime;
          }
        } catch (error) {
          console.error(`[useCalculateTimeline] Error for place ${place.ten}:`, error);
        }
      }

      // Calculate final route back to endLocation if configured
      if (dayData.endLocation && startLocation) {
        const placesCount = dayData.places?.length || 0;
        const vehicle = transportModes[placesCount] || 'car';
        try {
          const routes = await getDirectionRoutes(
            prevLocation.lat,
            prevLocation.lng,
            dayData.endLocation.lat,
            dayData.endLocation.lng,
            true,
            vehicle
          );

          if (routes.length > 0) {
            travelRoutes.push({
              startIndex: placesCount,
              endIndex: placesCount + 1,
              routes,
              selectedRouteIndex: 0,
            });
            
            // Note: We don't update departureTime here because end location is the final stop.
            // The time arrived at endLocation would technically be `addMinutesToTimeString(currentTime, travelDurationMinutes)`
          }
        } catch (error) {
          console.error(`[useCalculateTimeline] Error calculating route to end location:`, error);
        }
      }

      return travelRoutes;
    },
    [itinerary.days, getDirectionRoutes]
  );

  /**
   * Tính lại timeline sau khi user thay đổi stayDuration của một địa điểm.
   * Không gọi API — chỉ tính lại dựa trên thời gian đã có.
   */
  const recalculateAfterStayDurationChange = useCallback(
    (dayNumber: number, changedInstanceId: string) => {
      const dayData = itinerary.days[dayNumber - 1];
      if (!dayData) return;

      const startTime = dayData.startTime || '08:00';
      let currentTime = startTime;

      for (const place of dayData.places) {
        if (!place.arrivalTime) continue;

        if (place.instanceId === changedInstanceId) {
          const stayDuration = place.stayDuration || 60;
          place.departureTime = addMinutesToTimeString(place.arrivalTime, stayDuration);
          currentTime = place.departureTime;
        } else {
          place.arrivalTime = currentTime;
          const stayDuration = place.stayDuration || 60;
          place.departureTime = addMinutesToTimeString(currentTime, stayDuration);
          currentTime = place.departureTime;
        }
      }
    },
    [itinerary.days]
  );

  /**
   * Chuyển sang tuyến đường thay thế (alternative route)
   * TODO: Tính lại timeline với tuyến đường mới
   */
  const switchToAlternativeRoute = useCallback(
    async (dayNumber: number, travelRouteIndex: number, newSelectedRouteIndex: number) => {
      console.log(
        `[useCalculateTimeline] 🔀 Switch to route ${newSelectedRouteIndex} for segment ${travelRouteIndex}`
      );
      // TODO: Re-calculate timeline with new route
    },
    [itinerary.days]
  );

  return {
    calculateTimeline,
    recalculateAfterStayDurationChange,
    switchToAlternativeRoute,
    addMinutesToTimeString,
    getMinuteDifference,
  };
}
