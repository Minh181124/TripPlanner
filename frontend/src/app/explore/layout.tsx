'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/features/auth';
import { 
  Compass, 
  Map, 
  User, 
  LogOut, 
  PlusCircle, 
  LayoutDashboard,
  Bell,
  Search,
  MessageSquare,
  Heart,
  Globe,
  Settings,
  Mail,
  Navigation
} from 'lucide-react';

export default function SocialLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[#0f1115] text-slate-200 selection:bg-indigo-500/30">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" />
      </div>

      {/* Top Navbar - Glassmorphism */}
      <nav className="fixed top-0 left-0 right-0 h-20 bg-[#161b22]/70 backdrop-blur-2xl border-b border-white/5 z-50">
        <div className="max-w-[1600px] mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-16">
            {/* Logo */}
            <Link href="/explore" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:rotate-12 transition-transform">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-black tracking-tighter text-white">GlobeTrotter</span>
            </Link>

            {/* Search Bar - Mockup Style */}
            <div className="hidden lg:flex w-[500px]">
              <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                  type="text" 
                  placeholder="Search itineraries, places, travelers..."
                  className="w-full pl-11 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-slate-200 placeholder:text-slate-500 focus:bg-white/10 focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-5">
            <button className="relative p-2.5 text-slate-400 hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full border-2 border-[#161b22]" />
            </button>
            <button className="p-2.5 text-slate-400 hover:text-white transition-colors">
              <MessageSquare className="w-5 h-5" />
            </button>
            
            <div className="w-px h-6 bg-white/10 mx-2" />

            <div className="flex items-center gap-3 pl-2">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-white leading-none mb-1">{user?.ten || 'Alex R.'}</p>
                <div className="flex items-center justify-end gap-1.5">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Online</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl border-2 border-white/10 p-0.5">
                <img 
                  src={user?.avatar || "https://i.pravatar.cc/150?u=alex"} 
                  className="w-full h-full rounded-lg object-cover" 
                  alt="Profile"
                />
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-[1600px] mx-auto px-6 pt-24 flex gap-8">
        {/* Social Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0 h-[calc(100vh-120px)] sticky top-24 overflow-y-auto pr-4 scrollbar-hide">
          <div className="space-y-8">
            <nav className="space-y-1">
              <SidebarLink href="/dashboard" icon={<LayoutDashboard />} label="Dashboard" />
              <SidebarLink href="/explore" icon={<Navigation />} label="Feed" active />
              <SidebarLink href="/dashboard/user-trips" icon={<Map />} label="My Trips" />
              <SidebarLink href="#" icon={<Globe />} label="Map" />
              <SidebarLink href="#" icon={<Compass />} label="Explore" />
              <SidebarLink href="#" icon={<Heart />} label="Community" />
              <SidebarLink href="#" icon={<Mail />} label="Messages" />
            </nav>

            <div>
              <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 pl-4">Popular Destinations</h3>
              <div className="space-y-4">
                <DestinationItem country="Japan" flag="🇯🇵" cities={['Japan', 'Kyoto', 'Tokyo']} />
                <DestinationItem country="Vietnam" flag="🇻🇳" cities={['Vietnam', 'Da Lat', 'Hanoi']} />
                <DestinationItem country="Italy" flag="🇮🇹" cities={['Italy', 'Rome', 'Amalfi']} />
              </div>
            </div>
          </div>
        </aside>

        {/* Feed Content */}
        <main className="flex-1 min-w-0 pb-12">
          {children}
        </main>
      </div>
    </div>
  );
}

function SidebarLink({ href, icon, label, active = false }: { href: string, icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <Link 
      href={href} 
      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
        active 
          ? 'bg-white/10 text-white shadow-lg shadow-black/20' 
          : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'
      }`}
    >
      {React.cloneElement(icon as React.ReactElement<any>, { className: 'w-5 h-5' })}
      {label}
    </Link>
  );
}

function DestinationItem({ country, flag, cities }: { country: string, flag: string, cities: string[] }) {
  return (
    <div className="px-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base">{flag}</span>
        <span className="text-sm font-bold text-slate-300">{country}</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {cities.map((city, idx) => (
          <div key={idx} className="space-y-1 group cursor-pointer">
            <div className="aspect-square bg-slate-800 rounded-lg overflow-hidden border border-white/5 group-hover:border-indigo-500/50 transition-colors">
              <img 
                src={`https://images.unsplash.com/photo-${1500000000000 + idx}?q=80&w=100&auto=format&fit=crop`} 
                className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" 
                alt={city} 
              />
            </div>
            <p className="text-[10px] font-medium text-slate-500 text-center group-hover:text-slate-300 truncate">{city}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
