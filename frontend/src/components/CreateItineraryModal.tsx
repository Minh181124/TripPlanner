'use client';

import React, { useState } from 'react';
import { Compass, BookOpen, X } from 'lucide-react';
import { SampleItinerarySelector } from './SampleItinerarySelector';
import type { MultiDayItinerary } from '@/features/itinerary';

interface CreateItineraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateFromScratch: () => void;
  onLoadFromSample: (itineraryData: MultiDayItinerary) => void;
  isLoading?: boolean;
}

export function CreateItineraryModal({
  isOpen,
  onClose,
  onCreateFromScratch,
  onLoadFromSample,
  isLoading = false,
}: CreateItineraryModalProps) {
  const [step, setStep] = useState<'choose' | 'select-sample'>('choose');
  const [isSelecting, setIsSelecting] = useState(false);

  const handleCreateFromScratch = () => {
    setStep('choose');
    onCreateFromScratch();
  };

  const handleSampleSelected = (itineraryData: MultiDayItinerary) => {
    setStep('choose');
    onLoadFromSample(itineraryData);
  };

  const handleBackToChoose = () => {
    setStep('choose');
    setIsSelecting(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-2xl rounded-lg bg-white shadow-xl">
        {step === 'choose' && !isSelecting ? (
          <>
            {/* Header */}
            <div className="flex items-start justify-between border-b border-gray-200 px-6 py-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Bắt đầu hành trình của bạn</h2>
                <p className="mt-1 text-sm text-gray-600">
                  Chọn cách bạn muốn bắt đầu lên kế hoạch cho chuyến đi
                </p>
              </div>
              <button
                onClick={onClose}
                className="rounded p-1 hover:bg-gray-100 transition-colors flex-shrink-0"
                aria-label="Đóng"
              >
                <X className="h-6 w-6 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-8">
              <div className="grid grid-cols-2 gap-4">
                {/* Option 1: Create from Scratch */}
                <button
                  onClick={handleCreateFromScratch}
                  disabled={isLoading}
                  className="group relative flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 px-6 py-8 transition-all hover:border-purple-500 hover:shadow-lg disabled:opacity-50"
                >
                  <div className="rounded-full bg-purple-200 p-4 group-hover:bg-purple-300">
                    <Compass className="h-6 w-6 text-purple-700" />
                  </div>
                  <div className="text-center">
                    <h3 className="font-bold text-gray-900">Tạo từ đầu</h3>
                    <p className="text-sm text-gray-600">(Trang trắng)</p>
                  </div>
                </button>

                {/* Option 2: Select Sample */}
                <button
                  onClick={() => setIsSelecting(true)}
                  disabled={isLoading}
                  className="group relative flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 px-6 py-8 transition-all hover:border-blue-500 hover:shadow-lg disabled:opacity-50"
                >
                  <div className="rounded-full bg-blue-200 p-4 group-hover:bg-blue-300">
                    <BookOpen className="h-6 w-6 text-blue-700" />
                  </div>
                  <div className="text-center">
                    <h3 className="font-bold text-gray-900">Dùng lịch trình mẫu</h3>
                    <p className="text-sm text-gray-600">(Tiết kiệm thời gian)</p>
                  </div>
                </button>
              </div>
            </div>
          </>
        ) : null}

        {isSelecting && (
          <div className="px-6 py-8 max-h-96 overflow-y-auto">
            <SampleItinerarySelector
              onSampleSelected={handleSampleSelected}
              onBack={handleBackToChoose}
            />
          </div>
        )}
      </div>
    </div>
  );
}
