'use client';

import React from 'react';
import { ArrowRight, MapPin, Star } from 'lucide-react';
import Link from 'next/link';

const CATEGORIES = [
  { id: 1, name: 'Biển Đảo', count: 124, img: '/assets/home/beach.png', color: 'from-blue-600/60' },
  { id: 2, name: 'Núi Rừng', count: 85, img: '/assets/home/nature.png', color: 'from-green-600/60' },
  { id: 3, name: 'Thành Phố', count: 210, img: '/assets/home/city.png', color: 'from-purple-600/60' },
];

export function PopularDestinations() {
  return (
    <section className="py-24 px-6 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20 animate-in fade-in slide-in-from-top-10 duration-1000">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-4">
            Khám phá theo <span className="text-indigo-600">chủ đề</span>
          </h2>
          <p className="text-slate-500 font-medium max-w-xl mx-auto">
            Hợp nhất đam mê của bạn với những điểm đến được tuyển chọn kỹ lưỡng theo từng phong cách du lịch.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {CATEGORIES.map((cat, idx) => (
            <Link 
              href="#" 
              key={cat.id}
              className="group relative h-[450px] rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-200 transition-all duration-700 hover:-translate-y-4"
              style={{ transitionDelay: `${idx * 150}ms` }}
            >
              <img 
                src={cat.img} 
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-1000"
              />
              <div className={`absolute inset-0 bg-gradient-to-t ${cat.color} to-transparent opacity-60 group-hover:opacity-80 transition-opacity`}></div>
              
              <div className="absolute inset-0 p-10 flex flex-col justify-end text-white">
                <span className="text-xs font-black uppercase tracking-[0.3em] mb-2 opacity-70 group-hover:opacity-100 transition-opacity delay-100">
                  {cat.count} ĐỊA ĐIỂM
                </span>
                <h3 className="text-3xl font-black tracking-tighter mb-4 group-hover:translate-x-2 transition-transform duration-500">
                  {cat.name}
                </h3>
                
                <div className="flex items-center gap-2 text-sm font-bold opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-200">
                  Khám phá ngay <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Newsletter / CTA Box */}
        <div className="mt-24 relative bg-indigo-600 rounded-[3rem] p-12 md:p-20 overflow-hidden shadow-3xl shadow-indigo-200">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-sky-400/20 rounded-full -ml-32 -mb-32 blur-2xl animate-pulse delay-500"></div>

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="max-w-xl text-center md:text-left">
              <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-6">
                Nhận thông tin <br />
                <span className="text-sky-300">ưu đãi mới nhất</span>
              </h2>
              <p className="text-white/70 font-medium">
                Đăng ký để không bỏ lỡ các cẩm nang du lịch và lịch trình từ những Local Guide hàng đầu Việt Nam.
              </p>
            </div>
            <div className="w-full md:w-auto flex flex-col sm:flex-row gap-4">
              <input 
                type="email" 
                placeholder="Email của bạn..." 
                className="px-8 py-5 bg-white shadow-lg rounded-2xl md:w-80 font-bold focus:ring-4 focus:ring-sky-400/30 transition-shadow outline-none"
              />
              <button className="px-10 py-5 bg-slate-900 text-white rounded-2xl font-black tracking-widest hover:bg-slate-800 hover:shadow-xl active:scale-95 transition-all">
                ĐĂNG KÝ
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
