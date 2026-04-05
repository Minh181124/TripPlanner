import apiClient from '@/shared/api/apiClient';

export interface AutocompletePrediction {
  description: string;
  matched_substrings: any[];
  place_id: string;
  reference: string;
  structured_formatting: {
    main_text: string;
    main_text_matched_substrings: any[];
    secondary_text: string;
  };
  has_children: boolean;
  plus_code: {
    compound_code: string;
    global_code: string;
  };
  terms: any[];
  types: string[];
}

export interface PlaceDetailRaw {
  place_id: string;
  name: string;
  formatted_address: string;
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

    // backend returns { predictions: [...] }
    const response = await apiClient.get<never, any>(`/map/autocomplete?${params.toString()}`);
    return response.predictions || [];
  },

  getAutocompletePlaceDetail: async (place_id: string): Promise<PlaceDetailRaw | null> => {
    // backend returns { result: { ... } }
    const response = await apiClient.get<never, any>(`/map/autocomplete-detail?place_id=${place_id}`);
    return response.result || null;
  }
};
