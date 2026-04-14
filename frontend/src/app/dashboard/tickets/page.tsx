'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Ticket,
  Plus,
  Search,
  FileText,
  Image as ImageIcon,
  Trash2,
  Archive,
  ArchiveRestore,
  ExternalLink,
  Upload,
  Bus,
  Train,
  PartyPopper,
  Package,
  Calendar,
  Loader2,
  X,
  MapPin,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';
import { ticketService, type Ticket as TicketType } from '@/features/itinerary/services/ticketService';

// ──────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────

function formatDate(d: string | null) {
  if (!d) return null;
  return new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function loaiLabel(loai: string | null) {
  const map: Record<string, string> = { bus: 'Xe khách', train: 'Tàu hỏa', event: 'Sự kiện', other: 'Khác' };
  return loai ? (map[loai] ?? loai) : null;
}

function TicketFileIcon({ kieu_file }: { kieu_file: string | null }) {
  if (kieu_file === 'application/pdf') return <FileText className="w-6 h-6 text-red-400" />;
  if (kieu_file?.startsWith('image/')) return <ImageIcon className="w-6 h-6 text-blue-400" />;
  return <Ticket className="w-6 h-6 text-indigo-400" />;
}

const LOAI_FILTERS = [
  { value: '', label: 'Tất cả' },
  { value: 'bus', label: 'Xe' },
  { value: 'train', label: 'Tàu' },
  { value: 'event', label: 'Sự kiện' },
  { value: 'other', label: 'Khác' },
];

// ──────────────────────────────────────────────────────────────────────────
// UploadModal
// ──────────────────────────────────────────────────────────────────────────

function UploadModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (t: TicketType) => void;
}) {
  const [activeTab, setActiveTab] = useState<'ai' | 'manual'>('ai');
  const [tieu_de, setTieuDe] = useState('');
  const [loai_ve, setLoaiVe] = useState('');
  const [ngay_su_dung, setNgaySuDung] = useState('');
  const [ghi_chu, setGhiChu] = useState('');
  const [chi_tiet, setChiTiet] = useState({ tuyen_duong: '', gio_khoi_hanh: '', thoi_gian_den: '', so_ghe: '', gia_tien: '' });
  const [file, setFile] = useState<File | null>(null);
  const [pasteText, setPasteText] = useState('');
  const [loading, setLoading] = useState(false);
  const [autoFillLoading, setAutoFillLoading] = useState(false);
  const [error, setError] = useState('');
  const [confidenceWarning, setConfidenceWarning] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleAutoFill = async () => {
    if (!file && !pasteText.trim()) {
      setError('Vui lòng tải file lên hoặc dán nội dung email để AI đọc.');
      return;
    }
    setAutoFillLoading(true);
    setError('');
    setConfidenceWarning(null);
    try {
      const data = await ticketService.extractTicketAI({ file: file || undefined, text: pasteText });
      if (data) {
        if (data.tieu_de) setTieuDe(data.tieu_de);
        if (data.loai_ve) setLoaiVe(data.loai_ve);
        
        if (data.chi_tiet) {
          setChiTiet(prev => ({
            ...prev,
            tuyen_duong: data.chi_tiet.tuyen_duong || prev.tuyen_duong,
            gio_khoi_hanh: data.chi_tiet.gio_khoi_hanh || prev.gio_khoi_hanh,
            thoi_gian_den: data.chi_tiet.thoi_gian_den || prev.thoi_gian_den,
            so_ghe: data.chi_tiet.so_ghe || prev.so_ghe,
            gia_tien: data.chi_tiet.gia_tien || prev.gia_tien,
          }));
        }
        
        if (data.ghi_chu) {
          setGhiChu(prev => prev ? prev + '\n\n' + data.ghi_chu : data.ghi_chu);
        }

        if (data.ngay_su_dung) {
          try {
            const dateStr = data.ngay_su_dung.includes('T') ? data.ngay_su_dung.split('T')[0] : data.ngay_su_dung;
            setNgaySuDung(dateStr);
          } catch { /* ignore */ }
        }

        if (data.confidence_score !== undefined && typeof data.confidence_score === 'number' && data.confidence_score < 70) {
          setConfidenceWarning(`AI chưa chắc chắn (${data.confidence_score}%). Lý do: ${data.confidence_reason || 'Thiếu thông tin'}.`);
        }
        
        // Tự động chuyển sang Tab Thủ công để User review thông tin
        setActiveTab('manual');
      }
    } catch {
      setError('AI gặp khó khăn khi trích xuất. Có thể file không rõ hoặc thiếu thông tin.');
    } finally {
      setAutoFillLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!tieu_de.trim()) { setError('Vui lòng nhập tên vé'); setActiveTab('manual'); return; }
    setLoading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('tieu_de', tieu_de.trim());
      if (loai_ve) fd.append('loai_ve', loai_ve);
      if (ngay_su_dung) fd.append('ngay_su_dung', ngay_su_dung);
      if (ghi_chu) fd.append('ghi_chu', ghi_chu);
      if (chi_tiet.tuyen_duong || chi_tiet.gio_khoi_hanh || chi_tiet.thoi_gian_den || chi_tiet.so_ghe || chi_tiet.gia_tien) {
        fd.append('chi_tiet', JSON.stringify(chi_tiet));
      }
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-[28px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-5 shrink-0 flex items-center justify-between">
          <div>
            <h2 className="text-white font-bold text-base">Thêm vé mới</h2>
            <p className="text-white/70 text-xs mt-0.5">Lưu trữ vé vào kho cá nhân</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 bg-slate-100 mx-6 mt-6 rounded-2xl shrink-0">
          <button
            onClick={() => setActiveTab('ai')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-xl transition-all ${activeTab === 'ai' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${activeTab === 'ai' ? 'text-amber-400' : 'text-slate-400'}`} />
            Sử dụng AI ✨
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-xl transition-all ${activeTab === 'manual' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <FileText className={`w-3.5 h-3.5 ${activeTab === 'manual' ? 'text-indigo-500' : 'text-slate-400'}`} />
            Nhập thủ công
          </button>
        </div>

        <div className="p-6 pt-4 space-y-4 overflow-y-auto custom-scrollbar">
          {activeTab === 'ai' ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="text-center space-y-1">
                <p className="text-sm font-bold text-slate-800">Cung cấp dữ liệu để AI đọc</p>
                <p className="text-xs text-slate-400">Tải ảnh/PDF vé hoặc dán nội dung email</p>
              </div>

              <div
                onClick={() => fileRef.current?.click()}
                onDrop={(e) => { e.preventDefault(); setFile(e.dataTransfer.files[0]); }}
                onDragOver={(e) => e.preventDefault()}
                className={`group relative flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-[24px] p-8 text-center cursor-pointer transition-all h-40 ${file ? 'border-indigo-400 bg-indigo-50/50' : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'}`}
              >
                <input ref={fileRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
                {file ? (
                  <>
                    <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                      <FileText className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-bold text-indigo-600 line-clamp-1 max-w-[200px]">{file.name}</span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setFile(null); }} 
                      className="absolute top-3 right-3 w-6 h-6 rounded-full bg-white text-slate-400 hover:text-red-500 shadow-sm flex items-center justify-center transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 group-hover:bg-indigo-100 flex items-center justify-center text-slate-400 group-hover:text-indigo-500 transition-colors">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-600">Kéo thả hoặc bấm để tải file</p>
                      <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">Hỗ trợ PDF, JPG, PNG lên đến 5MB</p>
                    </div>
                  </>
                )}
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-slate-100"></div>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest text-slate-400">
                  <span className="bg-white px-3">Hoặc dùng văn bản</span>
                </div>
              </div>

              <textarea
                placeholder="Dán nội dung từ email, tin nhắn..."
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                className="w-full px-4 py-3 text-sm border-2 border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 resize-none h-32 bg-slate-50/30"
              />

              <button
                onClick={handleAutoFill}
                disabled={autoFillLoading || (!file && !pasteText.trim())}
                className="w-full py-3.5 text-sm font-extrabold text-white bg-indigo-600 rounded-2xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:shadow-none"
              >
                {autoFillLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-amber-300" />}
                {autoFillLoading ? 'AI đang phân tích vé...' : 'Trích xuất thông tin ✨'}
              </button>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <input
                type="text"
                placeholder="Tên vé *"
                value={tieu_de}
                onChange={(e) => setTieuDe(e.target.value)}
                className="w-full px-4 py-2.5 text-sm border-2 border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />

              <div className="flex gap-3">
                <select
                  value={loai_ve}
                  onChange={(e) => setLoaiVe(e.target.value)}
                  className="flex-1 px-4 py-2.5 text-sm border-2 border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
                >
                  <option value="">Loại vé</option>
                  <option value="bus">Xe điện / xe khách</option>
                  <option value="train">Tàu hỏa</option>
                  <option value="event">Sự kiện / Giải trí</option>
                  <option value="other">Khác</option>
                </select>
                <input
                  type="date"
                  value={ngay_su_dung}
                  onChange={(e) => setNgaySuDung(e.target.value)}
                  className="flex-1 px-4 py-2.5 text-sm border-2 border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 p-4 bg-indigo-50/30 rounded-[20px] border border-indigo-100">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-indigo-600 uppercase ml-1">Giá tiền</label>
                  <input
                    type="text"
                    placeholder="VD: 500.000đ"
                    value={chi_tiet.gia_tien}
                    onChange={(e) => setChiTiet({ ...chi_tiet, gia_tien: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-indigo-600 uppercase ml-1">Số ghế / Khu</label>
                  <input
                    type="text"
                    placeholder="VD: A12, Zone B"
                    value={chi_tiet.so_ghe}
                    onChange={(e) => setChiTiet({ ...chi_tiet, so_ghe: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                </div>

                {['bus', 'train', 'other'].includes(loai_ve) && (
                  <>
                    <div className="col-span-2 space-y-1 mt-1">
                      <label className="text-[10px] font-bold text-indigo-600 uppercase ml-1">Tuyến đường</label>
                      <input
                        type="text"
                        placeholder="VD: Sài Gòn - Đà Lạt"
                        value={chi_tiet.tuyen_duong}
                        onChange={(e) => setChiTiet({ ...chi_tiet, tuyen_duong: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-indigo-600 uppercase ml-1">Giờ khởi hành</label>
                      <input
                        type="text"
                        placeholder="VD: 20:00"
                        value={chi_tiet.gio_khoi_hanh}
                        onChange={(e) => setChiTiet({ ...chi_tiet, gio_khoi_hanh: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-indigo-600 uppercase ml-1">Giờ đến (dự kiến)</label>
                      <input
                        type="text"
                        placeholder="VD: 04:00"
                        value={chi_tiet.thoi_gian_den}
                        onChange={(e) => setChiTiet({ ...chi_tiet, thoi_gian_den: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300"
                      />
                    </div>
                  </>
                )}
              </div>

              <textarea
                placeholder="Ghi chú thêm (Mã vé, cổng đón...)"
                value={ghi_chu}
                onChange={(e) => setGhiChu(e.target.value)}
                rows={2}
                className="w-full px-4 py-2.5 text-sm border-2 border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none bg-slate-50/20"
              />

              {confidenceWarning && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2 items-start mt-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-amber-700 font-semibold leading-relaxed">{confidenceWarning}</p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => {
                    if (confirm('Bạn muốn xóa trắng thông tin đã nhập?')) {
                      setTieuDe(''); setLoaiVe(''); setNgaySuDung(''); setGhiChu('');
                      setChiTiet({ tuyen_duong: '', gio_khoi_hanh: '', thoi_gian_den: '', so_ghe: '', gia_tien: '' });
                    }
                  }} 
                  className="flex-1 py-3 text-xs font-bold text-slate-500 border-2 border-slate-100 rounded-2xl hover:bg-slate-50 transition-colors"
                >
                  Xóa trắng
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-[2] py-3 text-sm font-extrabold text-white bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {loading ? 'Đang lưu...' : 'Lưu vào kho vé'}
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="animate-in zoom-in-95 duration-200 bg-red-50 border border-red-200 rounded-xl p-3 text-center">
              <p className="text-xs text-red-600 font-bold">{error}</p>
            </div>
          )}
        </div>
        
        {/* Footer info lock */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 shrink-0">
          <p className="text-[10px] text-slate-400 text-center font-medium italic">
            Dữ liệu của bạn được bảo mật và lưu trữ mã hóa trên hệ thống.
          </p>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// TicketCard
// ──────────────────────────────────────────────────────────────────────────

function TicketCard({
  ticket,
  onArchive,
  onDelete,
  archiving,
  deleting,
}: {
  ticket: TicketType;
  onArchive: (id: number, val: boolean) => void;
  onDelete: (id: number) => void;
  archiving: number | null;
  deleting: number | null;
}) {
  return (
    <div className={`rounded-[20px] border-2 bg-white p-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow ${ticket.trang_thai ? 'border-slate-200' : 'border-slate-100 opacity-70'}`}>
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
          <TicketFileIcon kieu_file={ticket.kieu_file} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-slate-800 truncate">{ticket.tieu_de}</h3>
          <div className="flex flex-wrap items-center gap-1.5 mt-1">
            {ticket.loai_ve && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-600 font-semibold">{loaiLabel(ticket.loai_ve)}</span>
            )}
            {ticket.ngay_su_dung && (
              <span className="flex items-center gap-0.5 text-[11px] text-slate-400">
                <Calendar className="w-3 h-3" />{formatDate(ticket.ngay_su_dung)}
              </span>
            )}
            {!ticket.trang_thai && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-semibold">Đã lưu trữ</span>
            )}
          </div>
          
          {ticket.chi_tiet?.tuyen_duong && (
            <p className="text-xs text-indigo-600 font-semibold mt-1.5 flex items-center gap-1">🛣️ {ticket.chi_tiet.tuyen_duong}</p>
          )}
          {ticket.chi_tiet && (ticket.chi_tiet.gio_khoi_hanh || ticket.chi_tiet.so_ghe || ticket.chi_tiet.gia_tien) && (
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              {ticket.chi_tiet.gio_khoi_hanh && <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded pl-1 bg-slate-100 text-slate-600">🕒 {ticket.chi_tiet.gio_khoi_hanh}</span>}
              {ticket.chi_tiet.thoi_gian_den && <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-50 text-slate-400">→ {ticket.chi_tiet.thoi_gian_den}</span>}
              {ticket.chi_tiet.so_ghe && <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 border border-indigo-100">💺 {ticket.chi_tiet.so_ghe}</span>}
              {ticket.chi_tiet.gia_tien && <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-100">💰 {ticket.chi_tiet.gia_tien}</span>}
            </div>
          )}

          {ticket.ghi_chu && <p className="text-[11px] text-slate-400 mt-2 line-clamp-2 bg-slate-50 p-1.5 rounded">{ticket.ghi_chu}</p>}
          
          {/* Attached Trips Badge */}
          {ticket.attachedTrips && ticket.attachedTrips.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-1.5 border-t border-slate-50 pt-2.5">
              {ticket.attachedTrips.map((trip) => (
                <div 
                  key={trip.lichtrinh_id}
                  className="group/trip flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 text-[10px] font-bold text-emerald-600 border border-emerald-100/50"
                  title={`Gắn tại: ${trip.diadiem_ten}`}
                >
                  <MapPin className="w-2.5 h-2.5" />
                  <span className="truncate max-w-[120px]">{trip.tieude}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        {ticket.file_url && (
          <a
            href={ticket.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />Xem file
          </a>
        )}
        <button
          onClick={() => onArchive(ticket.ve_id, !ticket.trang_thai)}
          disabled={archiving === ticket.ve_id}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors disabled:opacity-50"
        >
          {archiving === ticket.ve_id ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : ticket.trang_thai ? (
            <><Archive className="w-3.5 h-3.5" />Lưu trữ</>
          ) : (
            <><ArchiveRestore className="w-3.5 h-3.5" />Khôi phục</>
          )}
        </button>
        <button
          onClick={() => onDelete(ticket.ve_id)}
          disabled={deleting === ticket.ve_id}
          className="w-9 flex items-center justify-center py-2 text-xs font-semibold text-red-500 bg-red-50 rounded-xl hover:bg-red-100 transition-colors disabled:opacity-50"
        >
          {deleting === ticket.ve_id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Page
// ──────────────────────────────────────────────────────────────────────────

export default function TicketsPage() {
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [search, setSearch] = useState('');
  const [filterLoai, setFilterLoai] = useState('');
  const [tab, setTab] = useState<'active' | 'archived'>('active');
  const [archiving, setArchiving] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);

  useEffect(() => {
    ticketService.getMyTickets().then((data) => {
      setTickets(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const displayed = useMemo(() => {
    return tickets.filter((t) => {
      const matchTab = tab === 'active' ? t.trang_thai : !t.trang_thai;
      const matchSearch = t.tieu_de.toLowerCase().includes(search.toLowerCase());
      const matchLoai = !filterLoai || t.loai_ve === filterLoai;
      return matchTab && matchSearch && matchLoai;
    });
  }, [tickets, tab, search, filterLoai]);

  const handleArchive = async (id: number, newState: boolean) => {
    setArchiving(id);
    try {
      const updated = await ticketService.updateTicket(id, { trang_thai: newState });
      setTickets((prev) => prev.map((t) => (t.ve_id === id ? updated : t)));
    } catch { /* ignore */ }
    setArchiving(null);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Xóa vé này sẽ xóa luôn file đã upload. Tiếp tục?')) return;
    setDeleting(id);
    try {
      await ticketService.deleteTicket(id);
      setTickets((prev) => prev.filter((t) => t.ve_id !== id));
    } catch { /* ignore */ }
    setDeleting(null);
  };

  const activeCount = tickets.filter((t) => t.trang_thai).length;
  const archivedCount = tickets.filter((t) => !t.trang_thai).length;

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 text-white rounded-[24px] px-6 py-8 shadow-xl shadow-indigo-500/10">
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-white/5 blur-3xl" />
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Ticket className="w-5 h-5 text-amber-300" />
              <span className="text-xs font-semibold text-indigo-200 uppercase tracking-widest">Kho vé</span>
            </div>
            <h1 className="text-2xl font-extrabold">Vé điện tử của tôi</h1>
            <p className="text-indigo-200 text-sm mt-1">Quản lý vé máy bay, tàu xe và sự kiện của bạn.</p>
          </div>
          <button
            onClick={() => setShowUpload(true)}
            className="shrink-0 flex items-center gap-2 px-4 py-3 bg-white text-indigo-700 font-bold text-sm rounded-2xl hover:shadow-xl transition-all hover:scale-105 active:scale-95 shadow-lg"
          >
            <Plus className="w-4 h-4" />
            Upload vé
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 flex-1 px-4 py-2.5 bg-white border-2 border-slate-200 rounded-2xl">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Tìm theo tên vé..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 text-sm outline-none placeholder-slate-400"
          />
        </div>
        <div className="flex gap-2">
          {LOAI_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilterLoai(f.value)}
              className={`px-3 py-2 text-xs font-semibold rounded-xl transition-all ${filterLoai === f.value ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-1 p-1 bg-slate-100 rounded-2xl w-fit">
        <button
          onClick={() => setTab('active')}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${tab === 'active' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Đang sử dụng ({activeCount})
        </button>
        <button
          onClick={() => setTab('archived')}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${tab === 'archived' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Đã lưu trữ ({archivedCount})
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-[20px] border-2 border-slate-100 bg-slate-50 p-4 h-40 animate-pulse" />
          ))}
        </div>
      ) : displayed.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 bg-white rounded-3xl border-2 border-dashed border-slate-100">
          <Ticket className="w-12 h-12 mb-3 opacity-30" />
          <p className="text-lg font-semibold">{tab === 'active' ? 'Kho vé trống' : 'Chưa có vé đã lưu trữ'}</p>
          <p className="text-sm mt-1">{tab === 'active' ? 'Nhấn "Upload vé" để bắt đầu thêm.' : 'Bạn có thể lưu trữ vé cũ để dọn dẹp kho.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayed.map((ticket) => (
            <TicketCard
              key={ticket.ve_id}
              ticket={ticket}
              onArchive={handleArchive}
              onDelete={handleDelete}
              archiving={archiving}
              deleting={deleting}
            />
          ))}
        </div>
      )}

      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onCreated={(t) => {
            setTickets((prev) => [t, ...prev]);
            setShowUpload(false);
          }}
        />
      )}
    </div>
  );
}
