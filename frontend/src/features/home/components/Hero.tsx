'use client';

import React from 'react';
import { Search, MapPin, Calendar, Users, ArrowRight } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center pt-20 overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/assets/home/hero.png" 
          alt="Vietnam Landscape"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-slate-900/90 shadow-inner"></div>
      </div>

      {/* Decorative Floating Elements */}
      <div className="absolute top-1/4 left-10 w-64 h-64 bg-indigo-500/20 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-sky-500/10 rounded-full blur-[120px] animate-pulse delay-700"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full py-12">
        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-10 duration-1000">
          <span className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-xs font-bold text-sky-300 uppercase tracking-[0.2em] mb-6">
            Khám phá tinh hoa Việt Nam
          </span>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tighter leading-none mb-8">
            Hành trình <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400">
              Trong tầm tay
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-white/70 font-medium leading-relaxed">
            Lập kế hoạch cho chuyến đi mơ ước của bạn với sự hỗ trợ từ các chuyên gia địa phương 
            và công nghệ thông minh nhất hiện nay.
          </p>
        </div>

        {/* Search Bar - Premium Glassmorphism */}
        <div className="max-w-5xl mx-auto bg-white/10 backdrop-blur-2xl border border-white/20 p-2 md:p-3 rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row items-center gap-2 animate-in fade-in slide-in-from-bottom-20 duration-1000 delay-300">
          {/* Destination */}
          <div className="flex-1 w-full flex items-center gap-4 px-6 py-4 md:py-0 border-b md:border-b-0 md:border-r border-white/10">
            <MapPin className="w-6 h-6 text-sky-400 shrink-0" />
            <div className="flex-1">
              <label className="block text-[10px] font-bold text-white/50 uppercase tracking-widest mb-0.5">Địa điểm</label>
              <input 
                type="text" 
                placeholder="Bạn muốn đi đâu?" 
                className="w-full bg-transparent border-none text-white font-bold placeholder:text-white/30 focus:ring-0 p-0"
              />
            </div>
          </div>

          {/* Date */}
          <div className="flex-1 w-full flex items-center gap-4 px-6 py-4 md:py-0 border-b md:border-b-0 md:border-r border-white/10">
            <Calendar className="w-6 h-6 text-sky-400 shrink-0" />
            <div className="flex-1">
              <label className="block text-[10px] font-bold text-white/50 uppercase tracking-widest mb-0.5">Thời gian</label>
              <input 
                type="text" 
                placeholder="Chọn ngày đi" 
                className="w-full bg-transparent border-none text-white font-bold placeholder:text-white/30 focus:ring-0 p-0"
              />
            </div>
          </div>

          {/* Travelers */}
          <div className="flex-1 w-full flex items-center gap-4 px-6 py-4 md:py-0">
            <Users className="w-6 h-6 text-sky-400 shrink-0" />
            <div className="flex-1">
              <label className="block text-[10px] font-bold text-white/50 uppercase tracking-widest mb-0.5">Hành khách</label>
              <input 
                type="text" 
                placeholder="Thêm người" 
                className="w-full bg-transparent border-none text-white font-bold placeholder:text-white/30 focus:ring-0 p-0"
              />
            </div>
          </div>

          {/* Search Button */}
          <button className="w-full md:w-auto px-8 py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[2rem] font-black tracking-widest transition-all flex items-center justify-center gap-3 active:scale-95 group">
            TÌM KIẾM
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Floating Stats */}
        <div className="hidden lg:flex justify-center gap-16 mt-16 scale-90 opacity-60">
          <div className="text-center">
            <p className="text-3xl font-black text-white">500+</p>
            <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Địa điểm</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-black text-white">1.2k</p>
            <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Lịch trình</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-black text-white">200+</p>
            <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Chuyên gia</p>
          </div>
        </div>
      </div>
    </section>
  );
}
