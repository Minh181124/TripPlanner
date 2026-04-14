'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Sunrise,
  Sun,
  Sunset,
  Moon,
  MapPin,
  Clock,
  FileText,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Sparkles,
  Image as ImageIcon,
  Tag,
  Phone,
  Globe,
  Star,
  Zap,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Ticket as TicketIcon,
} from 'lucide-react';
import { useItinerary } from '../hooks/useItinerary';
import apiClient from '@/shared/api/apiClient';
import type { PlaceItem } from '../types/itinerary.types';
import { TicketBadge } from './TicketBadge';
import { TicketLibraryModal } from './TicketLibraryModal';
import { ticketService, type Ticket, type TicketMap } from '../services/ticketService';
import { Plus } from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type TimeSlot = 'morning' | 'noon' | 'afternoon' | 'evening';

interface PlaceDetail {
  diadiem_id: number;
  ten: string;
  diachi: string | null;
  loai: string | null;
  danhgia: number | null;
  soluotdanhgia: number | null;
  giatien: number | null;
  chitiet_diadiem?: {
    mota_google?: string | null;
    mota_tonghop?: string | null;
    sodienthoai?: string | null;
    website?: string | null;
  }[];
  hinhanh_diadiem?: { url?: string | null; photo_reference?: string | null }[];
  hoatdong_diadiem?: {
    hoatdong_id: number;
    ten_hoatdong: string;
    noidung_chitiet?: string | null;
    loai_hoatdong?: string | null;
    thoidiem_lytuong?: string | null;
    gia_thamkhao?: number | null;
  }[];
}

interface TimeGroup {
  slot: TimeSlot;
  label: string;
  icon: React.ReactNode;
  gradient: string;
  borderColor: string;
  textColor: string;
  bgAccent: string;
  headerBg: string;
  places: PlaceItem[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseHour(time?: string): number {
  if (!time) return -1;
  const h = parseInt(time.split(':')[0], 10);
  return Number.isNaN(h) ? -1 : h;
}

function classifySlot(place: PlaceItem): TimeSlot {
  const h = parseHour(place.arrivalTime);
  if (h < 0) return 'morning';
  if (h < 11) return 'morning';
  if (h < 14) return 'noon';
  if (h < 18) return 'afternoon';
  return 'evening';
}

function formatCurrency(val?: number | null) {
  if (!val) return null;
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(val);
}

// ---------------------------------------------------------------------------
// Slot config
// ---------------------------------------------------------------------------

const SLOT_CONFIG: Record<TimeSlot, Omit<TimeGroup, 'places'>> = {
  morning: {
    slot: 'morning',
    label: 'Buổi sáng',
    icon: <Sunrise className="w-5 h-5" />,
    gradient: 'from-amber-50 to-orange-50',
    borderColor: 'border-amber-200',
    textColor: 'text-amber-700',
    bgAccent: 'bg-amber-100',
    headerBg: 'bg-gradient-to-r from-amber-400 to-orange-400',
  },
  noon: {
    slot: 'noon',
    label: 'Buổi trưa',
    icon: <Sun className="w-5 h-5" />,
    gradient: 'from-rose-50 to-pink-50',
    borderColor: 'border-rose-200',
    textColor: 'text-rose-700',
    bgAccent: 'bg-rose-100',
    headerBg: 'bg-gradient-to-r from-rose-400 to-pink-400',
  },
  afternoon: {
    slot: 'afternoon',
    label: 'Buổi chiều',
    icon: <Sunset className="w-5 h-5" />,
    gradient: 'from-indigo-50 to-blue-50',
    borderColor: 'border-indigo-200',
    textColor: 'text-indigo-700',
    bgAccent: 'bg-indigo-100',
    headerBg: 'bg-gradient-to-r from-indigo-500 to-blue-500',
  },
  evening: {
    slot: 'evening',
    label: 'Buổi tối',
    icon: <Moon className="w-5 h-5" />,
    gradient: 'from-violet-50 to-slate-50',
    borderColor: 'border-violet-200',
    textColor: 'text-violet-700',
    bgAccent: 'bg-violet-100',
    headerBg: 'bg-gradient-to-r from-violet-500 to-indigo-600',
  },
};

const SLOT_ORDER: TimeSlot[] = ['morning', 'noon', 'afternoon', 'evening'];

// ---------------------------------------------------------------------------
// Image Carousel
// ---------------------------------------------------------------------------

function ImageCarousel({ images }: { images: { url?: string | null }[] }) {
  const [current, setCurrent] = useState(0);
  const validImages = images.filter((img) => img.url);

  if (validImages.length === 0) {
    return (
      <div className="w-full h-48 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center rounded-2xl">
        <div className="flex flex-col items-center gap-2 text-slate-400">
          <ImageIcon className="w-8 h-8" />
          <span className="text-xs">Chưa có hình ảnh</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-52 rounded-2xl overflow-hidden group">
      <img
        src={validImages[current].url!}
        alt="Place"
        className="w-full h-full object-cover transition-all duration-500"
        onError={(e) => { (e.target as HTMLImageElement).src = ''; }}
      />
      {/* Dark overlay bottom */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

      {validImages.length > 1 && (
        <>
          <button
            onClick={() => setCurrent((c) => (c - 1 + validImages.length) % validImages.length)}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrent((c) => (c + 1) % validImages.length)}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          {/* Dots */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            {validImages.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-1.5 h-1.5 rounded-full transition-all ${i === current ? 'bg-white w-4' : 'bg-white/50'}`}
              />
            ))}
          </div>
        </>
      )}

      {/* Image count badge */}
      {validImages.length > 1 && (
        <div className="absolute top-3 right-3 px-2 py-1 bg-black/40 backdrop-blur-sm rounded-full text-white text-xs font-semibold">
          {current + 1}/{validImages.length}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Activity selector
// ---------------------------------------------------------------------------

function ActivitySelector({
  activities,
  selectedIds,
  onToggle,
}: {
  activities: NonNullable<PlaceDetail['hoatdong_diadiem']>;
  selectedIds: number[];
  onToggle: (id: number) => void;
}) {
  if (activities.length === 0) return null;

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
        <Zap className="w-3.5 h-3.5 text-amber-500" />
        Hoạt động tại đây
      </label>
      <div className="flex flex-col gap-2">
        {activities.map((act) => {
          const isSelected = selectedIds.includes(act.hoatdong_id);
          return (
            <button
              key={act.hoatdong_id}
              onClick={() => onToggle(act.hoatdong_id)}
              className={`flex items-start gap-3 p-3 rounded-xl border-2 text-left transition-all duration-200 ${
                isSelected
                  ? 'border-indigo-400 bg-indigo-50 shadow-sm shadow-indigo-100'
                  : 'border-slate-200 bg-white hover:border-indigo-200 hover:bg-indigo-50/30'
              }`}
            >
              {/* Checkbox circle */}
              <div className={`shrink-0 mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                isSelected ? 'border-indigo-500 bg-indigo-500' : 'border-slate-300'
              }`}>
                {isSelected && (
                  <svg viewBox="0 0 10 8" fill="none" className="w-3 h-3">
                    <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className={`text-sm font-semibold ${isSelected ? 'text-indigo-700' : 'text-slate-800'}`}>
                    {act.ten_hoatdong}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    {act.thoidiem_lytuong && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">
                        {act.thoidiem_lytuong}
                      </span>
                    )}
                    {act.loai_hoatdong && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                        {act.loai_hoatdong}
                      </span>
                    )}
                  </div>
                </div>
                {act.noidung_chitiet && (
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{act.noidung_chitiet}</p>
                )}
                {act.gia_thamkhao && (
                  <div className="flex items-center gap-1 mt-1">
                    <DollarSign className="w-3 h-3 text-emerald-500" />
                    <span className="text-xs text-emerald-700 font-semibold">{formatCurrency(Number(act.gia_thamkhao))}</span>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Place Note Card
// ---------------------------------------------------------------------------

function PlaceNoteCard({
  place,
  dayNumber,
  index,
  slotConfig,
  myTickets,
  attachedTickets,
  onRefreshTickets,
}: {
  place: PlaceItem;
  dayNumber: number;
  index: number;
  slotConfig: Omit<TimeGroup, 'places'>;
  myTickets: Ticket[];
  attachedTickets: any[];
  onRefreshTickets: () => void;
}) {
  const { updatePlaceNotes, updatePlaceStayDuration } = useItinerary();

  const [detail, setDetail] = useState<PlaceDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [selectedActivityIds, setSelectedActivityIds] = useState<number[]>([]);
  const [expanded, setExpanded] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetachingId, setIsDetachingId] = useState<number | null>(null);

  // Fetch place detail on mount
  useEffect(() => {
    if (!place.diadiem_id) return;
    setLoadingDetail(true);
    apiClient
      .get(`/places/${place.diadiem_id}`)
      .then((res: any) => {
        const data = res?.data ?? res;
        setDetail(data);
      })
      .catch((err: any) => console.error('[PlanDetailEditor] Fetch place detail error:', err))
      .finally(() => setLoadingDetail(false));
  }, [place.diadiem_id]);

  const handleNoteChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      updatePlaceNotes(dayNumber, place.instanceId, e.target.value);
    },
    [dayNumber, place.instanceId, updatePlaceNotes],
  );

  const handleStayDurationChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newDuration = parseInt(e.target.value) || 60;
      updatePlaceStayDuration(dayNumber, place.instanceId, newDuration);
    },
    [dayNumber, place.instanceId, updatePlaceStayDuration],
  );

  const handleToggleActivity = useCallback((id: number) => {
    setSelectedActivityIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }, []);

  const handleDetach = async (attachId: number) => {
    setIsDetachingId(attachId);
    try {
      await ticketService.detachTicket(attachId);
      onRefreshTickets();
    } catch (error) {
      console.error('Detach ticket error:', error);
    } finally {
      setIsDetachingId(null);
    }
  };

  const alreadyAttachedVeIds = useMemo(() => attachedTickets.map(at => at.ve_id), [attachedTickets]);

  const chitiet = detail?.chitiet_diadiem?.[0];
  const mota = chitiet?.mota_tonghop || chitiet?.mota_google;
  const activities = detail?.hoatdong_diadiem ?? [];
  const images = detail?.hinhanh_diadiem ?? [];

  return (
    <div className={`rounded-[28px] border-2 overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 ${slotConfig.borderColor} bg-white`}>

      {/* ── Time Hero Banner ── */}
      <div className={`${slotConfig.headerBg} px-5 py-4 flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          {/* Index circle */}
          <div className="w-10 h-10 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-white font-extrabold text-base backdrop-blur-sm">
            {index + 1}
          </div>
          <div>
            <h4 className="text-white font-bold text-base leading-tight drop-shadow-sm">{place.ten}</h4>
            <p className="text-white/75 text-xs truncate max-w-[220px]">{place.diachi}</p>
          </div>
        </div>

        {/* TIME — điểm nhấn */}
        <div className="shrink-0 flex flex-col items-end gap-1">
          {place.arrivalTime ? (
            <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl px-4 py-2 shadow-inner">
              <Clock className="w-4 h-4 text-white" />
              <div className="flex items-baseline gap-1.5">
                <span className="text-white font-extrabold text-xl tracking-tight leading-none">{place.arrivalTime}</span>
                {place.departureTime && (
                  <>
                    <span className="text-white/60 text-sm">→</span>
                    <span className="text-white/90 font-bold text-base">{place.departureTime}</span>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="px-3 py-1.5 bg-white/20 rounded-xl text-white/70 text-xs font-medium">Chưa tính giờ</div>
          )}

          {/* Collapse toggle */}
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-white/70 hover:text-white transition-colors flex items-center gap-1 text-[11px] font-medium mt-0.5"
          >
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {expanded ? 'Thu gọn' : 'Mở rộng'}
          </button>
        </div>
      </div>

      {/* ── Body (collapsible) ── */}
      {expanded && (
        <div className={`p-5 space-y-5 bg-gradient-to-b ${slotConfig.gradient}`}>

          {/* Loading skeleton */}
          {loadingDetail && (
            <div className="space-y-3 animate-pulse">
              <div className="w-full h-40 bg-slate-200 rounded-2xl" />
              <div className="h-3 bg-slate-200 rounded w-3/4" />
              <div className="h-3 bg-slate-200 rounded w-1/2" />
            </div>
          )}

          {/* Image Carousel */}
          {!loadingDetail && images.length > 0 && (
            <ImageCarousel images={images} />
          )}

          {/* Place info chips */}
          {!loadingDetail && detail && (
            <div className="flex flex-wrap gap-2">
              {detail.loai && (
                <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${slotConfig.bgAccent} ${slotConfig.textColor}`}>
                  <Tag className="w-3 h-3" />
                  {detail.loai}
                </span>
              )}
              {detail.danhgia && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-100 text-yellow-700 text-xs font-semibold">
                  <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                  {Number(detail.danhgia).toFixed(1)}
                  {detail.soluotdanhgia && (
                    <span className="text-yellow-600/70">({detail.soluotdanhgia.toLocaleString()})</span>
                  )}
                </span>
              )}
              {detail.giatien && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
                  <DollarSign className="w-3 h-3" />
                  {formatCurrency(detail.giatien)}
                </span>
              )}
              {chitiet?.sodienthoai && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                  <Phone className="w-3 h-3" />
                  {chitiet.sodienthoai}
                </span>
              )}
              {chitiet?.website && (
                <a
                  href={chitiet.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition-colors"
                >
                  <Globe className="w-3 h-3" />
                  Website
                </a>
              )}
            </div>
          )}

          {/* Description */}
          {!loadingDetail && mota && (
            <p className="text-sm text-slate-600 leading-relaxed bg-white/60 backdrop-blur-sm rounded-2xl px-4 py-3 border border-white/80">
              {mota}
            </p>
          )}

          {/* ── Stay Duration ── */}
          <div className="flex items-center gap-4 bg-white/70 backdrop-blur-sm rounded-2xl px-4 py-3 border border-white/80">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-semibold text-slate-700">Thời gian ở lại</span>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <input
                type="number"
                min="15"
                step="5"
                value={place.stayDuration || 60}
                onChange={handleStayDurationChange}
                className="w-20 px-3 py-1.5 text-sm font-bold text-center text-slate-800 bg-amber-50 border-2 border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400 transition-all"
              />
              <span className="text-sm text-slate-500 font-medium">phút</span>
            </div>
          </div>

          {/* ── Activities ── */}
          {!loadingDetail && activities.length > 0 && (
            <ActivitySelector
              activities={activities}
              selectedIds={selectedActivityIds}
              onToggle={handleToggleActivity}
            />
          )}

          {/* ── Note Textarea ── */}
          <div className="space-y-2">
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
              <FileText className="w-3.5 h-3.5 text-indigo-500" />
              Ghi chú cá nhân
            </label>
            <textarea
              value={place.ghichu || ''}
              onChange={handleNoteChange}
              placeholder="Ghi chú cho địa điểm này… (ví dụ: đặt bàn trước, mang theo…)"
              rows={3}
              className="w-full px-4 py-3 text-sm text-slate-800 placeholder-slate-400 bg-white/90 border-2 border-slate-200 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all"
            />
          </div>

          {/* ── Ticket Library Section ── */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
                <TicketIcon className="w-3.5 h-3.5 text-indigo-500" />
                Vé đã gắn ({attachedTickets.length})
              </label>
              <button
                onClick={() => setIsModalOpen(true)}
                disabled={!place.id}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                title={!place.id ? 'Vui lòng lưu lịch trình trước khi gắn vé' : ''}
              >
                <Plus className="w-3 h-3" />
                Gắn vé
              </button>
            </div>

            {attachedTickets.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {attachedTickets.map((at) => (
                  <TicketBadge
                    key={at.attachId}
                    ticket={at}
                    onDetach={handleDetach}
                    isDetaching={isDetachingId === at.attachId}
                  />
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">Chưa có vé nào cho địa điểm này.</p>
            )}
          </div>

          {/* Ticket Modal */}
          {isModalOpen && place.id && (
            <TicketLibraryModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              lichtrinhDiaDiemId={place.id}
              myTickets={myTickets}
              alreadyAttachedVeIds={alreadyAttachedVeIds}
              onAttached={() => {
                onRefreshTickets();
              }}
              onTicketCreated={(newTicket) => {
                // Khi tạo vé mới xong, ta refresh danh sách vé (kho vé)
                onRefreshTickets();
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Time Group Section
// ---------------------------------------------------------------------------

function TimeGroupSection({
  group,
  dayNumber,
  myTickets,
  ticketMap,
  onRefreshTickets,
}: {
  group: TimeGroup;
  dayNumber: number;
  myTickets: Ticket[];
  ticketMap: TicketMap;
  onRefreshTickets: () => void;
}) {
  const [sectionExpanded, setSectionExpanded] = useState(true);
  if (group.places.length === 0) return null;

  return (
    <div className="space-y-3">
      {/* Section header */}
      <button
        onClick={() => setSectionExpanded((v) => !v)}
        className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-[20px] border-2 transition-all duration-200 ${group.borderColor} bg-gradient-to-r ${group.gradient} hover:shadow-md`}
      >
        <div className={`p-2 rounded-xl ${group.bgAccent} ${group.textColor}`}>{group.icon}</div>
        <div className="flex-1 text-left">
          <span className={`text-sm font-bold ${group.textColor}`}>{group.label}</span>
          <span className="ml-2 text-xs text-slate-500">({group.places.length} địa điểm)</span>
        </div>
        {sectionExpanded ? (
          <ChevronUp className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        )}
      </button>

      {sectionExpanded && (
        <div className="space-y-4 pl-1 md:pl-3">
          {group.places.map((place, idx) => (
            <PlaceNoteCard
              key={place.instanceId}
              place={place}
              dayNumber={dayNumber}
              index={idx}
              slotConfig={group}
              myTickets={myTickets}
              attachedTickets={place.id ? (ticketMap[place.id] || []) : []}
              onRefreshTickets={onRefreshTickets}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

interface PlanDetailEditorProps {
  onBack?: () => void;
  onFinish?: () => void;
  isSaving?: boolean;
}

export function PlanDetailEditor({ onBack, onFinish, isSaving }: PlanDetailEditorProps) {
  const { itinerary, setCurrentDay } = useItinerary();
  const [activeDayTab, setActiveDayTab] = useState(itinerary.currentDay);
  const [myTickets, setMyTickets] = useState<Ticket[]>([]);
  const [ticketMap, setTicketMap] = useState<TicketMap>({});

  // ── Fetch Tickets Data ──
  const fetchTicketsData = useCallback(async () => {
    if (!itinerary.id) {
      console.warn('[PlanDetailEditor] No itinerary ID, skipping ticket fetch');
      return;
    }
    try {
      console.log('[PlanDetailEditor] Fetching tickets for itinerary:', itinerary.id);
      const [tickets, map] = await Promise.all([
        ticketService.getMyTickets(true),
        ticketService.getTicketsForItinerary(itinerary.id),
      ]);
      console.log('[PlanDetailEditor] Tickets fetched, map keys:', Object.keys(map));
      setMyTickets(tickets);
      setTicketMap(map);
    } catch (error) {
      console.error('[PlanDetailEditor] Fetch tickets error:', error);
    }
  }, [itinerary.id]);

  useEffect(() => {
    fetchTicketsData();
  }, [fetchTicketsData]);

  const dayData = itinerary.days[activeDayTab - 1];

  const groups: TimeGroup[] = useMemo(() => {
    if (!dayData?.places) return [];
    const buckets: Record<TimeSlot, PlaceItem[]> = { morning: [], noon: [], afternoon: [], evening: [] };
    dayData.places.forEach((p) => { buckets[classifySlot(p)].push(p); });
    return SLOT_ORDER.map((slot) => ({ ...SLOT_CONFIG[slot], places: buckets[slot] })).filter((g) => g.places.length > 0);
  }, [dayData?.places]);

  const handleDayChange = useCallback((day: number) => {
    setActiveDayTab(day);
    setCurrentDay(day);
  }, [setCurrentDay]);

  const totalPlaces = dayData?.places?.length ?? 0;
  const notesCount = dayData?.places?.filter((p) => p.ghichu && p.ghichu.trim()).length ?? 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-100">

      {/* ── Hero Header ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 text-white">
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-48 h-48 rounded-full bg-rose-400/10 blur-2xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-5 h-5 text-amber-300" />
            <span className="text-xs font-semibold tracking-widest text-indigo-200 uppercase">Biên tập ghi chú</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{itinerary.tieude || 'Chuyến đi của bạn'}</h1>
          <p className="mt-1 text-indigo-200 text-sm">Thêm ghi chú, chọn hoạt động và điều chỉnh thời gian cho từng điểm dừng.</p>

          <div className="mt-4 flex flex-wrap gap-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm">
              <MapPin className="w-4 h-4 text-amber-300" />
              <span className="text-sm font-semibold">{totalPlaces} địa điểm</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm">
              <FileText className="w-4 h-4 text-emerald-300" />
              <span className="text-sm font-semibold">{notesCount}/{totalPlaces} đã ghi chú</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Day Tabs ── */}
      {itinerary.so_ngay > 1 && (
        <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex gap-2 overflow-x-auto scrollbar-hide">
            {Array.from({ length: itinerary.so_ngay }, (_, i) => i + 1).map((day) => (
              <button
                key={day}
                onClick={() => handleDayChange(day)}
                className={`px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                  activeDayTab === day
                    ? 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-400/30'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Ngày {day}
                {itinerary.days[day - 1]?.places?.length ? ` (${itinerary.days[day - 1].places.length})` : ''}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Content ── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-5">
        {totalPlaces === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <MapPin className="w-12 h-12 text-slate-300 mb-4" />
            <p className="text-lg font-semibold text-slate-500">Ngày {activeDayTab} chưa có địa điểm nào</p>
            <p className="text-sm text-slate-400 mt-1">Quay lại bước trước để thêm địa điểm vào lộ trình.</p>
          </div>
        ) : (
          groups.map((group) => (
            <TimeGroupSection
              key={group.slot}
              group={group}
              dayNumber={activeDayTab}
              myTickets={myTickets}
              ticketMap={ticketMap}
              onRefreshTickets={fetchTicketsData}
            />
          ))
        )}
      </div>

      {/* ── Bottom Action Bar ── */}
      <div className="sticky bottom-0 z-30 bg-white/90 backdrop-blur-xl border-t border-slate-200/60 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full border-2 border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-all"
            >
              ← Quay lại lộ trình
            </button>
          )}
          <div className="flex-1" />
          {onFinish && (
            <button
              onClick={onFinish}
              disabled={isSaving}
              className="flex items-center gap-2 px-7 py-3 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-bold shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Đang lưu…</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Hoàn tất & Lưu</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
