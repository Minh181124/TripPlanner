'use client';

import { useSearchParams } from 'next/navigation';
import { MultiDayPlanner } from '@/components/MultiDayPlanner';

export default function PlannerPage() {
  const searchParams = useSearchParams();
  // Temporarily disabled passing id to planner
  // const idParam = searchParams.get('id');
  // const editId = idParam ? parseInt(idParam, 10) : undefined;
  
  return <MultiDayPlanner editId={undefined} />;
}
