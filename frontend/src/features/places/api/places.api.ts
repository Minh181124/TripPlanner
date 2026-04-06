import apiClient from '@/shared/api/apiClient';
import type { Place, PlacesResponse, CreatePlaceDto, PlaceStatus } from '../model/places.types';

export const placesApi = {
  getPlaces: async (params?: {
    page?: number;
    limit?: number;
    trang_thai?: PlaceStatus;
    keyword?: string;
  }): Promise<PlacesResponse> => {
    // Because apiClient automatically unwraps response.data.data
    // the returned data is directly the mapped object from our nestjs handler
    const response = await apiClient.get<never, PlacesResponse>('/places', { params });
    return response;
  },

  createPlace: async (data: CreatePlaceDto): Promise<Place> => {
    const response = await apiClient.post<never, Place>('/places', data);
    return response;
  },

  updatePlaceStatus: async (id: number, status: PlaceStatus): Promise<Place> => {
    const response = await apiClient.patch<never, Place>(`/places/${id}/status`, { status });
    return response;
  },

  updatePlaceFully: async (id: number, data: Partial<CreatePlaceDto>): Promise<Place> => {
    const response = await apiClient.put<never, Place>(`/places/${id}`, data);
    return response;
  },

  deletePlace: async (id: number): Promise<{ success: boolean; message?: string }> => {
    const response = await apiClient.delete<never, { success: boolean; message?: string }>(`/places/${id}`);
    return response;
  },
};
