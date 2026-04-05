'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/features/auth';
import { Menu, X, User, LogOut, ChevronDown } from 'lucide-react';

export function HomeNavbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? 'bg-white/80 backdrop-blur-lg shadow-sm py-3' 
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link 
          href="/" 
          className={`text-2xl font-black tracking-tighter transition-colors ${
            isScrolled ? 'text-indigo-600' : 'text-white'
          }`}
        >
          TRAVEL<span className="text-sky-400">.</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          {['Khám phá', 'Địa điểm', 'Local Guides', 'Lịch trình'].map((item) => (
            <Link
              key={item}
              href="#"
              className={`text-sm font-bold transition-all hover:scale-105 ${
                isScrolled ? 'text-slate-600 hover:text-indigo-600' : 'text-white/90 hover:text-white'
              }`}
            >
              {item}
            </Link>
          ))}
        </div>

        {/* Auth Buttons / User Menu */}
        <div className="hidden md:flex items-center gap-4">
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className={`flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-full border transition-all ${
                  isScrolled 
                    ? 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100' 
                    : 'border-white/20 bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <span className="text-xs font-bold uppercase tracking-wider">{user?.ten?.split(' ')[0] || 'User'}</span>
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-[10px] font-bold text-white">
                  {user?.ten?.[0] || 'U'}
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <Link href="/dashboard" className="flex items-center gap-3 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                    <User className="w-4 h-4" /> Dashboard
                  </Link>
                  <button 
                    onClick={() => logout()}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-slate-50 mt-1"
                  >
                    <LogOut className="w-4 h-4" /> Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className={`text-sm font-bold px-4 py-2 transition-colors ${
                  isScrolled ? 'text-slate-600 hover:text-indigo-600' : 'text-white/90 hover:text-white'
                }`}
              >
                Đăng nhập
              </Link>
              <Link
                href="/register"
                className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-full hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 transition-all active:scale-95"
              >
                Bắt đầu ngay
              </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen 
            ? <X className={isScrolled ? 'text-slate-900' : 'text-white'} /> 
            : <Menu className={isScrolled ? 'text-slate-900' : 'text-white'} />
          }
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-slate-100 p-6 space-y-4 animate-in slide-in-from-top-5 duration-300 shadow-2xl">
          {['Khám phá', 'Địa điểm', 'Local Guides', 'Lịch trình'].map((item) => (
            <Link key={item} href="#" className="block text-lg font-bold text-slate-800">{item}</Link>
          ))}
          <hr className="border-slate-100" />
          {!isAuthenticated ? (
            <div className="grid grid-cols-2 gap-4">
              <Link href="/login" className="px-6 py-3 border border-slate-200 rounded-xl text-center font-bold text-slate-800">Đăng nhập</Link>
              <Link href="/register" className="px-6 py-3 bg-indigo-600 rounded-xl text-white text-center font-bold">Tham gia</Link>
            </div>
          ) : (
            <Link href="/dashboard" className="block text-center py-3 bg-slate-100 rounded-xl font-bold">Dashboard của tôi</Link>
          )}
        </div>
      )}
    </nav>
  );
}
