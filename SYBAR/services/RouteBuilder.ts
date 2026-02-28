import {
  OptimizedDriveRoute,
  OptimizedRouteResult,
  OptimizedTransitSegment,
} from "@/services/RouteOptimizer";
import { fetchRouteData } from "@/services/RouteService";
import {
  LatLng,
  MergedRouteResponse,
  RouteRequest,
  RouteResponse,
} from "@/types/routes";

// ── Transform helpers ─────────────────────────────────────────────────────────
// For DRIVE & TWO_WHEELER
const buildDriveRequest = (
  route: OptimizedDriveRoute,
  mode: "DRIVE" | "TWO_WHEELER",
  departureTime: Date | null,
): RouteRequest => ({
  origin: route.origin,
  destination: route.destination,
  stops: route.stops.length > 0 ? route.stops : undefined,
  travelMode: mode,
  departureTime: departureTime,
  languageCode: "en-US",
});

// For TRANSIT
const buildTransitRequest = (
  segment: OptimizedTransitSegment,
  departureTime: Date | null,
): RouteRequest => ({
  origin: segment.origin,
  destination: segment.destination,
  travelMode: "TRANSIT",
  departureTime: departureTime,
  languageCode: "en-US",
});

// ── Merge multiple RouteResponses into one (for TRANSIT chaining) ─────────────
const mergeRouteResponses = (
  responses: RouteResponse[],
  allStopCoordinates: LatLng[],
): MergedRouteResponse => {
  return {
    // Flatten all coordinate arrays into one continuous polyline path
    routeCoord: responses.flatMap((r) => r.routeCoord),

    // Sum up total distance and duration across all segments
    distanceKm: responses.reduce((sum, r) => sum + r.distanceKm, 0),
    durationMins: responses.reduce((sum, r) => sum + r.durationMins, 0),

    // Only include staticDurationMins if all segments have it
    staticDurationMins: responses.every((r) => r.staticDurationMins != null)
      ? responses.reduce((sum, r) => sum + (r.staticDurationMins ?? 0), 0)
      : undefined,

    // Concatenate all legs from every segment into a flat list
    legs: responses.flatMap((r) => r.legs),

    allStopCoordinates,
    polyline: "", // raw encoded polyline not used after merging — coordinates drives rendering
  };
};

// ── Build allStopCoordinates from the optimized result ────────────────────────
// Used to place the numbered markers on the map

const buildAllStopCoordinates = (result: OptimizedRouteResult): LatLng[] => {
  if (result.mode === "TRANSIT") {
    // For TRANSIT: origin of first segment + destination of every segment
    return [
      result.segments[0].origin,
      ...result.segments.map((s) => s.destination),
    ];
  } else {
    // For DRIVE/TWO_WHEELER: origin + stops + destination
    return [
      result.route.origin,
      ...result.route.stops,
      result.route.destination,
    ];
  }
};

// ── Main export ───────────────────────────────────────────────────────────────
export const buildAndFetchRoute = async (
  optimizedResult: OptimizedRouteResult,
  departureTime: Date | null,
): Promise<MergedRouteResponse> => {
  const allStopCoordinates = buildAllStopCoordinates(optimizedResult);

  if (optimizedResult.mode === "TRANSIT") {
    // Build one RouteRequest per segment
    const requests: RouteRequest[] = optimizedResult.segments.map((seg) =>
      buildTransitRequest(seg, departureTime),
    );

    // Fire all TRANSIT segment requests in parallel, preserving order
    const responses: RouteResponse[] = await Promise.all(
      requests.map((req) => fetchRouteData(req)),
    );

    return mergeRouteResponses(responses, allStopCoordinates);
  } else {
    // DRIVE or TWO_WHEELER — single API call
    const request = buildDriveRequest(
      optimizedResult.route,
      optimizedResult.mode,
      departureTime,
    );

    const response = await fetchRouteData(request);

    // Wrap in MergedRouteResponse shape for consistency with TRANSIT
    return {
      routeCoord: response.routeCoord,
      distanceKm: response.distanceKm,
      durationMins: response.durationMins,
      staticDurationMins: response.staticDurationMins,
      legs: response.legs,
      allStopCoordinates,
      polyline: response.polyline,
    };
  }
};
