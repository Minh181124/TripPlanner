'use client';

import { useParams } from 'next/navigation';
import { SampleTripPlanner } from '@/components/SampleTripPlanner';
import { useAuth } from '@/features/auth';

export default function EditSampleTripPage() {
  const params = useParams();
  const { user } = useAuth();
  const id = params?.id ? parseInt(String(params.id)) : undefined;
  const isAdmin = user?.vaitro === 'admin';

  return <SampleTripPlanner editId={id} isAdmin={isAdmin} />;
}
