'use client';

import { useContext } from 'react';
import { ItineraryContext } from '../context/ItineraryContext';
import type { ItineraryContextType } from '../types/itinerary.types';

/**
 * useItinerary — Hook để truy cập Itinerary Context
 *
 * Sử dụng trong bất kỳ component nào cần đọc hoặc cập nhật lịch trình.
 * Phải được sử dụng bên trong <ItineraryProvider>.
 *
 * @example
 * const { itinerary, addPlaceToDay } = useItinerary();
 */
export function useItinerary(): ItineraryContextType {
  const context = useContext(ItineraryContext);
  if (!context) {
    throw new Error('useItinerary phải được sử dụng trong ItineraryProvider');
  }
  return context;
}
