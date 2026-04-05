'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type {
  MultiDayItinerary,
  DayItinerary,
  PlaceItem,
  StartLocation,
  ItineraryContextType,
} from '../types/itinerary.types';

// ---------------------------------------------------------------------------
// Context Definition
// ---------------------------------------------------------------------------

export const ItineraryContext = createContext<ItineraryContextType | undefined>(undefined);

// ---------------------------------------------------------------------------
// Default State
// ---------------------------------------------------------------------------

export const defaultItinerary: MultiDayItinerary = {
  tieude: '',
  mota: '',
  so_ngay: 1,
  days: [
    {
      ngay_thu_may: 1,
      places: [],
    },
  ],
  currentDay: 1,
  isDraft: true,
};

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function ItineraryProvider({ children }: { children: ReactNode }) {
  const [itinerary, setItinerary] = useState<MultiDayItinerary>(defaultItinerary);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Initialization ---

  const initializeItinerary = useCallback((soNgay: number, tieude?: string) => {
    const days: DayItinerary[] = Array.from({ length: soNgay }, (_, i) => ({
      ngay_thu_may: i + 1,
      places: [],
      startTime: '08:00',
      startLocation: undefined,
    }));

    setItinerary({
      ...defaultItinerary,
      tieude: tieude || '',
      so_ngay: soNgay,
      days,
    });
  }, []);

  const resetItinerary = useCallback(() => {
    setItinerary(defaultItinerary);
  }, []);

  // --- Place CRUD ---

  const addPlaceToDay = useCallback((day: number, place: PlaceItem) => {
    const callId = Math.random().toString(36).substr(2, 5).toUpperCase();
    console.log(`[ItineraryContext] 📥 addPlaceToDay [${callId}]:`, { day, ten: place.ten });

    setItinerary((prev) => {
      const newDays = [...prev.days];
      const dayIndex = day - 1;

      if (newDays[dayIndex]) {
        const dayItinerary = { ...newDays[dayIndex] };
        
        const alreadyExists = dayItinerary.places.some((p) => p.instanceId === place.instanceId);
        if (alreadyExists) {
          console.warn(`[ItineraryContext] ⚠️ Duplicate instanceId: ${place.instanceId}`);
          return prev;
        }

        const maxThutu = Math.max(...dayItinerary.places.map((p) => p.thutu || 0), 0);
        const newPlace = { ...place, thutu: maxThutu + 1 };

        dayItinerary.places = [...dayItinerary.places, newPlace];
        newDays[dayIndex] = dayItinerary;
        
        console.log(`[ItineraryContext] ✓ Day ${day} now has ${dayItinerary.places.length} places`);
      }

      return { ...prev, days: newDays };
    });
  }, []);

  const removePlaceFromDay = useCallback((day: number, instanceId: string) => {
    setItinerary((prev) => {
      const newDays = [...prev.days];
      const dayIndex = day - 1;

      if (newDays[dayIndex]) {
        const dayItinerary = { ...newDays[dayIndex] };
        dayItinerary.places = dayItinerary.places.filter((p) => p.instanceId !== instanceId);
        dayItinerary.places = dayItinerary.places.map((p, idx) => ({ ...p, thutu: idx + 1 }));
        newDays[dayIndex] = dayItinerary;
      }

      return { ...prev, days: newDays };
    });
  }, []);

  const reorderPlacesInDay = useCallback((day: number, places: PlaceItem[]) => {
    setItinerary((prev) => {
      const newDays = [...prev.days];
      const dayIndex = day - 1;

      if (newDays[dayIndex]) {
        const dayItinerary = { ...newDays[dayIndex] };
        dayItinerary.places = places.map((p, idx) => ({ ...p, thutu: idx + 1 }));
        newDays[dayIndex] = dayItinerary;
      }

      return { ...prev, days: newDays };
    });
  }, []);

  const setCurrentDay = useCallback((day: number) => {
    setItinerary((prev) => ({ ...prev, currentDay: Math.min(day, prev.so_ngay) }));
  }, []);

  const updatePlaceNotes = useCallback((day: number, instanceId: string, ghichu: string) => {
    setItinerary((prev) => {
      const newItinerary = { ...prev };
      const dayItinerary = newItinerary.days[day - 1];

      if (dayItinerary) {
        const place = dayItinerary.places.find((p) => p.instanceId === instanceId);
        if (place) place.ghichu = ghichu;
      }

      return newItinerary;
    });
  }, []);

  const updatePlaceStayDuration = useCallback((day: number, instanceId: string, duration: number) => {
    setItinerary((prev) => {
      const newItinerary = { ...prev };
      const dayItinerary = newItinerary.days[day - 1];

      if (dayItinerary) {
        const place = dayItinerary.places.find((p) => p.instanceId === instanceId);
        if (place) place.stayDuration = duration;
      }

      return newItinerary;
    });
  }, []);

  // --- Metadata Updates ---

  const updateItineraryTitle = useCallback((title: string) => {
    setItinerary((prev) => ({ ...prev, tieude: title }));
  }, []);

  const updateStartDate = useCallback((date?: string | Date) => {
    setItinerary((prev) => ({ ...prev, ngaybatdau: date }));
  }, []);

  const updateEndDate = useCallback((date?: string | Date) => {
    setItinerary((prev) => ({ ...prev, ngayketthuc: date }));
  }, []);

  const updateNumberOfDays = useCallback((soNgay: number) => {
    setItinerary((prev) => {
      if (soNgay < 1 || soNgay > 7) return prev;

      const newDays: DayItinerary[] = [];
      for (let i = 0; i < soNgay; i++) {
        if (prev.days[i]) {
          newDays.push(prev.days[i]);
        } else {
          newDays.push({ ngay_thu_may: i + 1, places: [], startTime: '08:00', startLocation: undefined });
        }
      }

      return {
        ...prev,
        so_ngay: soNgay,
        days: newDays,
        currentDay: Math.min(prev.currentDay, soNgay),
      };
    });
  }, []);

  const updateDayConfig = useCallback((day: number, config: { startTime?: string; startLocation?: StartLocation }) => {
    setItinerary((prev) => {
      const newItinerary = { ...prev };
      const dayItinerary = newItinerary.days[day - 1];

      if (dayItinerary) {
        if (config.startTime !== undefined) dayItinerary.startTime = config.startTime;
        if (config.startLocation !== undefined) dayItinerary.startLocation = config.startLocation;
      }

      return newItinerary;
    });
  }, []);

  // --- Stats ---

  const updateDayStats = useCallback((day: number, stats: { tong_khoangcach?: number; tong_thoigian?: number }) => {
    setItinerary((prev) => {
      const newItinerary = { ...prev };
      const dayItinerary = newItinerary.days[day - 1];

      if (dayItinerary) {
        if (stats.tong_khoangcach !== undefined) dayItinerary.tong_khoangcach = stats.tong_khoangcach;
        if (stats.tong_thoigian !== undefined) dayItinerary.tong_thoigian = stats.tong_thoigian;
      }

      return newItinerary;
    });
  }, []);

  // --- Validation ---

  const validateItineraryTitle = useCallback(() => {
    if (!itinerary.tieude || itinerary.tieude.trim() === '') {
      return 'Vui lòng nhập tên chuyến đi';
    }
    return null;
  }, [itinerary.tieude]);

  const validateAllDaysHavePlaces = useCallback(() => {
    for (let i = 0; i < itinerary.days.length; i++) {
      const day = itinerary.days[i];
      if (!day.places || day.places.length === 0) {
        return `Ngày ${i + 1} chưa có địa điểm, vui lòng thêm ít nhất 1 địa điểm để tiếp tục`;
      }
    }
    return null;
  }, [itinerary.days]);

  const getTotalStats = useCallback(() => {
    let totalDistance = 0;
    let totalTime = 0;

    itinerary.days.forEach((day) => {
      totalDistance += Number(day.tong_khoangcach) || 0;
      totalTime += Number(day.tong_thoigian) || 0;
    });

    return { totalDistance, totalTime };
  }, [itinerary.days]);

  // --- Context Value ---

  const value: ItineraryContextType = {
    itinerary,
    isLoading,
    error,
    initializeItinerary,
    resetItinerary,
    addPlaceToDay,
    removePlaceFromDay,
    reorderPlacesInDay,
    setCurrentDay,
    updatePlaceNotes,
    updatePlaceStayDuration,
    updateItineraryTitle,
    updateStartDate,
    updateEndDate,
    updateNumberOfDays,
    updateDayConfig,
    updateDayStats,
    setIsLoading,
    setError,
    validateItineraryTitle,
    validateAllDaysHavePlaces,
    getTotalStats,
  };

  return (
    <ItineraryContext.Provider value={value}>
      {children}
    </ItineraryContext.Provider>
  );
}
