export interface LatLng {
  latitude: number;
  longitude: number;
}

export interface LocationData {
  coordinates: LatLng;
  name?: string;
  formattedAddress?: string;
}

export interface RouteRequest {
  origin: LatLng;
  destination: LatLng;
  stops?: LatLng[];
  travelMode: "DRIVE" | "TWO_WHEELER" | "TRANSIT";
  departureTime?: Date | null;
  languageCode?: "en-US";
}

export interface NavigationInstruction {
  maneuver: string;
  instructions: string;
}

export interface RouteLegStep {
  distanceMeters?: number;
  navigationInstruction?: NavigationInstruction; // nested, not flat
}

export interface RouteLeg {
  distanceMeters?: number;
  duration?: string;
  staticDuration?: string;
  startLocation?: { latLng: LatLng };
  endLocation?: { latLng: LatLng };
  steps: RouteLegStep[];
}

export interface RouteResponse {
  polyline: string;
  distanceKm: number;
  durationMins: number;
  staticDurationMins?: number; // Time without traffic
  legs: RouteLeg[];
  routeCoord: LatLng[];
  allStopCoordinates: LatLng[]; // origin + intermediates + destination in order
}

export interface MergedRouteResponse {
  polyline: string; // not used for display — coordinates is used instead
  distanceKm: number; // sum of all segments
  durationMins: number; // sum of all segments
  staticDurationMins?: number;
  legs: RouteLeg[]; // all legs across all segments concatenated
  routeCoord: LatLng[]; // chained across all segments
  allStopCoordinates: LatLng[];
}
