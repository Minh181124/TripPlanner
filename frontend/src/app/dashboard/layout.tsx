import type { Metadata } from 'next';
import { DashboardLayout } from '@/components/DashboardLayout';

export const metadata: Metadata = {
  title: 'Dashboard - Travel Planner',
  description: 'Trang tổng quan bảng điều khiển Travel Planner',
};

export default function Dashboard({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
