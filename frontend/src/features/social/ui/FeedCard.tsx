'use client';

import React, { useState } from 'react';
import { Heart, MessageSquare, Share2, Plus, Map as MapIcon, Check, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { postService } from '@/features/itinerary/services/postService';
import { toast } from 'react-hot-toast';

interface FeedCardProps {
  post: {
    baiviet_id: number;
    tieude: string;
    noidung?: string;
    trangthai_lichtrinh: string;
    ngaytao: string;
    nguoidung: {
      ten: string;
      avatar?: string;
    };
    lichtrinh?: {
      lichtrinh_nguoidung_diadiem: any[];
      tuyen_duong: any[];
      so_ngay: number;
    };
    _count: {
      tuongtac: number;
      binhluan: number;
    };
  };
}

export function FeedCard({ post }: FeedCardProps) {
  const [isLiked, setIsLiked] = useState(false); // Should ideally come from API if current user liked it
  const [likeCount, setLikeCount] = useState(post._count.tuongtac);
  const [isCloning, setIsCloning] = useState(false);
  const [isCloned, setIsCloned] = useState(false);

  const placeCount = post.lichtrinh?.lichtrinh_nguoidung_diadiem?.length || 0;
  const dayCount = post.lichtrinh?.so_ngay || 3;

  const handleLike = async () => {
    try {
      const res = await postService.toggleLike(post.baiviet_id);
      setIsLiked(res.liked);
      setLikeCount(prev => res.liked ? prev + 1 : prev - 1);
    } catch (error) {
      toast.error('Không thể thực hiện tương tác');
    }
  };

  const handleClone = async () => {
    if (isCloned || isCloning) return;
    
    try {
      setIsCloning(true);
      await postService.cloneItinerary(post.baiviet_id);
      setIsCloned(true);
      toast.success('Đã sao chép lịch trình vào kho của bạn!', {
        icon: '🚀',
        style: {
          borderRadius: '1rem',
          background: '#1c2128',
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.1)'
        }
      });
    } catch (error) {
      toast.error('Lỗi khi sao chép lịch trình');
    } finally {
      setIsCloning(false);
    }
  };

  return (
    <div className="bg-[#1c2128] rounded-[2.5rem] border border-white/5 p-6 mb-8 hover:border-white/10 transition-all group shadow-2xl relative overflow-hidden">
      {/* Glow Effect on Hover */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center overflow-hidden">
            {post.nguoidung.avatar ? (
              <img src={post.nguoidung.avatar} className="w-full h-full object-cover" alt={post.nguoidung.ten} />
            ) : (
              <span className="text-lg font-black text-indigo-400 capitalize">{post.nguoidung.ten.charAt(0)}</span>
            )}
          </div>
          <div>
            <h4 className="text-sm font-bold text-white mb-0.5">{post.nguoidung.ten}</h4>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Active</span>
            </div>
          </div>
        </div>
        <span className="text-[11px] font-medium text-slate-500 tracking-wider">
          {format(new Date(post.ngaytao), 'MMM dd, yyyy')}
        </span>
      </div>

      <Link href={`/explore/${post.baiviet_id}`}>
        <h3 className="text-xl font-bold text-white mb-6 leading-tight hover:text-indigo-400 transition-colors cursor-pointer group-hover:translate-x-1 decoration-indigo-500/0 hover:decoration-indigo-500/50 underline transition-all">
          {post.tieude}
        </h3>
      </Link>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2 relative aspect-[16/10] bg-[#0d1117] rounded-3xl overflow-hidden border border-white/5 group/map">
          <div className="absolute inset-0 opacity-40 bg-[url('https://api.everviz.com/static/maps/world-low.svg')] bg-center bg-cover filter invert transition-transform duration-1000 group-hover/map:scale-110" />
          <div className="absolute inset-0 flex items-center justify-center">
             <svg className="w-4/5 h-4/5 text-indigo-500/40" viewBox="0 0 100 100">
               <path d="M20,80 Q40,20 60,80 T90,20" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 2" />
               <circle cx="20" cy="80" r="2.5" fill="#ef4444" className="animate-pulse" />
               <circle cx="90" cy="20" r="2.5" fill="#3b82f6" />
             </svg>
          </div>
          <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
            <MapIcon className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-[10px] font-bold text-white uppercase tracking-wider">Interactive Map</span>
          </div>
          <div className="absolute bottom-4 right-4 flex gap-2">
            <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-lg text-[10px] font-bold text-slate-300 border border-white/5">
              {post.trangthai_lichtrinh}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex-1 bg-[#0d1117] rounded-3xl overflow-hidden border border-white/5 relative group/img">
            <img 
               src={`https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=400&auto=format&fit=crop`} 
               className="w-full h-full object-cover opacity-70 group-hover/img:scale-110 transition-transform duration-700" 
               alt="Destination"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          </div>
          <div className="bg-[#2d333b]/30 rounded-3xl border border-white/5 p-5 grid grid-cols-3 gap-2 backdrop-blur-sm">
            <div className="text-center">
              <p className="text-xl font-bold text-white">{dayCount}</p>
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">Days</p>
            </div>
            <div className="text-center border-x border-white/10">
              <p className="text-xl font-bold text-white">{placeCount}</p>
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">Places</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-amber-500">4.8</p>
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">Rating</p>
            </div>
          </div>
        </div>
      </div>

      <p className="text-slate-400 text-sm leading-relaxed line-clamp-2 mb-8 italic font-medium">
        {post.noidung || "Exploring the hidden gems and breathtaking landscapes. A journey filled with unforgettable moments..."}
      </p>

      <div className="flex items-center justify-between border-t border-white/5 pt-6">
        <div className="flex gap-4">
          <button 
            onClick={handleLike}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all border ${
              isLiked 
                ? 'bg-red-500/10 border-red-500/50 text-red-500' 
                : 'bg-white/5 border-white/5 text-slate-400 hover:text-red-500 hover:bg-red-500/5 hover:border-red-500/20'
            }`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500' : ''}`} />
            <span className="text-xs font-bold">{likeCount}</span>
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-indigo-500/5 border border-white/5 hover:border-indigo-500/20 rounded-xl transition-all text-slate-400 hover:text-indigo-400">
            <MessageSquare className="w-4 h-4" />
            <span className="text-xs font-bold">{post._count.binhluan}</span>
          </button>
        </div>

        <button 
          onClick={handleClone}
          disabled={isCloning || isCloned}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg ${
            isCloned 
              ? 'bg-emerald-500/10 border border-emerald-500/50 text-emerald-500'
              : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-600/20 active:scale-95'
          }`}
        >
          {isCloning ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : isCloned ? (
            <Check className="w-4 h-4" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          {isCloning ? 'Cloning...' : isCloned ? 'Cloned' : 'Clone Itinerary'}
        </button>
      </div>
    </div>
  );
}
