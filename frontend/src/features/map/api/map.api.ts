import apiClient from '@/shared/api/apiClient';

export interface AutocompletePrediction {
  place_id: string;
  description: string;
  main_text: string;
  secondary_text: string;
  district?: string;
  lat: number | null;
  lng: number | null;
  ten: string;
  diachi: string;
}

export interface PlaceDetailRaw {
  place_id: string;
  name: string;
  formatted_address: string;
  address_components?: Array<{
    long_name: string;
    short_name: string;
    types: string[];
  }>;
  geometry: {
    location: {
      lat: number;
      lng: number;
    }
  };
  types?: string[];
  formatted_phone_number?: string;
  website?: string;
  opening_hours?: {
    open_now?: boolean;
    weekday_text?: string[];
  };
  photos?: Array<{
    photo_reference: string;
    height?: number;
    width?: number;
  }>;
}

export const mapApi = {
  autocomplete: async (input: string, lat?: number, lng?: number): Promise<AutocompletePrediction[]> => {
    // Gọi Map Controller (NestJS proxy)
    const params = new URLSearchParams({ input });
    if (lat) params.append('lat', lat.toString());
    if (lng) params.append('lng', lng.toString());

    // backend MapService maps response into an array directly
    const response = await apiClient.get<never, any>(`/map/autocomplete?${params.toString()}`);
    return Array.isArray(response) ? response : [];
  },

  getAutocompletePlaceDetail: async (place_id: string): Promise<PlaceDetailRaw | null> => {
    // backend returns { result: { ... } }
    const response = await apiClient.get<never, any>(`/map/autocomplete-detail?place_id=${place_id}`);
    return response.result || null;
  }
};
