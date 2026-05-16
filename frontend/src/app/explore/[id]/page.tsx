'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Heart, 
  MessageSquare, 
  Share2, 
  Plus, 
  MapPin, 
  Clock, 
  ChevronLeft, 
  Calendar,
  Navigation,
  Loader2,
  Send
} from 'lucide-react';
import { postService } from '@/features/itinerary/services/postService';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

export default function PostDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (id) fetchPostDetails();
  }, [id]);

  const fetchPostDetails = async () => {
    try {
      const data = await postService.getPostById(Number(id));
      setPost(data);
    } catch (error) {
      toast.error('Không tìm thấy bài viết');
      router.push('/explore');
    } finally {
      setLoading(false);
    }
  };

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const newComment = await postService.addComment(Number(id), commentText);
      setPost((prev: any) => ({
        ...prev,
        binhluan: [newComment, ...(prev.binhluan || [])]
      }));
      setCommentText('');
      toast.success('Đã đăng bình luận');
    } catch (error) {
      toast.error('Lỗi khi gửi bình luận');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
    </div>
  );

  if (!post) return null;

  return (
    <div className="max-w-[1600px] mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
      {/* Left Column: Post Details & Timeline */}
      <div className="flex-1 space-y-8">
        {/* Navigation & Header */}
        <div className="flex flex-col gap-6">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group w-fit"
          >
            <ChevronLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
            <span className="text-sm font-bold uppercase tracking-widest">Quay lại</span>
          </button>

          <h1 className="text-4xl font-black text-white tracking-tighter leading-tight">
            {post.tieude}
          </h1>

          <div className="flex items-center justify-between py-4 border-y border-white/5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center overflow-hidden">
                {post.nguoidung.avatar ? (
                  <img src={post.nguoidung.avatar} className="w-full h-full object-cover" alt={post.nguoidung.ten} />
                ) : (
                  <span className="text-lg font-black text-indigo-400 capitalize">{post.nguoidung.ten[0]}</span>
                )}
              </div>
              <div>
                <p className="text-white font-bold">{post.nguoidung.ten}</p>
                <div className="flex items-center gap-4 text-xs text-slate-500 font-bold mt-1">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {post.lichtrinh.so_ngay} Ngày</span>
                  <span className="flex items-center gap-1 uppercase tracking-widest text-[#ef4444]">{post.trangthai_lichtrinh}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button className="px-6 py-2.5 rounded-xl bg-white/5 hover:bg-red-500/10 text-slate-300 hover:text-red-500 transition-all font-bold text-sm flex items-center gap-2">
                <Heart className="w-4 h-4" />
                Thích
              </button>
              <button className="px-8 py-2.5 rounded-xl bg-orange-500 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-orange-500/20 hover:scale-105 transition-all">
                Clone Itinerary
              </button>
            </div>
          </div>
        </div>

        {/* Itinerary Timeline */}
        <div className="space-y-6">
          <h2 className="text-xl font-black text-white flex items-center gap-3">
             <Navigation className="w-5 h-5 text-indigo-500" />
             Lịch trình chi tiết
          </h2>
          
          <div className="space-y-12 pl-4 border-l border-white/5 relative">
             {/* Render simplified timeline groups by day */}
             {[...Array(post.lichtrinh.so_ngay)].map((_, dayIdx) => (
                <div key={dayIdx} className="relative">
                  <div className="absolute -left-[25px] top-0 w-4 h-4 rounded-full bg-[#1c2128] border-2 border-indigo-500" />
                  <h3 className="text-lg font-black text-white mb-6 pl-4">Ngày {dayIdx + 1}</h3>
                  <div className="space-y-6 pl-4">
                    {post.lichtrinh.lichtrinh_nguoidung_diadiem
                      .filter((p: any) => p.ngay_thu_may === dayIdx + 1)
                      .map((item: any, idx: number) => (
                        <div key={idx} className="bg-[#1c2128] rounded-3xl p-6 border border-white/5 hover:border-indigo-500/20 transition-all group">
                           <div className="flex justify-between items-start gap-4">
                             <div className="flex-1">
                               <div className="flex items-center gap-2 text-indigo-400 text-xs font-black uppercase tracking-widest mb-2">
                                 <Clock className="w-3.5 h-3.5" />
                                 {item.thoigian_den ? format(new Date(item.thoigian_den), 'HH:mm') : 'Chưa định giờ'}
                               </div>
                               <h4 className="text-white font-bold text-lg mb-1">{item.diadiem.ten}</h4>
                               <p className="text-slate-500 text-sm flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {item.diadiem.diachi}</p>
                               {item.ghichu && <p className="mt-4 text-slate-400 text-sm leading-relaxed border-l-2 border-slate-700 pl-4">{item.ghichu}</p>}
                             </div>
                             <div className="w-24 h-24 rounded-2xl bg-black/40 overflow-hidden border border-white/5 shrink-0">
                               <img 
                                 src={`https://images.unsplash.com/photo-${1500000000000 + idx}?q=80&w=150&auto=format&fit=crop`} 
                                 className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" 
                               />
                             </div>
                           </div>
                        </div>
                      ))}
                  </div>
                </div>
             ))}
          </div>
        </div>
      </div>

      {/* Right Column: Large Map & Comments */}
      <div className="w-full lg:w-[500px] space-y-8">
        {/* Large Map View Placeholder */}
        <div className="aspect-[4/5] bg-slate-900 rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl relative">
          <div className="absolute inset-0 bg-[url('https://api.everviz.com/static/maps/world-low.svg')] bg-center bg-cover filter invert opacity-20" />
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="text-indigo-400 font-bold flex flex-col items-center gap-4">
               <Navigation className="w-12 h-12 animate-pulse" />
               Bản đồ lộ trình lớn mang phong cách Goong Maps
             </div>
          </div>
          {/* Overlay Actions */}
          <div className="absolute bottom-8 left-8 right-8 flex gap-4">
            <button className="flex-1 py-4 bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl text-white font-bold text-sm hover:bg-white/20 transition-all uppercase tracking-widest">Phóng to bản đồ</button>
          </div>
        </div>

        {/* Comment Section */}
        <div className="bg-[#1c2128] rounded-[3rem] border border-white/5 p-8 shadow-2xl h-[600px] flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black text-white flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-indigo-500" />
              Thảo luận ({post.binhluan?.length || 0})
            </h3>
          </div>

          {/* Comment List */}
          <div className="flex-1 overflow-y-auto space-y-6 pr-2 scrollbar-hide">
            {post.binhluan?.map((comment: any) => (
              <div key={comment.binhluan_id} className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center shrink-0">
                   {comment.nguoidung.avatar ? (
                     <img src={comment.nguoidung.avatar} className="w-full h-full object-cover rounded-xl" />
                   ) : (
                     <span className="text-sm font-bold text-slate-400 capitalize">{comment.nguoidung.ten[0]}</span>
                   )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-sm font-bold text-white">{comment.nguoidung.ten}</span>
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-medium">Bây giờ</span>
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed">{comment.noidung}</p>
                </div>
              </div>
            ))}
            {(!post.binhluan || post.binhluan.length === 0) && (
              <p className="text-center text-slate-500 py-10 italic text-sm">Chưa có bình luận nào. Hãy bắt đầu cuộc trò chuyện!</p>
            )}
          </div>

          {/* Comment Input */}
          <form onSubmit={handleSendComment} className="mt-8 pt-6 border-t border-white/5 flex gap-3">
            <input 
              type="text" 
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Viết bình luận của bạn..."
              className="flex-1 bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:bg-white/10 transition-all focus:ring-1 focus:ring-indigo-500/30"
            />
            <button 
              type="submit"
              disabled={isSubmitting || !commentText.trim()}
              className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20 active:scale-95 disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
