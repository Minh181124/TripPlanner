'use client';

import { useItinerary } from '@/features/itinerary';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function DayTabs() {
  const { itinerary, setCurrentDay } = useItinerary();

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2">
      {Array.from({ length: itinerary.so_ngay }, (_, i) => i + 1).map((day) => (
        <button
          key={day}
          onClick={() => setCurrentDay(day)}
          className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
            itinerary.currentDay === day
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Ngày {day}
          {itinerary.days[day - 1]?.places.length > 0 && (
            <span className="ml-2 text-sm">({itinerary.days[day - 1].places.length})</span>
          )}
        </button>
      ))}
    </div>
  );
}
