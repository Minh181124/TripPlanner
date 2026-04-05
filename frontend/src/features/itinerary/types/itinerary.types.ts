/**
 * features/itinerary/types/itinerary.types.ts
 *
 * Tất cả TypeScript interfaces dành riêng cho Itinerary feature.
 * Đây là nguồn duy nhất (single source of truth) cho các type trong feature này.
 */

/**
 * Đại diện cho một địa điểm trong ngày của lịch trình.
 * Khác với DiaDiem (shared) ở chỗ có thêm các thuộc tính runtime
 * như instanceId, thutu, stayDuration, arrivalTime, departureTime.
 */
export interface PlaceItem {
  /** Unique ID cho instance này (được tạo khi thêm vào, dùng crypto.randomUUID()) */
  instanceId: string;
  diadiem_id: number;
  place_id: string;
  ten: string;
  diachi: string;
  lat: number;
  lng: number;
  loai: string;
  danhgia?: number;
  soluotdanhgia?: number;
  ghichu?: string;
  thoiluong?: number;
  thutu?: number;
  /** Thời gian ở lại (phút), mặc định 60 */
  stayDuration?: number;
  /** Giờ đến (HH:mm) — tính bởi useCalculateTimeline */
  arrivalTime?: string;
  /** Giờ đi (HH:mm) — tính bởi useCalculateTimeline */
  departureTime?: string;
}

/**
 * Điểm xuất phát cho một ngày trong lịch trình.
 */
export interface StartLocation {
  name: string;
  lat: number;
  lng: number;
}

/**
 * Lịch trình của một ngày cụ thể.
 */
export interface DayItinerary {
  ngay_thu_may: number;
  places: PlaceItem[];
  tong_khoangcach?: number;
  tong_thoigian?: number;
  /** Giờ bắt đầu ngày (HH:mm), mặc định '08:00' */
  startTime?: string;
  /** Điểm xuất phát */
  startLocation?: StartLocation;
  /** Điểm kết thúc */
  endLocation?: StartLocation;
}

/**
 * Toàn bộ lịch trình nhiều ngày.
 */
export interface MultiDayItinerary {
  id?: number;
  tieude: string;
  mota?: string;
  so_ngay: number;
  sothich_id?: number;
  ngaybatdau?: string | Date;
  ngayketthuc?: string | Date;
  days: DayItinerary[];
  currentDay: number;
  isDraft: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Interface của Itinerary Context — định nghĩa toàn bộ public API của context.
 */
export interface ItineraryContextType {
  itinerary: MultiDayItinerary;
  isLoading: boolean;
  error: string | null;
  // Initialization
  initializeItinerary: (soNgay: number, tieude?: string) => void;
  resetItinerary: () => void;
  // CRUD actions (implemented in useItineraryActions)
  addPlaceToDay: (day: number, place: PlaceItem) => void;
  removePlaceFromDay: (day: number, instanceId: string) => void;
  reorderPlacesInDay: (day: number, places: PlaceItem[]) => void;
  setCurrentDay: (day: number) => void;
  updatePlaceNotes: (day: number, instanceId: string, ghichu: string) => void;
  updatePlaceStayDuration: (day: number, instanceId: string, duration: number) => void;
  // Metadata updates
  updateItineraryTitle: (title: string) => void;
  updateStartDate: (date?: string | Date) => void;
  updateEndDate: (date?: string | Date) => void;
  updateNumberOfDays: (soNgay: number) => void;
  updateDayConfig: (day: number, config: { startTime?: string; startLocation?: StartLocation; endLocation?: StartLocation }) => void;
  // Stats
  updateDayStats: (day: number, stats: { tong_khoangcach?: number; tong_thoigian?: number }) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  // Validation & computed (implemented in useItineraryStats)
  validateItineraryTitle: () => string | null;
  validateAllDaysHavePlaces: () => string | null;
  getTotalStats: () => { totalDistance: number; totalTime: number };
}
