'use client';

import { SampleTripPlanner } from '@/components/SampleTripPlanner';
import { useAuth } from '@/features/auth';

export default function CreateSampleTripPage() {
  const { user } = useAuth();
  const isAdmin = user?.vaitro === 'admin';

  return <SampleTripPlanner isAdmin={isAdmin} />;
}
