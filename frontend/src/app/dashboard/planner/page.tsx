'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { MultiDayPlanner } from '@/components/MultiDayPlanner';
import { CreateItineraryModal } from '@/components/CreateItineraryModal';
import { useItinerary } from '@/features/itinerary';

export default function PlannerPage() {
  const searchParams = useSearchParams();
  const [showModal, setShowModal] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { resetItinerary, initializeItinerary, loadItinerary } = useItinerary();
  // Temporarily disabled passing id to planner
  // const idParam = searchParams.get('id');
  // const editId = idParam ? parseInt(idParam, 10) : undefined;

  const handleCreateFromScratch = () => {
    resetItinerary();
    initializeItinerary(1, '');
    setShowModal(false);
  };

  const handleLoadFromSample = (itineraryData: any) => {
    // The itineraryData should come from the backend already mapped
    loadItinerary(itineraryData);
    setShowModal(false);
  };

  return (
    <>
      <CreateItineraryModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onCreateFromScratch={handleCreateFromScratch}
        onLoadFromSample={handleLoadFromSample}
        isLoading={isLoading}
      />
      <MultiDayPlanner editId={undefined} />
    </>
  );
}
