'use client';

import React, { useEffect, useState } from 'react';
import { itineraryAdminService, ItineraryMau } from '@/features/auth';
import { MapPin, Clock, Star, ArrowRight, Loader } from 'lucide-react';
import Link from 'next/link';

export function FeaturedTours() {
  const [tours, setTours] = useState<ItineraryMau[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTours = async () => {
      try {
        const res = await itineraryAdminService.getTemplateTours();
        // Take top 6 or all
        const data = Array.isArray(res) ? res : (res?.data || []);
        setTours(data.slice(0, 6));
      } catch (error) {
        console.error('Error fetching tours:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTours();
  }, []);

  if (isLoading) {
    return (
      <div className="py-20 text-center">
        <Loader className="w-10 h-10 text-indigo-600 animate-spin mx-auto mb-4" />
        <p className="text-slate-500 font-medium">Đang tìm kiếm những chuyến đi tốt nhất...</p>
      </div>
    );
  }

  return (
    <section className="py-24 px-6 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <h6 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] mb-4">Gợi ý cho bạn</h6>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter leading-tight">
              Khám phá các <br />
              <span className="text-indigo-600 underline decoration-sky-400 decoration-8 underline-offset-4">Tours nổi bật</span>
            </h2>
          </div>
          <Link 
            href="#" 
            className="group flex items-center gap-3 text-sm font-black text-slate-900 tracking-widest uppercase hover:text-indigo-600 transition-colors"
          >
            Xem tất cả <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {tours.map((tour, idx) => (
            <div 
              key={tour.lichtrinh_mau_id} 
              className="group relative bg-white rounded-3xl overflow-hidden border border-slate-100/50 shadow-xl shadow-slate-100 hover:shadow-2xl hover:shadow-indigo-100 hover:-translate-y-2 transition-all duration-500"
              style={{ transitionDelay: `${idx * 100}ms` }}
            >
              {/* Image Placeholder or Real image if available */}
              <div className="relative h-64 overflow-hidden">
                <div className="absolute inset-0 bg-slate-200 animate-pulse"></div>
                <img 
                  src={`https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D`} 
                  alt={tour.tieude}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-0 onLoad-fade-in"
                  onLoad={(e: any) => e.target.classList.add('opacity-100')}
                />
                
                {/* Badges */}
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-black text-slate-900 uppercase tracking-wider">
                    {tour.thoigian_dukien || 'Tùy chọn'}
                  </span>
                  {tour.luotthich != null && tour.luotthich > 0 && (
                    <span className="px-3 py-1 bg-amber-400 rounded-full text-[10px] font-black text-white flex items-center gap-1 uppercase tracking-wider">
                      <Star className="w-3 h-3 fill-white" /> {tour.luotthich}
                    </span>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-8">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lịch trình chuyên gia</span>
                </div>
                
                <h3 className="text-xl font-black text-slate-900 mb-3 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                  {tour.tieude}
                </h3>
                
                <p className="text-sm text-slate-500 mb-6 line-clamp-2 leading-relaxed">
                  {tour.mota || 'Khám phá những điểm đến tuyệt vời nhất cùng sự hướng dẫn tận tình từ người bản địa.'}
                </p>

                <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                      {tour.lichtrinh_mau_diadiem?.length || 0} điểm
                    </div>
                    {tour.tong_khoangcach && (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                        <Clock className="w-3.5 h-3.5 text-indigo-500" />
                        {(tour.tong_khoangcach / 1000).toFixed(1)} km
                      </div>
                    )}
                  </div>
                  
                  <button className="p-3 bg-slate-50 text-slate-900 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all active:scale-90">
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
