'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import apiClient from '@/shared/api/apiClient';
import axios from 'axios';
import type { RouteData } from '@/shared/types/common.types';

/** Giải mã chuỗi polyline sang [lng, lat] */
async function decodePolyline(encoded: string): Promise<[number, number][]> {
  const polylineLib = await import('@mapbox/polyline');
  const decoded: [number, number][] = polylineLib.decode(encoded);
  return decoded.map(([lat, lng]) => [lng, lat]);
}

/**
 * Validate và chuẩn hóa dữ liệu route từ Backend.
 */
function validateAndNormalizeRouteData(data: any): RouteData | null {
  if (!data || typeof data !== 'object') return null;

  const distance = data.tong_khoangcach ?? data.distance;
  const duration = data.tong_thoigian ?? data.duration;
  const polyline = data.polyline;

  if (typeof polyline !== 'string' || polyline.trim().length === 0) return null;
  if (typeof distance !== 'number' || isNaN(distance) || distance <= 0) return null;
  if (typeof duration !== 'number' || isNaN(duration) || duration <= 0) return null;

  return { polyline, tong_khoangcach: distance, tong_thoigian: duration };
}

const DEBOUNCE_MS = 500;

/**
 * useRoutePreview — Hook lấy và hiển thị previêw tuyến đường trên bản đồ.
 *
 * Sử dụng debounce để tránh gọi API quá nhiều khi user thay đổi places nhanh.
 * Hỗ trợ cancel request khi component unmount hoặc input thay đổi.
 *
 * @param googlePlaceIds - Danh sách Google Place IDs theo thứ tự
 * @param selectedPlaces - Objects chứa geometry.coordinates
 * @param profile - Phương tiện di chuyển
 */
export function useRoutePreview(
  googlePlaceIds: string[],
  selectedPlaces: any[] = [],
  profile: string = 'mapbox/driving-traffic'
) {
  const [coordinates, setCoordinates] = useState<[number, number][]>([]);
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchRoute = useCallback(async (ids: string[], places: any[], currentProfile: string) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    setError(null);

    try {
      const coords = places
        .filter(p => p?.geometry?.coordinates)
        .map(p => ({ lng: p.geometry.coordinates[0], lat: p.geometry.coordinates[1] }));

      const result = await apiClient.post('/places/route', {
        placeIds: ids,
        coordinates: coords,
        profile: currentProfile,
      }, { signal: controller.signal });

      const validatedRouteData = validateAndNormalizeRouteData(result);

      if (validatedRouteData && validatedRouteData.polyline) {
        const decodedCoords = await decodePolyline(validatedRouteData.polyline);
        setCoordinates(decodedCoords);
        setRouteData(validatedRouteData);
      } else {
        setError('Không thể xử lý dữ liệu tuyến đường');
        setCoordinates([]);
        setRouteData(null);
      }
    } catch (err: any) {
      if (axios.isCancel(err)) return;
      setError(err.message || 'Không thể tải tuyến đường');
      setCoordinates([]);
      setRouteData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (googlePlaceIds.length < 2) {
      setCoordinates([]);
      setRouteData(null);
      return;
    }

    timerRef.current = setTimeout(() => {
      fetchRoute(googlePlaceIds, selectedPlaces, profile);
    }, DEBOUNCE_MS);

    return () => clearTimeout(timerRef.current!);
  }, [googlePlaceIds.join(','), profile, fetchRoute]);

  return { coordinates, routeData, isLoading, error };
}
