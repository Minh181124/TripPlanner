'use client';

import React from 'react';
import { HomeNavbar } from '@/features/home/components/HomeNavbar';
import { Hero } from '@/features/home/components/Hero';
import { FeaturedTours } from '@/features/home/components/FeaturedTours';
import { PopularDestinations } from '@/features/home/components/PopularDestinations';
import { ArrowRight, Globe, Mail, Phone, Compass, Users, MapPin, Zap } from 'lucide-react';
import Link from 'next/link';

/**
 * Modern User Home Page / Landing Page
 * Completely redesigned to be premium and functional for discovery.
 */
export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 selection:bg-indigo-500 selection:text-white">
      {/* Navigation Layer */}
      <HomeNavbar />

      {/* Hero Section */}
      <Hero />

      {/* Featured Tours Section */}
      <FeaturedTours />

      {/* Decorative Divider */}
      <div className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="h-[2px] w-full bg-slate-50 rounded-full bg-gradient-to-r from-transparent via-indigo-100 to-transparent"></div>
        </div>
      </div>

      {/* Popular Destinations Section */}
      <PopularDestinations />

      {/* Features Showcase */}
      <section className="py-24 bg-slate-900 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-20">
            <div className="lg:w-1/2">
              <h6 className="text-xs font-black text-sky-400 uppercase tracking-[0.3em] mb-4">Tại sao chọn Travel?</h6>
              <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-8 max-w-lg">
                Đưa trải nghiệm du lịch lên một <span className="text-sky-400 italic">tầm cao mới.</span>
              </h2>
              
              <div className="space-y-8 mt-12">
                <FeatureItem 
                  icon={<Compass className="w-6 h-6" />}
                  title="Địa điểm được tuyển chọn"
                  desc="Mỗi địa điểm và tour đều được xác minh bởi đội ngũ chuyên gia địa phương của chúng tôi."
                />
                <FeatureItem 
                  icon={<Users className="w-6 h-6" />}
                  title="Kết nối Local Guide"
                  desc="Tương tác trực tiếp với những người hiểu rõ mảnh đất họ sinh sống nhất."
                />
                <FeatureItem 
                  icon={<Zap className="w-6 h-6" />}
                  title="Lên kế hoạch thông minh"
                  desc="Công cụ kéo thả trực quan giúp bạn tạo lịch trình 3 ngày chỉ trong 3 phút."
                />
              </div>
            </div>

            {/* Visual Mock / High Impact Image */}
            <div className="lg:w-1/2 relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-sky-400 to-indigo-500 rounded-[3rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[3rem] h-[500px] overflow-hidden">
                 <img 
                   src="https://images.unsplash.com/photo-1533929736458-ca588d08c8be?q=80&w=1200&auto=format&fit=crop" 
                   className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-1000"
                   alt="Modern Travel"
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
                 <div className="absolute bottom-10 left-10 text-white">
                   <p className="text-sm font-bold text-sky-400 uppercase tracking-widest mb-2">Giao diện người dùng</p>
                   <p className="text-3xl font-black tracking-tighter">Trải nghiệm không giới hạn.</p>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Footer */}
      <footer className="bg-white border-t border-slate-100 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
            {/* Branding */}
            <div className="lg:col-span-1">
              <Link href="/" className="text-3xl font-black tracking-tighter text-indigo-600 mb-6 block">
                TRAVEL<span className="text-sky-400">.</span>
              </Link>
              <p className="text-slate-500 font-medium leading-relaxed mb-8">
                Chúng tôi không chỉ bán tour, chúng tôi kiến tạo những kỷ niệm hành trình đáng nhớ bậc nhất Việt Nam.
              </p>
              <div className="flex gap-4">
                <SocialIcon icon={<Globe className="w-5 h-5"/>} />
                <SocialIcon icon={<Mail className="w-5 h-5"/>} />
                <SocialIcon icon={<Phone className="w-5 h-5"/>} />
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-8 text-black">Hành trình</h4>
              <ul className="space-y-4">
                <FooterLink href="#">Tour nổi bật</FooterLink>
                <FooterLink href="#">Địa điểm khám phá</FooterLink>
                <FooterLink href="#">Hướng dẫn địa phương</FooterLink>
                <FooterLink href="#">Cẩm nang du lịch</FooterLink>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-8 text-black">Công ty</h4>
              <ul className="space-y-4">
                <FooterLink href="#">Về chúng tôi</FooterLink>
                <FooterLink href="#">Cộng đồng</FooterLink>
                <FooterLink href="#">Liên hệ</FooterLink>
                <FooterLink href="#">Việc làm</FooterLink>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-8 text-black">Văn phòng</h4>
              <p className="text-slate-500 font-medium text-sm leading-relaxed mb-4">
                123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh
              </p>
              <p className="text-slate-500 font-medium text-sm">
                hotline@travel.vn <br />
                +84 123 456 789
              </p>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-50 flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              &copy; 2026 TRAVEL. ALL RIGHTS RESERVED.
            </p>
            <div className="flex gap-8">
              <Link href="#" className="text-[10px] font-bold text-slate-400 hover:text-slate-900 uppercase tracking-widest">Điều khoản</Link>
              <Link href="#" className="text-[10px] font-bold text-slate-400 hover:text-slate-900 uppercase tracking-widest">Riêng tư</Link>
              <Link href="#" className="text-[10px] font-bold text-slate-400 hover:text-slate-900 uppercase tracking-widest">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Helper Components
function FeatureItem({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="group flex gap-6">
      <div className="w-14 h-14 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-center text-sky-400 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all duration-500 shrink-0 shadow-lg">
        {icon}
      </div>
      <div>
        <h4 className="text-lg font-black text-white mb-2 tracking-tight group-hover:text-sky-400 transition-colors uppercase tracking-widest text-sm">{title}</h4>
        <p className="text-slate-400 text-sm leading-relaxed max-w-sm">{desc}</p>
      </div>
    </div>
  );
}

function SocialIcon({ icon }: { icon: React.ReactNode }) {
  return (
    <Link href="#" className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-indigo-600 hover:text-white transition-all shadow-sm active:scale-90">
      {icon}
    </Link>
  );
}

function FooterLink({ href, children }: { href: string, children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-slate-500 font-bold text-sm hover:text-indigo-600 hover:translate-x-1 inline-block transition-all tracking-tight">
        {children}
      </Link>
    </li>
  );
}