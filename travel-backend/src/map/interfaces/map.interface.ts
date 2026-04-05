export class Coordinate {
  lat: number;
  lng: number;
}

export interface RouteSummary {
  distance: number;
  duration: number;
  distanceText: string;
  durationText: string;
  overviewPolyline: string;
}
