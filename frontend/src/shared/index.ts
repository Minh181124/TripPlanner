/**
 * shared/index.ts — Public API của shared layer
 * Tất cả feature và app chỉ import từ '@/shared', không import trực tiếp file bên trong.
 */

// API client
export { default as apiClient } from './api/apiClient';

// Common types
export type {
  DiaDiem,
  ChiTietDiaDiem,
  HinhAnhDiaDiem,
  DanhGiaDiaDiem,
  LichTrinhLocal,
  LichTrinhLocalDiaDiem,
  LichTrinhNguoiDung,
  LichTrinhNguoiDungDiaDiem,
  RouteData,
  TuyenDuong,
  NguoiDung,
  SoThich,
  NguoiDungSoThich,
  LuuDiaDiem,
  MeoVatDiaDiem,
  RoutePreviewResponse,
  ItineraryPlaceInput,
  CreateItineraryPayload,
  CreateItineraryResponse,
} from './types/common.types';

// Auth types
export type {
  User,
  UserRole,
  AuthContextType,
  LoginRequest,
  AuthResponse,
} from './types/auth.types';

// Utilities
export { generateUUID } from './lib/uuid';

// Local itinerary types
export type {
  LocalPlaceItem,
  CreateLocalItineraryDto,
  UpdateLocalItineraryDto,
  SoThichItem,
  LocalItineraryPlace,
  LocalItinerary,
} from './types/local.types';
