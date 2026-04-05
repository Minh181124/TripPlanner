'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';

/**
 * Dashboard Layout - Wraps all dashboard pages with Sidebar and Header
 * Provides authentication guard and responsive layout
 */
export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  /**
   * Redirect to login if not authenticated
   */
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen bg-slate-50">
        {/* Sidebar Skeleton */}
        <div className="hidden lg:flex w-64 bg-slate-900 p-4">
          <div className="space-y-4 w-full">
            <div className="h-8 bg-slate-700 rounded animate-pulse w-3/4"></div>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 bg-slate-700 rounded animate-pulse"></div>
            ))}
          </div>
        </div>

        {/* Main Content Skeleton */}
        <div className="flex-1 flex flex-col">
          {/* Header Skeleton */}
          <div className="h-16 bg-white border-b border-slate-200 p-4 flex gap-4">
            <div className="h-6 bg-slate-200 rounded animate-pulse flex-1 max-w-xs"></div>
            <div className="flex gap-2">
              <div className="h-8 w-8 bg-slate-200 rounded animate-pulse"></div>
              <div className="h-8 w-8 bg-slate-200 rounded animate-pulse"></div>
            </div>
          </div>

          {/* Content Skeleton */}
          <div className="flex-1 p-6 overflow-auto">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-12 bg-slate-200 rounded animate-pulse"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar - Fixed on desktop, toggle on mobile */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:ml-64">
        {/* Header */}
        <Header />

        {/* Page Content */}
        <main className="flex-1 overflow-auto pt-16">
          <div className="p-6 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
