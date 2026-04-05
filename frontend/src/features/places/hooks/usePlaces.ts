import { useState, useEffect, useCallback } from 'react';
import { placesApi } from '../api/places.api';
import type { Place, PlaceStatus } from '../model/places.types';
import toast from 'react-hot-toast';

interface UsePlacesProps {
  initialPage?: number;
  initialLimit?: number;
  statusFilter?: PlaceStatus;
}

export function usePlaces({ initialPage = 1, initialLimit = 10, statusFilter }: UsePlacesProps = {}) {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(initialPage);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [status, setStatus] = useState<PlaceStatus | undefined>(statusFilter);

  const fetchPlaces = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await placesApi.getPlaces({ page, limit: initialLimit, trang_thai: status });
      setPlaces(data.items);
      setTotalPages(data.meta.totalPages || 1);
    } catch (err: any) {
      setError(err?.message || 'Có lỗi xảy ra khi tải danh sách địa điểm');
      toast.error('Lỗi khi tải danh sách địa điểm');
    } finally {
      setLoading(false);
    }
  }, [page, initialLimit, status]);

  useEffect(() => {
    fetchPlaces();
  }, [fetchPlaces]);

  return {
    places,
    loading,
    error,
    page,
    totalPages,
    setPage,
    status,
    setStatus,
    refresh: fetchPlaces,
  };
}
