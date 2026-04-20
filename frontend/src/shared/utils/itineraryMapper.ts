import type { PlaceItem, MultiDayItinerary, DayItinerary } from '@/features/itinerary';

/**
 * Server response types
 */
interface ServerPlace {
  id: number;
  thutu: number;
  ngay_thu_may: number;
  ghichu: string | null;
  thoiluong: number | null;
  thoigian_den: string | Date | null;
  diadiem?: {
    diadiem_id: number;
    google_place_id: string;
    ten: string;
    diachi: string | null;
    lat: number | null;
    lng: number | null;
    loai: string | null;
  } | null;
}

interface ServerDayConfig {
  ngay_thu_may: number;
  gio_batdau: string | null;
  diem_batdau_ten: string | null;
  diem_batdau_lat: number | null;
  diem_batdau_lng: number | null;
  diem_ketthuc_ten: string | null;
  diem_ketthuc_lat: number | null;
  diem_ketthuc_lng: number | null;
}

/**
 * Convert DB Time value (Date object or "HH:mm:ss") → "HH:mm" string
 */
function parseDbTime(val: string | Date | null): string | undefined {
  if (!val) return undefined;
  if (val instanceof Date) {
    const h = String(val.getUTCHours()).padStart(2, '0');
    const m = String(val.getUTCMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  }
  // "HH:mm:ss" string
  return String(val).substring(0, 5);
}

interface ServerItinerary {
  lichtrinh_nguoidung_id?: number;
  tieude?: string;
  ngaybatdau?: string | Date | null;
  ngayketthuc?: string | Date | null;
  lichtrinh_nguoidung_diadiem?: ServerPlace[];
  lichtrinh_nguoidung_ngay?: ServerDayConfig[];
}

/**
 * Map server response → MultiDayItinerary for client state
 * Used when loading an existing itinerary or creating from a sample
 */
export function mapServerToItinerary(server: ServerItinerary): MultiDayItinerary {
  const serverPlaces: ServerPlace[] = server.lichtrinh_nguoidung_diadiem ?? [];
  const serverDayConfigs: ServerDayConfig[] = server.lichtrinh_nguoidung_ngay ?? [];

  // Group places by ngay_thu_may
  const dayMap = new Map<number, PlaceItem[]>();
  for (const sp of serverPlaces) {
    const day = sp.ngay_thu_may ?? 1;
    if (!dayMap.has(day)) dayMap.set(day, []);

    const dd = sp.diadiem;
    if (!dd) continue;

    const arrivalTime = parseDbTime(sp.thoigian_den);
    const stay = sp.thoiluong ?? 60;

    dayMap.get(day)!.push({
      id: sp.id,
      instanceId: `server-${sp.id}-${crypto.randomUUID()}`,
      diadiem_id: dd.diadiem_id,
      place_id: dd.google_place_id,
      ten: dd.ten,
      diachi: dd.diachi ?? '',
      lat: dd.lat ?? 0,
      lng: dd.lng ?? 0,
      loai: dd.loai ?? '',
      ghichu: sp.ghichu ?? '',
      thoiluong: sp.thoiluong ?? undefined,
      stayDuration: stay,
      thutu: sp.thutu,
      arrivalTime,
      departureTime: arrivalTime
        ? (() => {
            const [h, m] = arrivalTime.split(':').map(Number);
            const total = Math.min(h * 60 + m + stay, 23 * 60 + 59);
            return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
          })()
        : undefined,
    });
  }

  const maxDay = dayMap.size > 0 ? Math.max(...dayMap.keys()) : 1;

  // Build day config lookup
  const dayConfigMap = new Map<number, ServerDayConfig>();
  for (const dc of serverDayConfigs) dayConfigMap.set(dc.ngay_thu_may, dc);

  const days: DayItinerary[] = Array.from({ length: maxDay }, (_, i) => {
    const dayNum = i + 1;
    const dc = dayConfigMap.get(dayNum);
    return {
      ngay_thu_may: dayNum,
      places: (dayMap.get(dayNum) ?? []).sort((a, b) => (a.thutu ?? 0) - (b.thutu ?? 0)),
      startTime: dc?.gio_batdau ?? '08:00',
      startLocation:
        dc?.diem_batdau_lat && dc?.diem_batdau_lng
          ? {
              name: dc.diem_batdau_ten ?? '',
              lat: dc.diem_batdau_lat,
              lng: dc.diem_batdau_lng,
            }
          : undefined,
      endLocation:
        dc?.diem_ketthuc_lat && dc?.diem_ketthuc_lng
          ? {
              name: dc.diem_ketthuc_ten ?? '',
              lat: dc.diem_ketthuc_lat,
              lng: dc.diem_ketthuc_lng,
            }
          : undefined,
    };
  });

  return {
    id: server.lichtrinh_nguoidung_id,
    tieude: server.tieude ?? '',
    so_ngay: maxDay,
    ngaybatdau: server.ngaybatdau ?? undefined,
    ngayketthuc: server.ngayketthuc ?? undefined,
    days,
    currentDay: 1,
    isDraft: false,
  };
}
