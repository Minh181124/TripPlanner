'use client';

import React, { useState, useMemo, useRef } from 'react';
import {
  X,
  Search,
  Ticket,
  FileText,
  Image as ImageIcon,
  Upload,
  Bus,
  Train,
  PartyPopper,
  Package,
  Calendar,
  CheckCircle2,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import type { Ticket as TicketType } from '../services/ticketService';
import { ticketService } from '../services/ticketService';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TicketLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  lichtrinhDiaDiemId: number;
  myTickets: TicketType[];
  alreadyAttachedVeIds: number[];
  onAttached: () => void;
  onTicketCreated: (ticket: TicketType) => void;
}

const LOAI_OPTIONS = [
  { value: '', label: 'Tất cả', icon: <Ticket className="w-3.5 h-3.5" /> },
  { value: 'bus', label: 'Xe', icon: <Bus className="w-3.5 h-3.5" /> },
  { value: 'train', label: 'Tàu', icon: <Train className="w-3.5 h-3.5" /> },
  { value: 'event', label: 'Sự kiện', icon: <PartyPopper className="w-3.5 h-3.5" /> },
  { value: 'other', label: 'Khác', icon: <Package className="w-3.5 h-3.5" /> },
];

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('vi-VN');
}

function TicketIcon({ kieu_file }: { kieu_file: string | null }) {
  if (kieu_file === 'application/pdf') return <FileText className="w-4 h-4 text-red-500" />;
  if (kieu_file?.startsWith('image/')) return <ImageIcon className="w-4 h-4 text-blue-500" />;
  return <Ticket className="w-4 h-4 text-indigo-500" />;
}

// ---------------------------------------------------------------------------
// Upload form (inline, expand khi click "Upload vé mới")
// ---------------------------------------------------------------------------

function UploadForm({
  onCreated,
  onCancel,
}: {
  onCreated: (t: TicketType) => void;
  onCancel: () => void;
}) {
  const [tieu_de, setTieuDe] = useState('');
  const [loai_ve, setLoaiVe] = useState('');
  const [ngay_su_dung, setNgaySuDung] = useState('');
  const [ghi_chu, setGhiChu] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  };

  const handleSubmit = async () => {
    if (!tieu_de.trim()) { setError('Vui lòng nhập tên vé'); return; }
    setLoading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('tieu_de', tieu_de.trim());
      if (loai_ve) fd.append('loai_ve', loai_ve);
      if (ngay_su_dung) fd.append('ngay_su_dung', ngay_su_dung);
      if (ghi_chu) fd.append('ghi_chu', ghi_chu);
      if (file) fd.append('file', file);
      const ticket = await ticketService.createTicket(fd);
      onCreated(ticket);
    } catch {
      setError('Tạo vé thất bại, thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border-t border-slate-100 pt-4 space-y-3">
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Upload vé mới</p>

      {/* Tên vé */}
      <input
        type="text"
        placeholder="Tên vé *"
        value={tieu_de}
        onChange={(e) => setTieuDe(e.target.value)}
        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300"
      />

      {/* Loại vé + ngày */}
      <div className="flex gap-2">
        <select
          value={loai_ve}
          onChange={(e) => setLoaiVe(e.target.value)}
          className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
        >
          <option value="">Loại vé</option>
          <option value="bus">Xe buýt / xe khách</option>
          <option value="train">Tàu hỏa</option>
          <option value="event">Sự kiện / Khu vui chơi</option>
          <option value="other">Khác</option>
        </select>
        <input
          type="date"
          value={ngay_su_dung}
          onChange={(e) => setNgaySuDung(e.target.value)}
          className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />
      </div>

      {/* Ghi chú */}
      <input
        type="text"
        placeholder="Ghi chú (tùy chọn)"
        value={ghi_chu}
        onChange={(e) => setGhiChu(e.target.value)}
        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300"
      />

      {/* File drop zone */}
      <div
        onClick={() => fileRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-indigo-200 rounded-2xl p-4 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-all"
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/*,application/pdf"
          className="hidden"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        {file ? (
          <div className="flex items-center justify-center gap-2 text-indigo-600 text-sm font-semibold">
            <FileText className="w-4 h-4" />
            {file.name}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1 text-slate-400">
            <Upload className="w-5 h-5" />
            <span className="text-xs">Kéo thả hoặc click để chọn file</span>
            <span className="text-[10px]">PDF, JPG, PNG, WEBP — tối đa 10MB</span>
          </div>
        )}
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <div className="flex gap-2">
        <button
          onClick={onCancel}
          className="flex-1 py-2 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
        >
          Hủy
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex-1 py-2 text-sm font-bold text-white bg-gradient-to-r from-indigo-500 to-violet-500 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {loading ? 'Đang tải...' : 'Lưu vé'}
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Modal
// ---------------------------------------------------------------------------

export function TicketLibraryModal({
  isOpen,
  onClose,
  lichtrinhDiaDiemId,
  myTickets,
  alreadyAttachedVeIds,
  onAttached,
  onTicketCreated,
}: TicketLibraryModalProps) {
  const [search, setSearch] = useState('');
  const [filterLoai, setFilterLoai] = useState('');
  const [attachingId, setAttachingId] = useState<number | null>(null);
  const [attachedIds, setAttachedIds] = useState<number[]>(alreadyAttachedVeIds);
  const [showUpload, setShowUpload] = useState(false);

  const activeTickets = useMemo(
    () => myTickets.filter((t) => t.trang_thai),
    [myTickets],
  );

  const filtered = useMemo(() => {
    return activeTickets.filter((t) => {
      const matchSearch = t.tieu_de.toLowerCase().includes(search.toLowerCase());
      const matchLoai = !filterLoai || t.loai_ve === filterLoai;
      return matchSearch && matchLoai;
    });
  }, [activeTickets, search, filterLoai]);

  const handleAttach = async (veId: number) => {
    if (attachedIds.includes(veId)) return;
    setAttachingId(veId);
    try {
      await ticketService.attachTicket(veId, lichtrinhDiaDiemId);
      setAttachedIds((prev) => [...prev, veId]);
      onAttached();
    } catch (e) {
      console.error(e);
    } finally {
      setAttachingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-[28px] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Ticket className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold text-sm">Kho vé của bạn</h3>
              <p className="text-white/70 text-xs">{activeTickets.length} vé đang dùng</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Search + filter */}
        <div className="px-4 pt-4 space-y-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-2xl">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Tìm kiếm vé..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-sm outline-none placeholder-slate-400"
            />
          </div>

          {/* Filter tabs */}
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
            {LOAI_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setFilterLoai(opt.value)}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  filterLoai === opt.value
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {opt.icon}
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Ticket list */}
        <div className="px-4 pb-2 mt-3 space-y-2 max-h-72 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-slate-400">
              <Ticket className="w-8 h-8 mb-2 opacity-40" />
              <p className="text-sm">
                {activeTickets.length === 0 ? 'Kho vé trống' : 'Không tìm thấy vé'}
              </p>
            </div>
          ) : (
            filtered.map((ticket) => {
              const isAttached = attachedIds.includes(ticket.ve_id);
              const isLoading = attachingId === ticket.ve_id;

              return (
                <div
                  key={ticket.ve_id}
                  className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-all duration-200 ${
                    isAttached
                      ? 'border-emerald-200 bg-emerald-50'
                      : 'border-slate-100 bg-white hover:border-indigo-200 hover:bg-indigo-50/30'
                  }`}
                >
                  {/* Icon */}
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    isAttached ? 'bg-emerald-100' : 'bg-slate-100'
                  }`}>
                    <TicketIcon kieu_file={ticket.kieu_file} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate ${isAttached ? 'text-emerald-700' : 'text-slate-800'}`}>
                      {ticket.tieu_de}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {ticket.loai_ve && (
                        <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium capitalize">
                          {ticket.loai_ve}
                        </span>
                      )}
                      {ticket.ngay_su_dung && (
                        <span className="flex items-center gap-0.5 text-[11px] text-slate-400">
                          <Calendar className="w-3 h-3" />
                          {formatDate(ticket.ngay_su_dung)}
                        </span>
                      )}
                    </div>
                    {ticket.ghi_chu && (
                      <p className="text-[11px] text-slate-400 mt-1 italic line-clamp-1">
                        &quot;{ticket.ghi_chu}&quot;
                      </p>
                    )}
                  </div>

                  {/* Preview file component */}
                  {ticket.file_url && (
                    <a
                      href={ticket.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-indigo-100"
                      title="Xem file"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}

                  {/* Attach button */}
                  {isAttached ? (
                    <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                      Đã gắn
                    </div>
                  ) : (
                    <button
                      onClick={() => handleAttach(ticket.ve_id)}
                      disabled={isLoading}
                      className="shrink-0 px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-indigo-500 to-violet-500 rounded-xl hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-1"
                    >
                      {isLoading ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : null}
                      Chọn
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Upload section */}
        <div className="px-4 pb-4 pt-2">
          {showUpload ? (
            <UploadForm
              onCreated={(t) => {
                onTicketCreated(t);
                setShowUpload(false);
              }}
              onCancel={() => setShowUpload(false)}
            />
          ) : (
            <button
              onClick={() => setShowUpload(true)}
              className="w-full py-2.5 border-2 border-dashed border-indigo-200 rounded-2xl text-sm font-semibold text-indigo-500 hover:border-indigo-400 hover:bg-indigo-50/30 transition-all flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload vé mới
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
