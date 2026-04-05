'use client';

import { Suspense } from 'react';
import { PlaceSelector } from '@/features/map';

export default function PlacesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-600">Đang tải...</p>
          </div>
        </div>
      }
    >
      <PlaceSelector />
    </Suspense>
  );
}
