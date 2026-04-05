/**
 * features/auth/index.ts — Public API của Auth Feature
 *
 * QUY TẮC: Chỉ import từ file này khi sử dụng auth feature từ bên ngoài.
 * KHÔNG import trực tiếp từ các file bên trong feature này.
 */

// Provider & Hook
export { AuthProvider, useAuth } from './context/AuthContext';

// Services
export { authService } from './services/authService';
export { userService } from './services/userService';
export { itineraryAdminService } from './services/itineraryAdminService';
export type {
  UserProfile,
  PaginatedUsers,
  UpdateProfilePayload,
  ChangePasswordPayload,
  UpdateUserByAdminPayload,
} from './services/userService';
export type {
  Itinerary,
  ItineraryPlace,
  ItineraryListResponse,
  ItineraryMau,
} from './services/itineraryAdminService';

// Types (re-export từ shared để consumer không cần biết nguồn gốc)
export type { User, UserRole, AuthContextType } from '@/shared/types/auth.types';
