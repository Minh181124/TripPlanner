'use client';

import React, { useState } from 'react';
import { X, Sparkles, Image as ImageIcon, Send, AlertCircle } from 'lucide-react';
import { postService } from '@/features/itinerary/services/postService';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  itinerary: {
    id: number;
    tieude: string;
    trangthai: string;
    dayCount: number;
    stopCount: number;
  };
  onSuccess?: () => void;
}

export function ShareModal({ isOpen, onClose, itinerary, onSuccess }: ShareModalProps) {
  const [title, setTitle] = useState(itinerary.tieude);
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleShare = async () => {
    if (!title.trim()) {
      setError('Vui lòng nhập tiêu đề cho bài viết');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    try {
      await postService.createPost({
        itineraryId: itinerary.id,
        tieude: title,
        noidung: content,
      });
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Có lỗi xảy ra khi chia sẻ bài viết');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="relative h-32 bg-gradient-to-br from-indigo-600 to-violet-700 p-6 text-white">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-amber-300" />
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-100">Chia sẻ với cộng đồng</span>
          </div>
          <h3 className="text-2xl font-extrabold tracking-tight">Xuất bản lịch trình</h3>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 text-red-600 text-sm font-medium border border-red-100">
              <AlertCircle className="w-5 h-5 shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Title Input */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 px-1">Tiêu đề bài viết</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ví dụ: Chuyến đi Đà Lạt 3 ngày 2 đêm tuyệt vời..."
                className="w-full px-5 py-3 rounded-2xl border-2 border-slate-100 focus:border-indigo-500 focus:ring-0 transition-all text-slate-800 placeholder:text-slate-400"
              />
            </div>

            {/* Description Input */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 px-1">Cảm nghĩ của bạn (không bắt buộc)</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                placeholder="Chia sẻ một chút kinh nghiệm hoặc cảm xúc về chuyến đi này..."
                className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 focus:border-indigo-500 focus:ring-0 transition-all text-slate-800 placeholder:text-slate-400 resize-none"
              />
            </div>

            {/* Itinerary Preview Mini-Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
                <ImageIcon className="w-8 h-8 text-indigo-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">{itinerary.tieude}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">{itinerary.dayCount} ngày</span>
                  <span className="text-[11px] font-bold text-slate-500 uppercase">{itinerary.stopCount} địa điểm</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    itinerary.trangthai === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {itinerary.trangthai === 'completed' ? 'Đã đi' : 'Kế hoạch'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3.5 rounded-2xl border-2 border-slate-100 text-slate-600 font-bold hover:bg-slate-50 transition-all active:scale-[0.98]"
            >
              Hủy
            </button>
            <button
              onClick={handleShare}
              disabled={isSubmitting}
              className="flex-[2] flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-700 text-white font-bold shadow-lg shadow-indigo-200 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Đăng lên cộng đồng
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
