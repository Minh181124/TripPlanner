/**
 * features/map/index.ts — Public API của Map Feature
 *
 * QUY TẮC: Mọi import từ map feature ở bên ngoài PHẢI đi qua file này.
 *
 * @example
 * import { PlannerMap, PlaceSelector, useRoutePreview } from '@/features/map';
 */

// Components
export { default as PlannerMap } from './components/PlannerMap';
export type { PlannerMapProps } from './components/PlannerMap';
export { PlaceSelector } from './components/PlaceSelector';

// Hooks
export { useRoutePreview } from './hooks/useRoutePreview';
