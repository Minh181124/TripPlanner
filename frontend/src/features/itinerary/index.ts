/**
 * features/itinerary/index.ts — Public API của Itinerary Feature
 *
 * QUY TẮC: Mọi import từ itinerary feature ở bên ngoài PHẢI đi qua file này.
 * Không import trực tiếp từ context/, hooks/, services/, types/ bên trong.
 *
 * @example
 * // ✅ Đúng
 * import { ItineraryProvider, useItinerary, PlaceItem } from '@/features/itinerary';
 *
 * // ❌ Sai
 * import { useItinerary } from '@/features/itinerary/hooks/useItinerary';
 */

// Context & Provider
export { ItineraryProvider } from './context/ItineraryContext';

// Components
export { PlanDetailEditor } from './components/PlanDetailEditor';

// Consumer hooks
export { useItinerary } from './hooks/useItinerary';
export { useItineraryStats } from './hooks/useItineraryStats';
export { useCalculateTimeline } from './hooks/useCalculateTimeline';
export type { TravelRoute } from './hooks/useCalculateTimeline';

// Service
export { itineraryService } from './services/itineraryService';

// Types — tất cả external consumers cần
export type {
  PlaceItem,
  StartLocation,
  DayItinerary,
  MultiDayItinerary,
  ItineraryContextType,
} from './types/itinerary.types';
