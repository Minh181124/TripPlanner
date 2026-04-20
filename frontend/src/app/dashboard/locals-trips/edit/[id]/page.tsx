'use client';

import { useParams } from 'next/navigation';
import { SampleTripPlanner } from '@/components/SampleTripPlanner';

export default function LocalEditSampleTripPage() {
  const params = useParams();
  const id = params?.id ? parseInt(String(params.id)) : undefined;

  return <SampleTripPlanner editId={id} isAdmin={false} />;
}
