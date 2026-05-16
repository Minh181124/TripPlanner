'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth';
import { Loader2 } from 'lucide-react';

/**
 * Root Page - Entry point of the application.
 * Redirects to Social Feed if logged in, otherwise to Login.
 */
export default function RootPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.push('/explore');
      } else {
        router.push('/login');
      }
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center">
      <div className="relative">
        <div className="w-20 h-20 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
        <Loader2 className="w-10 h-10 text-indigo-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      </div>
      <h1 className="mt-8 text-2xl font-black text-white tracking-tight">Travel Planner</h1>
      <p className="mt-2 text-slate-400 font-medium">Đang chuẩn bị hành trình của bạn...</p>
    </div>
  );
}