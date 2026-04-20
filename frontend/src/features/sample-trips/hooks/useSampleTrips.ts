'use client';

import { useState, useEffect, useCallback } from 'react';
import { sampleTripsApi } from '../api/sampleTripsApi';
import type { SampleTrip, SampleTripStatus } from '../model/sampleTrips.types';

interface UseSampleTripsOptions {
  initialLimit?: number;
  /** true = dùng endpoint /me (local), false = dùng endpoint /admin/all */
  mine?: boolean;
  /** Filter theo trạng thái (chỉ dùng cho admin) */
  statusFilter?: SampleTripStatus;
}

export function useSampleTrips(options: UseSampleTripsOptions = {}) {
  const { initialLimit = 10, mine = false, statusFilter } = options;

  const [trips, setTrips] = useState<SampleTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState<SampleTripStatus | undefined>(statusFilter);

  const fetchTrips = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let result;
      if (mine) {
        result = await sampleTripsApi.getMine({ page, limit: initialLimit });
      } else {
        result = await sampleTripsApi.getAllAdmin({ page, limit: initialLimit, trang_thai: status });
      }
      setTrips(result.data || []);
      setTotalPages(result.pagination?.pages || 1);
      setTotal(result.pagination?.total || 0);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Lỗi tải dữ liệu');
      setTrips([]);
    } finally {
      setLoading(false);
    }
  }, [page, initialLimit, mine, status]);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  const refresh = useCallback(() => {
    fetchTrips();
  }, [fetchTrips]);

  return {
    trips,
    loading,
    error,
    page,
    totalPages,
    total,
    setPage,
    status,
    setStatus,
    refresh,
  };
}
