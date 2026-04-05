/**
 * DTO cho request tìm kiếm địa điểm qua Mapbox Search Box API.
 */
export class SearchPlaceDto {
  keyword: string;
  session_token: string;
  lat?: number;
  lng?: number;
}

/**
 * DTO cho request lấy tuyến đường giữa các địa điểm.
 */
export class GetRouteDto {
  placeIds: string[];
  coordinates?: { lng: number; lat: number }[];
  profile?: string;
}

/**
 * DTO cho request tạo lịch trình mẫu (lichtrinh_local).
 */
export class CreateSampleItineraryDto {
  title: string;
  description: string;
  mapboxPlaceIds: string[];
}