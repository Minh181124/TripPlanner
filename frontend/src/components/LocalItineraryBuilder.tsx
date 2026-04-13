'use client';

import { MultiDayPlanner } from './MultiDayPlanner';

interface LocalItineraryBuilderProps {
  editId?: number;
}

/**
 * LocalItineraryBuilder - Component for building local itineraries
 * Reuses MultiDayPlanner functionality
 */
export default function LocalItineraryBuilder({ editId }: LocalItineraryBuilderProps) {
  return <MultiDayPlanner editId={editId} />;
}
