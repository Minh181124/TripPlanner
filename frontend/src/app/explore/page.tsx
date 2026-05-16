'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, Sparkles, Map, Compass, TrendingUp } from 'lucide-react';
import { postService } from '@/features/itinerary/services/postService';
import { FeedCard } from '@/features/social/ui/FeedCard';

export default function ExplorePage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, [page]);

  const fetchPosts = async () => {
    try {
      const data = await postService.getPosts(page, 10);
      const newPosts = data?.data || [];
      
      if (page === 1) {
        setPosts(newPosts);
      } else {
        setPosts((prev) => [...prev, ...newPosts]);
      }
      setHasMore(newPosts.length === 10);
    } catch (error) {
      console.error('Fetch posts error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Search Header */}
      <div className="relative mb-12 rounded-[3.5rem] bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 p-8 sm:p-16 overflow-hidden border border-white/5 shadow-2xl">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/10 blur-[100px] rounded-full" />
        
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 mb-8">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span className="text-[11px] font-black uppercase tracking-[0.4em] text-indigo-400">Khám phá cộng đồng</span>
          </div>
          <h1 className="text-5xl sm:text-6xl font-black text-white tracking-tighter mb-10 leading-[1.1]">
            Cảm hứng cho <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-400 to-blue-400">chuyến đi tiếp theo</span> của bạn
          </h1>
          
          <div className="relative flex flex-col sm:flex-row gap-4 max-w-2xl">
            <div className="relative flex-1 group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
              <input 
                type="text" 
                placeholder="Tìm hashtag, địa danh (vd: #DaLat, Hà Nội)..."
                className="w-full pl-14 pr-6 py-5 rounded-[1.5rem] bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:bg-white/10 backdrop-blur-md transition-all"
              />
            </div>
            <button className="px-10 py-5 rounded-[1.5rem] bg-indigo-600 text-white font-black text-sm uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-3">
              <Filter className="w-4 h-4" />
              Tìm kiếm
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Main Feed */}
        <div className="flex-1 space-y-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                <Compass className="w-5 h-5 text-indigo-400" />
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">Bài viết mới nhất</h2>
            </div>
            <div className="flex gap-2 bg-white/5 p-1 rounded-2xl border border-white/5">
              <button className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold uppercase tracking-wider shadow-lg">Mới nhất</button>
              <button className="px-5 py-2 rounded-xl text-slate-500 hover:text-slate-300 text-xs font-bold uppercase tracking-wider transition-all">Xu hướng</button>
            </div>
          </div>

          {loading && page === 1 ? (
            <div className="grid grid-cols-1 gap-10">
              {[1, 2].map((i) => (
                <div key={i} className="h-96 rounded-[2.5rem] bg-white/5 animate-pulse border border-white/5" />
              ))}
            </div>
          ) : posts.length > 0 ? (
            <div className="grid grid-cols-1 gap-10">
              {posts.map((post) => (
                <FeedCard key={post.baiviet_id} post={post} />
              ))}
            </div>
          ) : (
            <div className="py-32 text-center bg-[#1c2128]/50 rounded-[3rem] border border-white/5 backdrop-blur-sm">
               <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-indigo-500/20">
                 <Map className="w-8 h-8 text-indigo-400/50" />
               </div>
               <p className="text-xl font-bold text-white">Chưa có bài viết nào</p>
               <p className="text-slate-500 mt-2 max-w-sm mx-auto">Hãy là người đầu tiên chia sẻ lịch trình tuyệt vời của bạn tới cộng đồng!</p>
            </div>
          )}

          {hasMore && !loading && (
            <div className="flex justify-center pt-10">
              <button 
                onClick={() => setPage((p) => p + 1)}
                className="px-12 py-5 rounded-[2rem] bg-white/5 border border-white/10 text-slate-300 font-black text-xs uppercase tracking-[0.2em] hover:bg-white/10 hover:border-indigo-500/30 transition-all shadow-xl"
              >
                Tải thêm bài viết
              </button>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-[350px] space-y-10">
          {/* Trending Suggestions */}
          <div className="bg-[#1c2128] rounded-[2.5rem] border border-white/5 p-8 shadow-2xl sticky top-32">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                <TrendingUp className="w-4 h-4 text-orange-500" />
              </div>
              <h3 className="text-lg font-black text-white tracking-tight">Xu hướng</h3>
            </div>
            <div className="space-y-3">
              {['#DaLat', '#SaPa', '#FoodTourHanoi', '#NinhBinh', '#IslandHopping'].map((tag) => (
                <button key={tag} className="block w-full text-left px-5 py-4 rounded-2xl hover:bg-white/5 text-slate-400 hover:text-indigo-400 font-bold transition-all border border-transparent hover:border-white/5">
                  <span className="text-indigo-500/50 mr-2">#</span>
                  {tag.replace('#', '')}
                </button>
              ))}
            </div>
            
            <div className="mt-10 pt-8 border-t border-white/5">
              <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl p-6 relative overflow-hidden group cursor-pointer">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 blur-2xl rounded-full -mr-12 -mt-12" />
                <h4 className="text-white font-black text-lg mb-2 relative z-10">Bạn có lịch trình hay?</h4>
                <p className="text-indigo-100 text-xs mb-4 relative z-10 leading-relaxed font-medium">Chia sẻ ngay để nhận được sự quan tâm từ cộng đồng du lịch!</p>
                <button 
                  onClick={() => window.location.href = '/dashboard/planner'}
                  className="bg-white text-indigo-600 px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-transform"
                >
                  Đăng bài ngay
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
